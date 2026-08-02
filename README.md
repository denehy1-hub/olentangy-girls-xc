# Olentangy Girls Cross Country (XC) Web Application

Official web presence and logistical hub for the Olentangy Girls Cross Country team, managed by the athletic booster organization.

## Architecture
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (`assets/js/main.js`)
* **Data Sources:** JSON-driven architecture (`assets/data/`) managing team rosters, schedules, and board member directories[cite: 1].
* **Automation:** Python-powered GitHub Actions workflow (`.github/workflows/schedule_sync.yaml`) that automatically updates calendar sync data (`schedule.ics`, `schedule.json`)[cite: 1].

## Local Development
1. Clone the repository[cite: 1]:
   ```bash
   git clone [https://github.com/](https://github.com/)[org]/olentangy-girls-xc.git