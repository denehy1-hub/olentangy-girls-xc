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
 * Loads header.html dynamically into <header> elements, then initializes menu listeners and active links.
 */
function loadHeader() {
    const headerContainer = document.querySelector('header');
    
    // If the header is hardcoded in the HTML page itself rather than fetched dynamically
    if (!headerContainer || headerContainer.children.length > 0) {
        initMobileNav();
        highlightActiveNavLink();
        return;
    }

    fetch('header.html')
        .then(response => {
            if (!response.ok) throw new Error('Header fetch failed');
            return response.text();
        })
        .then(data => {
            headerContainer.innerHTML = data;
            // Initialize mobile nav and link highlighting AFTER header elements exist in the DOM
            initMobileNav();
            highlightActiveNavLink();
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
    
    container.innerHTML = data.map(athlete => `
        <div class="athlete-card">
            <h3>${escapeHtml(athlete.name)}</h3>
            <p>Grade: ${escapeHtml(athlete.grade)}</p>
        </div>
    `).join('');
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