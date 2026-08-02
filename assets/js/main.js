document.addEventListener("DOMContentLoaded", () => {
    // 1. Fetch header.html and footer.html dynamically
    loadHeader();
    loadFooter();

    // 2. Conditionally load page-specific datasets
    if (document.getElementById("roster-container")) {
        loadJsonData('assets/data/roster.json', renderRoster);
    }
    
    if (document.getElementById("schedule-container")) {
        loadJsonData('assets/data/schedule.json', renderSchedule);
    }
    
    if (document.getElementById("board-container")) {
        loadJsonData('assets/data/board_members.json', renderBoardMembers);
    }

    // 3. Initialize interactive UI components (e.g., accordions)
    initAccordions();
});

/**
 * Loads header.html dynamically into <header> elements, then initializes menu listeners, active links, and search.
 */
function loadHeader() {
    const headerContainer = document.querySelector('header');
    
    // If the header is hardcoded in the HTML page itself rather than fetched dynamically
    if (!headerContainer || headerContainer.children.length > 0) {
        initMobileNav();
        highlightActiveNavLink();
        initSearch(); // Initialize search
        return;
    }

    fetch('header.html')
        .then(response => {
            if (!response.ok) throw new Error('Header fetch failed');
            return response.text();
        })
        .then(data => {
            headerContainer.innerHTML = data;
            // Initialize mobile nav, link highlighting, and search AFTER header elements exist in the DOM
            initMobileNav();
            highlightActiveNavLink();
            initSearch(); // Initialize search
        })
        .catch(err => {
            console.error('Error loading header:', err);
            initMobileNav();
            highlightActiveNavLink();
        });
}

/**
 * Loads footer.html dynamically into <footer> elements if not already hardcoded.
 */
function loadFooter() {
    const footerContainer = document.querySelector('footer');
    
    if (!footerContainer || footerContainer.children.length > 0) return;

    fetch('footer.html')
        .then(response => {
            if (!response.ok) throw new Error('Footer fetch failed');
            return response.text();
        })
        .then(data => {
            footerContainer.innerHTML = data;
        })
        .catch(err => console.error('Error loading footer:', err));
}

/**
 * Automatically handles opening and closing the mobile menu drawer.
 */
function initMobileNav() {
    const menuToggle = document.getElementById('menuToggle');
    const closeMenu = document.getElementById('closeMenu');
    const mobileNav = document.getElementById('mobileNav');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.add('active'); // Matched to .active in style.css
        });
    }

    if (closeMenu && mobileNav) {
        closeMenu.addEventListener('click', () => {
            mobileNav.classList.remove('active'); // Matched to .active in style.css
        });
    }
}

/**
 * Automatically highlights the correct navigation menu item matching the current URL.
 */
function highlightActiveNavLink() {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll("nav a, header a");

    navLinks.forEach(link => {
        const linkPath = link.getAttribute("href");
        if (linkPath === currentPath || (currentPath === "" && linkPath === "index.html")) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

/**
 * Initializes the client-side search functionality.
 */
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    function performSearch() {
        if (!searchInput) return;
        
        const query = searchInput.value.toLowerCase().trim();
        
        // Target dynamic UI elements across different pages
        const searchableItems = document.querySelectorAll('.desktop-table tbody tr, .event-card, .athlete-card, .result-row, .schedule-item, .board-card');

        searchableItems.forEach(item => {
            const textContent = item.textContent.toLowerCase();
            if (textContent.includes(query)) {
                item.style.display = ''; 
            } else {
                item.style.display = 'none'; 
            }
        });
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            performSearch();
        });

        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
        
        // Real-time search as the user types
        searchInput.addEventListener('input', performSearch);
    }
}

/**
 * Generic utility to fetch and parse JSON datasets with error handling.
 */
async function loadJsonData(path, renderCallback) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to load data from ${path}`);
        const data = await response.json();
        renderCallback(data);
    } catch (error) {
        console.error("Data loading error:", error);
        showErrorMessage(path);
    }
}

/**
 * Fallback UI state if data fails to fetch cleanly.
 */
function showErrorMessage(path) {
    const targetId = path.includes("roster") ? "roster-container" : 
                     path.includes("schedule") ? "schedule-container" : "board-container";
    const container = document.getElementById(targetId);
    if (container) {
        container.innerHTML = `<p class="error-notice">Unable to load latest team data at this time. Please check back later.</p>`;
    }
}

function renderRoster(data) {
    const container = document.getElementById("roster-container");
    if (!container) return;

    // Group athletes by their grade string ('12', '11', '10', '9')
    const grades = ["12", "11", "10", "9"];
    
    container.innerHTML = grades.map(gradeLevel => {
        // Filter athletes matching this grade (using lowercase 'grade' from ETL)
        const gradeAthletes = data.filter(athlete => String(athlete.grade).trim() === gradeLevel);

        const athleteListHtml = gradeAthletes.length > 0 ? 
            gradeAthletes.map(athlete => {
                // Check lowercase 'iscaptain' and handle string values ("TRUE" or "true")
                const isCap = String(athlete.iscaptain).toLowerCase() === 'true';
                const captainBadge = isCap ? ' <span style="color: var(--primary-gold); font-weight: bold;">*</span>' : '';
                
                return `<div class="roster-athlete-item">${escapeHtml(athlete.name)}${captainBadge}</div>`;
            .join('') : `<p style="color: var(--text-muted); font-style: italic;">No athletes listed</p>`;

        return `
            <div class="grade-card" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--primary-navy); padding-bottom: 8px; margin-bottom: 12px;">
                    <h3 style="margin: 0; color: var(--primary-navy);">Grade</h3>
                    <span style="background-color: var(--primary-gold); color: var(--primary-navy); font-weight: bold; padding: 2px 8px; border-radius: 4px;">${gradeLevel}</span>
                </div>
                <div class="athlete-list">
                    ${athleteListHtml}
                </div>
            </div>
        `;
    }).join('');
}
function renderSchedule(data) {
    const container = document.getElementById("schedule-container");
    if (!container) return;

    container.innerHTML = data.map(event => `
        <div class="schedule-item">
            <span class="event-date">${escapeHtml(event.date)}</span>
            <h4>${escapeHtml(event.title)}</h4>
            <p>${escapeHtml(event.location)}</p>
        </div>
    `).join('');
}

function renderBoardMembers(data) {
    const container = document.getElementById("board-container");
    if (!container) return;

    container.innerHTML = data.map(member => `
        <div class="board-card">
            <h4>${escapeHtml(member.name)}</h4>
            <p>${escapeHtml(member.role)}</p>
        </div>
    `).join('');
}

/**
 * Handles interactive accordion functionality for FAQs or Parent Hub info.
 */
function initAccordions() {
    const accordions = document.querySelectorAll(".accordion-header");
    accordions.forEach(header => {
        header.addEventListener("click", () => {
            header.classList.toggle("active");
            const content = header.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
}

/**
 * Basic security utility to sanitize dynamic text strings against XSS.
 */
function escapeHtml(str) {
    return str ? str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    ) : '';
}