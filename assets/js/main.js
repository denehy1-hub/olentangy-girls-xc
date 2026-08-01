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

    // Run schedule load if on schedule page
    if (document.getElementById('scheduleBody')) {
        loadMasterSchedule();
    }
});

// Master Schedule Data Source (Instant & Reliable)
const masterScheduleData = [
    { Category: "Race", EventName: "Season Opener Invitational", Location: "Olentangy High School", Date: "August 22, 2026" },
    { Category: "Race", EventName: "Central Buckeye Classic", Location: "Pickerington North", Date: "August 29, 2026" },
    { Category: "Practice", EventName: "Team Pre-Season Camp", Location: "Alum Creek State Park", Date: "August 5 - August 8, 2026" },
    { Category: "Social", EventName: "Pasta Dinner Night", Location: "Team Cafeteria", Date: "August 21, 2026" }
];

function loadMasterSchedule() {
    renderScheduleTable(masterScheduleData);
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