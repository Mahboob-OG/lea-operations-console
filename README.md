# lea-operations-console
A local-first law enforcement operations dashboard for case intake, evidence logging, task tracking, audit trails, and supervisor reports using browser-based storage.
# LEA Operations Console

A local browser demo for lawful case intake and operational coordination.
A local-first operations dashboard for law-enforcement-style administrative workflows. It helps teams manage case intake, priority scoring, evidence logs, follow-up tasks, audit history, and supervisor-ready reports from a browser-based interface.

## What it does
> This project is a demo system for lawful case administration and operational documentation. It does not include surveillance, hacking, exploitation, or intelligence-gathering capabilities.

## Features

- Case intake with transparent priority scoring
- Case queue with assignment, review, and closure states
- Evidence ledger with chain-of-custody notes
- Follow-up task board
- Dashboard metrics and status chart
- Supervisor operational brief
- Audit trail
- JSON export and print-friendly report
- Dashboard metrics for cases, urgent items, evidence, and tasks
- Case queue with assignment, review, and closure workflows
- Case workspace with notes, linked evidence, linked tasks, and directory records
- Evidence ledger with chain-of-custody style notes
- Follow-up task board with status progression
- People and entities directory for reporters, witnesses, units, agencies, and organizations
- Audit trail for important actions
- Supervisor operational brief generation
- JSON export for backup or handoff
- Print-friendly report view
- Browser-based local storage with IndexedDB/localStorage support

## How to run
## Tech Stack

Open the folder in a static server and browse to the app:
- HTML5
- CSS3
- Vanilla JavaScript
- IndexedDB for browser-side database storage
- localStorage fallback/mirror
- No external frameworks or build tools required

## Project Structure

```text
law-enforcement-intake-dashboard/
├── index.html
├── README.md
├── assets/
│   └── styles.css
└── src/
    ├── app.js
    └── db.js
```

## Getting Started

Run the project with any static file server.

Using Python:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```
http://127.0.0.1:4173/
```

## Demo workflow
## Demo Workflow

1. Click `Load demo data`.
2. Open `Cases` and inspect the case queue.
3. Open a case workspace and add a note.
4. Add evidence linked to a case.
5. Add tasks and move them across the board.
6. Open `Reports` for the generated operational brief.
7. Use `Export JSON` to download the full local dataset.
2. Open the `Dashboard` to review case metrics and recent activity.
3. Go to `Cases` and inspect the case queue.
4. Open a case workspace and review notes, evidence, tasks, and linked people/entities.
5. Add a new case from the intake form.
6. Add evidence linked to a case from the `Evidence` view.
7. Add and advance follow-up tasks in the `Tasks` view.
8. Add reporters, witnesses, units, or partner agencies in the `People` view.
9. Generate an operational brief from the `Reports` view.
10. Export a JSON backup from the top action bar.

## Priority Scoring

The app calculates a case priority score using a simple, explainable model:

- Base score: 20
- Missing person case: +15
- Immediate welfare or safety risk: +30
- Vulnerable person involved: +20
- Time-sensitive evidence: +15
- Verifiable details provided: +5

Priority labels:

- `Urgent`: 80-100
