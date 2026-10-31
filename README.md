# Solo Tools Lab

Live at: https://dangdh1996.github.io/revision-ledger-app/

Two free, working, browser-only applications for an experimental one-founder digital business:

## 1. Revision Ledger (B2B)
https://dangdh1996.github.io/revision-ledger-app/revision-ledger/

Freelancers and small agencies record scope and extra client changes. Includes project settings, revision classifications, estimated billable amounts, editable status, CSV export, JSON backup/import, PDF via browser print, and a client-email draft.

## 2. 10-Ball Ghost Journal (B2C)
https://dangdh1996.github.io/revision-ledger-app/ten-ball/

Track 10-ball ghost sessions, win/loss, break success, training trends and practice days. Includes CSV export, JSON backup/import and print-to-PDF.

## Architecture
- Static HTML, CSS, vanilla JS (no external dependencies or paid services).
- GitHub Pages is configured to serve `main` branch from repository root.
- Data is stored exclusively in browser localStorage. No database, account, server API, payments, or analytics yet.
- Website paths: `/index.html`, `/revision-ledger/`, `/ten-ball/`, `/privacy.html`.

## Operating costs
- Hosting: GitHub Pages Free (public repo, subject to GitHub policies and usage limits).
- AI inference: $0 (no runtime AI calls).
- Domain: $0 (github.io subpath).
- Payment processing: not connected; products currently free. No sales or payment capture until merchant onboarding is completed.

## Important limitations
- Storage is per browser/device. Encourage users to export backups.
- The revision ledger is a record-keeping estimate, not legal/contract/accounting advice.
- The 10-ball journal is manual entry, not automated performance analysis.
- Do not claim paid subscriptions or customers until real transactions occur.

## Post-launch roadmap
1. Add a real merchant-of-record checkout after an owner-verified merchant account and compliant policies.
2. Identify one premium feature per product and gate it server-side (not by editing client JS only).
3. Add privacy-respecting aggregate usage analytics if needed and revise the privacy policy first.
4. Improve usability using real feedback and small batches of verified bug reports.
5. Run legitimate organic launch campaigns (avoid unsolicited bulk messaging).

## QA
Live browser smoke-tested 31 Oct 2026:
- Revision Ledger: 2 extra hours at $50/hour = $100 potential extra; persisted after reload.
- 10-Ball: 3/10 ghost racks = 30% win rate; 4/10 breaks = 40%; persisted after reload.
- No JS console errors observed during smoke test.

Contact: doihaidang@gmail.com
