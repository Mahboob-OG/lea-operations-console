# LEA Operations Console

A local browser demo for lawful case intake and operational coordination.

## What it does

- Case intake with transparent priority scoring
- Case queue with assignment, review, and closure states
- Evidence ledger with chain-of-custody notes
- Follow-up task board
- Dashboard metrics and status chart
- Supervisor operational brief
- Audit trail
- JSON export and print-friendly report

## How to run

Open the folder in a static server and browse to the app:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4173/
```

## Demo workflow

1. Click `Load demo data`.
2. Open `Cases` and inspect the case queue.
3. Open a case workspace and add a note.
4. Add evidence linked to a case.
5. Add tasks and move them across the board.
6. Open `Reports` for the generated operational brief.
7. Use `Export JSON` to download the full local dataset.

All data is stored locally in browser storage for demo purposes.
