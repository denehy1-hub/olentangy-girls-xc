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

// Dynamic Schedule Fetcher with Caching for instant load
let masterScheduleData = [];

async function loadMasterSchedule() {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbzBMZ6CvUu9PNUc3cTlvhJjOuwV36ZC...'; // Keep your new URL here
    const cacheKey = 'ohs_xc_schedule_cache_2026';
    const cacheTimeKey = 'ohs_xc_schedule_time_2026';
    const cacheDuration = 10 * 60 * 1000; // Cache valid for 10 minutes

    const tbody = document.getElementById('scheduleBody');
    
    // 1. Check if we have cached data to show INSTANTLY
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);
    
    if (cachedData && cachedTime && (new Date().getTime() - cachedTime < cacheDuration)) {
        masterScheduleData = JSON.parse(cachedData);
        renderScheduleTable(masterScheduleData);
        return; // Skip the slow network wait if cache is fresh!
    }

    // 2. Otherwise fetch live data in the background
    try {
        const response = await fetch(scriptURL);
        masterScheduleData = await response.json();
        
        // Save to cache
        localStorage.setItem(cacheKey, JSON.stringify(masterScheduleData));
        localStorage.setItem(cacheTimeKey, new Date().getTime());

        renderScheduleTable(masterScheduleData);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        // Fallback to expired cache if offline/error
        if (cachedData) {
            masterScheduleData = JSON.parse(cachedData);
            renderScheduleTable(masterScheduleData);
            return;
        }
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