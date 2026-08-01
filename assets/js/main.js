// Dynamic Schedule Fetcher using a CORS proxy for reliable loading
let masterScheduleData = [];

async function loadMasterSchedule() {
    const rawCsvURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTdl0DfPH_EVGwxqTB7t-XB4HNi1GOwUV-KUXbmUAXzbRr_HLHswxlnPhLFpVyfdr6IE3SLU5ZfcO4w/pub?output=csv';
    // Wrap the CSV URL in a public CORS proxy
    const proxyURL = `https://api.allorigins.win/get?url=${encodeURIComponent(rawCsvURL)}`;
    const tbody = document.getElementById('scheduleBody');

    try {
        const response = await fetch(proxyURL);
        const json = await response.json();
        const csvText = json.contents;
        
        masterScheduleData = parseCSV(csvText);
        renderScheduleTable(masterScheduleData);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #DC2626; padding: 2rem;">Failed to load live schedule data.</td></tr>`;
        }
    }
}

// Simple CSV to JSON parser helper
function parseCSV(text) {
    let lines = text.split('\n').filter(line => line.trim() !== '');
    let headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    let result = [];

    for (let i = 1; i < lines.length; i++) {
        let currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        let obj = {};
        for (let j = 0; j < headers.length; j++) {
            let val = currentline[j] !== undefined ? currentline[j].trim() : '';
            obj[headers[j]] = val.replace(/^"|"$/g, '');
        }
        result.push(obj);
    }
    return result;
}

function renderScheduleTable(data) {
    const tbody = document.getElementById('scheduleBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    data.forEach(item => {
        let badgeClass = 'badge-race';
        let displayCategory = item.Category || '';
        
        const catLower = (item.Category || '').toLowerCase();
        if (catLower === 'practice') {
            badgeClass = 'badge-practice';
        } else if (catLower === 'social') {
            badgeClass = 'badge-social';
        }

        const tr = document.createElement('tr');
        tr.setAttribute('data-category', catLower);
        tr.innerHTML = `
            <td><span class="badge ${badgeClass}">${displayCategory}</span></td>
            <td><strong>${item.EventName || ''}</strong></td>
            <td>${item.Location || ''}</td>
            <td>${item.Date || ''}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterSchedule(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active-filter');
    });
    if (event && event.target) {
        event.target.classList.add('active-filter');
    }

    const rows = document.querySelectorAll('#scheduleTable tbody tr');
    rows.forEach(row => {
        if (category === 'all' || row.getAttribute('data-category') === category) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Run schedule load if on schedule page
if (document.getElementById('scheduleBody')) {
    window.addEventListener('DOMContentLoaded', loadMasterSchedule);
}