document.addEventListener('DOMContentLoaded', () => {
    // Mobile Hamburger Menu Toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }

    // Accordion Toggle Logic (for Parent Hub)
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            item.classList.toggle('active');
        });
    });
});

// Dynamic Schedule Fetcher (for schedule.html)
let masterScheduleData = [];

async function loadMasterSchedule() {
    const scriptURL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'; // Replace with your web app URL
    
    if (scriptURL.includes('YOUR_GOOGLE_APPS_SCRIPT')) {
        return; 
    }

    try {
        const response = await fetch(scriptURL);
        masterScheduleData = await response.json();
        renderScheduleTable(masterScheduleData);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        const tbody = document.getElementById('scheduleBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #DC2626; padding: 2rem;">Failed to load live schedule data.</td></tr>`;
        }
    }
}

function renderScheduleTable(data) {
    const tbody = document.getElementById('scheduleBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    data.forEach(item => {
        let badgeClass = 'badge-race';
        let displayCategory = item.Category;
        
        if (item.Category.toLowerCase() === 'practice') {
            badgeClass = 'badge-practice';
        } else if (item.Category.toLowerCase() === 'social') {
            badgeClass = 'badge-social';
        }

        const tr = document.createElement('tr');
        tr.setAttribute('data-category', item.Category.toLowerCase());
        tr.innerHTML = `
            <td><span class="badge ${badgeClass}">${displayCategory}</span></td>
            <td><strong>${item.EventName}</strong></td>
            <td>${item.Location}</td>
            <td>${item.Date}</td>
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