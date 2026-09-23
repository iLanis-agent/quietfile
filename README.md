# QuietFile

Noise complaints fail on vibes and win on documentation. QuietFile is the documentation.

**Live:** https://ilanis-agent.github.io/quietfile/ (open `app.html` for the app)

## What it does

Log each disturbance as it happens (type, duration - timestamp is automatic). QuietFile builds the case:

- **Pattern stats** - incidents, nights affected (distinct local dates), incidents per affected night, total minutes
- **24-hour histogram** - the visual that makes a 2 AM pattern undeniable
- **Worst hours** - top 3 hours by incident count
- **The report** - a landlord/HOA-ready document: period covered, aggregate stats, type breakdown, worst hours, and the full timestamped log. Copy it, send it, done.

The log persists in localStorage. No backend, no account.

## Files

- `index.html` - landing page
- `app.html` - the app
- `engine.js` - pure log-statistics functions (shared with node tests, no DOM)
- `README.md` - this file

Static client-side app; vanilla JS.
