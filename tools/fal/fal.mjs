// Shared fal.ai client for the studio tools: queue API + polling, CDN uploads, downloads, a price table, a
// per-project append-only ledger (ai-ledger.jsonl) and an OPTIONAL spend cap.
//
// FAL_KEY comes from the environment, <project>/.env or <studio>/.env. It is never printed or logged.
// STUDIO_BUDGET_USD is optional. Empty (this studio's default) = no hard cap: every tool prints its estimate
// (--dry) and the agent waits for an explicit go before spending. Set a number to make the tools refuse past it.
//
//   node tools/fal/fal.mjs --project <dir>      print the project's ledger summary
import fs from "node:fs";
import path from "node:path";
import { isMainModule, loadEnv, parseArgs, resolveProject, sleep, fmtUsd } from "../lib/studio.mjs";

// USD per call. Verified with the fal.ai pricing API / model pages on the dates noted (docs/FAL-ENDPOINTS.md).
// Estimates are rounded UP on purpose. Re-verify with the fal MCP (get_pricing) when a price looks stale.
const MP_BY_SIZE = { square_hd: 1.05, square: 0.27, portrait_4_3: 0.79, portrait_16_9: 0.59, landscape_4_3: 0.79, landscape_16_9: 0.59 };
const megapixels = (size) => {
  if (!size) return 0.79;
  if (typeof size === "string") return MP_BY_SIZE[size] || 1;
  return (Number(size.width || 1024) * Number(size.height || 1024)) / 1e6;
};
const perSec = (usd) => (i) => usd * Math.ceil(Number(i._seconds || i.duration || 5));
const perKChars = (usd) => (i) => usd * Math.max(0.05, String(i.text || "").length / 1000);
export const PRICES = {
  // images (2026-10-19)
  "fal-ai/nano-banana-pro/edit": (i) => ({ "1K": 0.15, "2K": 0.15, "4K": 0.3 }[i.resolution || "1K"] ?? 0.3) * (i.num_images || 1),
  "fal-ai/nano-banana-pro": (i) => ({ "1K": 0.15, "2K": 0.15, "4K": 0.3 }[i.resolution || "1K"] ?? 0.3) * (i.num_images || 1),
  "fal-ai/nano-banana-2/edit": (i) => ({ "0.5K": 0.06, "1K": 0.08, "2K": 0.12, "4K": 0.16 }[i.resolution || "1K"] ?? 0.16) * (i.num_images || 1),
  "fal-ai/flux/schnell": (i) => 0.003 * Math.max(1, megapixels(i.image_size)) * (i.num_images || 1),
  // image-to-video (2026-10-19)
  "fal-ai/kling-video/v2.5-turbo/pro/image-to-video": (i) => 0.07 * Number(i.duration || 5),
  "minimax/h3-max-turbo/image-to-video": (i) => ({ "480P": 0.015, "768P": 0.024, "1080P": 0.048 }[i.resolution || "768P"] ?? 0.048) * Number(i.duration || 5),
  // audio (2026-10-19)
  "fal-ai/stable-audio-25/text-to-audio": () => 0.2,
  "fal-ai/elevenlabs/sound-effects/v2": (i) => 0.002 * Number(i.duration_seconds || 5),
  "fal-ai/elevenlabs/speech-to-text/scribe-v2": (i) => 0.008 * Math.max(1, Number(i._minutes || 1)),
  "fal-ai/whisper": (i) => 0.0011 * 30 * Math.max(1, Number(i._minutes || 1)),
  // TTS, per 1,000 characters (2026-10-24)
  "elevenlabs/tts/eleven-v4": perKChars(0.08),
  "fal-ai/minimax/speech-2.8-hd": perKChars(0.10),
  // audio-driven avatars, per second of OUTPUT video; OmniHuman bills audio length rounded up plus one second (2026-10-24)
  "bytedance/omnihuman/v2": (i) => 0.105 * (Math.ceil(Number(i._seconds || 5)) + 1),
  "fal-ai/kling-video/ai-avatar/v2/pro": perSec(0.115),
  "fal-ai/kling-video/ai-avatar/v2/standard": perSec(0.0562),
  "fal-ai/heygen/avatar4/image-to-video": perSec(0.10),
  // video upscale, per second of input (2026-10-24)
  "fal-ai/topaz/upscale/video": perSec(0.01),
};
export const price = (endpoint, input) => (PRICES[endpoint] ? PRICES[endpoint](input || {}) : NaN);

