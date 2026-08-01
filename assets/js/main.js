document.addEventListener("DOMContentLoaded", () => {
    // 1. Handle Schedule Data Loading (if on the schedule page)
    const scheduleBody = document.getElementById("scheduleBody");
    if (scheduleBody) {
        fetchLocalSchedule();
    }

    // 2. Handle Accordion Toggle Functionality (for the Parent Hub page)
    const accordionHeaders = document.querySelectorAll(".accordion-header");
    accordionHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const item = header.parentElement;
            
            // Optional: Close other open accordions if you want only one open at a time
            // document.querySelectorAll(".accordion-item").forEach(i => {
            //     if (i !== item) i.classList.remove("active");
            // });

            // Toggle active class on the clicked item
            item.classList.toggle("active");
            
            // Switch the plus/minus icon dynamically
            const icon = header.querySelector(".accordion-icon");
            if (icon) {
                icon.textContent = item.classList.contains("active") ? "-" : "+";
            }
        });
    });
});

async function fetchLocalSchedule() {
    try {
        const response = await fetch('./assets/data/schedule.json');
        
        if (!response.ok) {
            throw new Error("Local schedule file not found.");
        }
        
        const events = await response.json();
        const scheduleBody = document.getElementById("scheduleBody");
        scheduleBody.innerHTML = ""; 

        if (events.length === 0) {
            scheduleBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No scheduled events found. Check back soon!</td></tr>';
            return;
        }

        events.forEach(event => {
            const category = event.category ? event.category.toLowerCase() : "";
            
            let badgeClass = "badge-practice"; 
            if (category.includes("race")) badgeClass = "badge-race";
            if (category.includes("social")) badgeClass = "badge-social"; 
            if (category.includes("championship")) badgeClass = "badge-race";

            const tr = document.createElement("tr");
            tr.setAttribute("data-category", category.includes("championship") ? "race" : category);
            
            tr.innerHTML = `
                <td><span class="badge ${badgeClass}">${event.category ? event.category.toUpperCase() : "EVENT"}</span></td>
                <td><strong>${event.eventName}</strong></td>
                <td>${event.location}</td>
                <td>${event.date}</td>
            `;
            
            scheduleBody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error loading local schedule:", error);
        document.getElementById("scheduleBody").innerHTML = 
            '<tr><td colspan="4" style="text-align: center;">Syncing latest schedule data. Please check back shortly.</td></tr>';
    }
}

function filterSchedule(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active-filter'));
    event.target.classList.add('active-filter');

    const rows = document.querySelectorAll('#scheduleTable tbody tr');
    rows.forEach(row => {
        const rowCategory = row.getAttribute('data-category');
        if (category === 'all' || rowCategory.includes(category)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}