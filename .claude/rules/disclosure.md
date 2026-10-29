# AI disclosure (always loaded)

Mandatory for every brand and every project. Full table and label texts: `brand/_default/DISCLOSURE.md`.

- Any AI-generated or AI-edited visual a viewer could take for real (cleaned photo, staged room, generated camera
  move, generated B-roll shown as real, AI presenter) carries the `.ai-badge` label **for its whole on-screen time**.
  An AI voice is disclosed at the start, spoken or on screen. Generated music is listed in `DISCLOSURE.txt` only.
- The ledger (`ai-ledger.jsonl`) is the source of truth; `tools/deliver.mjs` turns it into `DISCLOSURE.txt`. An asset
  that is on screen but not in the ledger, or in the ledger but unlabeled, blocks delivery.
- Verify labels on frames extracted from the **rendered** file at the asset's start, middle and end; snapshots are
  not proof.
- Questions about whether or how to label, and any client request to drop a label, go to Slava. Never decide them
  silently and never treat them as a sub-decision of a build task.
- `projects/*/inputs/` originals are read-only: edited versions go to `ai/images/`, converted footage to `assets/`.
- No private names, phone numbers or exact addresses in a video unless the brief approves them explicitly.