export const MIME = { ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".mp4": "video/mp4", ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4", ".webm": "video/webm", ".mov": "video/quicktime" };

/** Replace data URIs with a size note so ledger lines stay small and never embed media. */
export function summarizeInput(input) {
  const out = {};
  const note = (v) => `<data-uri ${Math.round((v.length * 3) / 4 / 1024)} KB>`;
  for (const [k, v] of Object.entries(input || {})) {
    if (k.startsWith("_")) continue;
    if (typeof v === "string" && v.startsWith("data:")) out[k] = note(v);
    else if (Array.isArray(v)) out[k] = v.map((x) => (typeof x === "string" && x.startsWith("data:") ? note(x) : x));
    else out[k] = v;
  }
  return out;
}

export function dataUri(file) {
  const mime = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
  return `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`;
}

/** Everything a tool needs for one project: ledger, optional cap, key check and the API. */
export function studioFal(projectDir) {
  const PROJECT = path.resolve(projectDir);
  loadEnv(PROJECT);
  const LEDGER = path.join(PROJECT, "ai-ledger.jsonl");
  const capRaw = String(process.env.STUDIO_BUDGET_USD || "").trim();
  const BUDGET_USD = capRaw && Number.isFinite(Number(capRaw)) && Number(capRaw) > 0 ? Number(capRaw) : Infinity;
  const key = () => process.env.FAL_KEY;

  function readLedger() {
    const items = [];
    if (fs.existsSync(LEDGER)) {
      for (const line of fs.readFileSync(LEDGER, "utf8").split(/\r?\n/)) {
        if (!line.trim()) continue;
        try { items.push(JSON.parse(line)); } catch { /* skip a torn line */ }
      }
    }
    const total_usd = +items.reduce((s, i) => s + (Number(i.usd) || 0), 0).toFixed(4);
    return { total_usd, items };
  }
  const spent = () => readLedger().total_usd;
  const spentLine = () => `spent so far ${fmtUsd(spent())}${Number.isFinite(BUDGET_USD) ? ` of ${fmtUsd(BUDGET_USD)} cap` : " (no cap: estimate, then wait for a go)"}`;

  /** Throws only when a cap is configured and this call would exceed it. */
  function guard(estimate) {
    if (!Number.isFinite(BUDGET_USD)) return;
    const t = spent();
    if (t + estimate > BUDGET_USD + 1e-9) {
      throw new Error(`budget guard: this project already spent ${fmtUsd(t)}; adding ${fmtUsd(estimate)} exceeds the ${fmtUsd(BUDGET_USD)} cap (STUDIO_BUDGET_USD in .env). Raise or clear it only with an explicit OK from Slava.`);
    }
  }

  function record(item) {
    fs.mkdirSync(path.dirname(LEDGER), { recursive: true });
    const line = { at: new Date().toISOString(), ...item, input: summarizeInput(item.input) };
    fs.appendFileSync(LEDGER, JSON.stringify(line) + "\n");
    return readLedger().total_usd;
  }

  function requireKey() {
    if (!key()) throw new Error("FAL_KEY is missing. Put it in <studio>/.env (see .env.example). The key is never printed.");
  }

  const authHeaders = () => ({ Authorization: `Key ${key()}` });

  /**
   * Local file -> URL fal can fetch. Small files travel as data URIs; bigger ones are uploaded to the fal CDN
   * (same flow as @fal-ai/client). Returns the URL string. Never logs the key.
   */
  async function upload(file, { maxInline = 3 * 1024 * 1024 } = {}) {
    requireKey();
    const size = fs.statSync(file).size;
    if (size <= maxInline) return dataUri(file);
    const content_type = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
    try {
      const init = await fetch("https://rest.alpha.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3", {
        method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ content_type, file_name: path.basename(file) }),
      });
      if (!init.ok) throw new Error(`initiate HTTP ${init.status}: ${(await init.text()).slice(0, 300)}`);
      const { upload_url, file_url } = await init.json();
      const put = await fetch(upload_url, { method: "PUT", headers: { "Content-Type": content_type }, body: fs.readFileSync(file) });
      if (!put.ok) throw new Error(`PUT HTTP ${put.status}`);
      console.log(`[upload] ${path.basename(file)} (${Math.round(size / 1024)} KB) -> fal CDN`);
      return file_url;
    } catch (e) {
      if (size <= 40 * 1024 * 1024) { console.log(`[upload] CDN upload failed (${e.message}); sending ${path.basename(file)} inline`); return dataUri(file); }
      throw new Error(`upload of ${file} failed and it is too large to inline: ${e.message}`);
    }
  }

  /** Submit to the queue, poll until COMPLETED, return the result JSON. */
  async function run(endpoint, input, { label = endpoint, pollMs = 3000, timeoutMs = Number(process.env.FAL_QUEUE_TIMEOUT_MS || 20 * 60 * 1000) } = {}) {
    requireKey();
    const headers = { ...authHeaders(), "Content-Type": "application/json" };
    const body = {};
    for (const [k, v] of Object.entries(input)) if (!k.startsWith("_") && v !== undefined) body[k] = v;
    const sub = await fetch(`https://queue.fal.run/${endpoint}`, { method: "POST", headers, body: JSON.stringify(body) });
    if (!sub.ok) {
      const txt = (await sub.text()).slice(0, 800);
      const hint = sub.status === 422 ? ` (input rejected: check the field names with the fal MCP get_model_schema for ${endpoint} and fix the job file)` : sub.status === 402 ? " (fal balance is empty: top up at fal.ai)" : sub.status === 401 || sub.status === 403 ? " (FAL_KEY wrong or expired: replace it in .env)" : "";
      throw new Error(`${label}: submit HTTP ${sub.status}${hint}: ${txt}`);
    }
    const { request_id, status_url, response_url } = await sub.json();
    const t0 = Date.now();
    let last = "";
    for (;;) {
      await sleep(pollMs);
      const st = await fetch(`${status_url}?logs=0`, { headers });
      if (!st.ok) throw new Error(`${label}: status HTTP ${st.status}: ${(await st.text()).slice(0, 300)}`);
      const s = await st.json();
      if (s.status !== last) {
        const q = s.queue_position != null ? ` (queue ${s.queue_position})` : "";
        console.log(`[${label}] ${s.status}${q} +${Math.round((Date.now() - t0) / 1000)}s`);
        last = s.status;
      }
      if (s.status === "COMPLETED") break;
      if (Date.now() - t0 > timeoutMs) throw new Error(`${label}: timed out after ${Math.round((Date.now() - t0) / 1000)}s (request ${request_id})`);
    }
    const res = await fetch(response_url, { headers });
    if (!res.ok) throw new Error(`${label}: result HTTP ${res.status}: ${(await res.text()).slice(0, 800)}`);
    return res.json();
  }

  async function download(url, file) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`download HTTP ${r.status} for ${url.slice(0, 80)}`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
    return fs.statSync(file).size;
  }

  function summary() {
    const { total_usd, items } = readLedger();
    const byEndpoint = {};
    for (const i of items) byEndpoint[i.endpoint || "?"] = (byEndpoint[i.endpoint || "?"] || 0) + 1;
    return { project: PROJECT, ledger: LEDGER, budget_usd: Number.isFinite(BUDGET_USD) ? BUDGET_USD : null, spent_usd: total_usd, items: items.length, byEndpoint, hasKey: Boolean(key()) };
  }

  return { PROJECT, LEDGER, BUDGET_USD, AI_DIR: path.join(PROJECT, "ai"), hasKey: () => Boolean(key()), requireKey, price, readLedger, spent, spentLine, guard, record, run, upload, download, dataUri, summary };
}

if (isMainModule(import.meta.url)) {
  const { flags } = parseArgs(process.argv.slice(2));
  const fal = studioFal(resolveProject(flags));
  const s = fal.summary();
  console.log(`project : ${s.project}`);
  console.log(`ledger  : ${fs.existsSync(s.ledger) ? s.ledger : "(none yet)"}`);
  console.log(`spent   : ${fmtUsd(s.spent_usd)}${s.budget_usd ? ` of ${fmtUsd(s.budget_usd)} cap` : " (no cap)"} across ${s.items} call(s)`);
  console.log(`FAL_KEY : ${s.hasKey ? "set" : "MISSING (add it to .env)"}`);
  for (const [ep, n] of Object.entries(s.byEndpoint)) console.log(`  ${String(n).padStart(3)} x ${ep}`);
  const { items } = fal.readLedger();
  for (const i of items.slice(-8)) console.log(`  ${i.at.slice(0, 19)}  ${fmtUsd(i.usd).padStart(6)}  ${i.label || i.endpoint}  ->  ${i.out || ""}`);
}
