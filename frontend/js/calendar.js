// ============================================================
// EVENT CALENDAR — calendar.js
// ============================================================

const API = '';
let currentYear, currentMonth;
let allEvents = [];
let activeFilter = '';

function init() {
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();
    loadMonth();
}

function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    loadMonth();
}

function filterType(btn) {
    document.querySelectorAll('.cal-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.type;
    renderCalendar();
    renderList();
}

async function loadMonth() {
    const label = document.getElementById('calMonthLabel');
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    label.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Fetch events for the visible range (prev month end to next month start)
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // Pad range for calendar grid
    const startPad = new Date(firstDay);
    startPad.setDate(startPad.getDate() - firstDay.getDay());
    const endPad = new Date(lastDay);
    endPad.setDate(endPad.getDate() + (6 - lastDay.getDay()));

    const start = startPad.toISOString().split('T')[0];
    const end = endPad.toISOString().split('T')[0];

    try {
        const res = await fetch(`${API}/api/events?start=${start}&end=${end}&approved=true&limit=500`);
        const data = await res.json();
        allEvents = data.events || [];
        renderCalendar();
        renderList();
    } catch (err) {
        console.error('Failed to load events:', err);
    }
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOffset = firstDay.getDay(); // 0=Sun
    const totalDays = lastDay.getDate();

    // Day headers
    let html = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
        .map(d => `<div class="cal-day-header">${d}</div>`).join('');

    // Previous month padding
    const prevLast = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
        html += `<div class="cal-day other-month"><span class="cal-day-num">${prevLast - i}</span></div>`;
    }

    // Current month days
    const filtered = activeFilter
        ? allEvents.filter(e => e.event_type === activeFilter)
        : allEvents;

    for (let d = 1; d <= totalDays; d++) {
        const date = new Date(currentYear, currentMonth, d);
        const dateStr = date.toISOString().split('T')[0];
        const isToday = date.getTime() === today.getTime();

        // Events on this day
        const dayEvents = filtered.filter(e => {
            const eStart = e.start_date.split('T')[0];
            const eEnd = e.end_date ? e.end_date.split('T')[0] : eStart;
            return dateStr >= eStart && dateStr <= eEnd;
        });

        html += `<div class="cal-day${isToday ? ' today' : ''}">
            <span class="cal-day-num">${d}</span>
            ${dayEvents.slice(0, 3).map(e => {
                const cls = getEventClass(e.event_type);
                return `<span class="cal-event ${cls}" onclick="showEvent('${e.slug}')" title="${e.title}">${e.title}</span>`;
            }).join('')}
            ${dayEvents.length > 3 ? `<span style="font-size:0.6rem; color:var(--text-muted);">+${dayEvents.length - 3} more</span>` : ''}
        </div>`;
    }

    // Next month padding
    const remaining = 7 - ((startOffset + totalDays) % 7);
    if (remaining < 7) {
        for (let i = 1; i <= remaining; i++) {
            html += `<div class="cal-day other-month"><span class="cal-day-num">${i}</span></div>`;
        }
    }

    grid.innerHTML = html;
}

function renderList() {
    const container = document.getElementById('eventList');
    const filtered = activeFilter
        ? allEvents.filter(e => e.event_type === activeFilter)
        : allEvents;

    // Sort by start_date
    const sorted = [...filtered].sort((a, b) => a.start_date.localeCompare(b.start_date));

    if (sorted.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No events this month</h3><p>Navigate to another month or adjust filters.</p></div>';
        return;
    }

    container.innerHTML = sorted.map(e => {
        const startDate = new Date(e.start_date);
        const cls = getEventClass(e.event_type);
        return `
            <div class="card" style="display:grid; grid-template-columns:auto 1fr auto; gap:1rem; align-items:center; padding:1rem; cursor:pointer;" onclick="showEvent('${e.slug}')">
                <div style="text-align:center; min-width:50px;">
                    <div style="font-size:0.65rem; font-weight:700; text-transform:uppercase; color:var(--brand-rust);">
                        ${startDate.toLocaleDateString('en-US',{month:'short'})}
                    </div>
                    <div style="font-family:var(--font-display); font-size:1.5rem; font-weight:700; color:var(--brand-navy);">
                        ${startDate.getDate()}
                    </div>
                </div>
                <div>
                    <h4 style="font-size:0.95rem; margin-bottom:0.15rem;">${e.title}</h4>
                    <p style="font-size:0.8rem; color:var(--text-secondary);">
                        ${e.arena_name || 'TBD'} · ${e.arena_city || ''}${e.arena_city && e.arena_state ? ', ' : ''}${e.arena_state || ''}
                    </p>
                    ${e.discipline ? `<p style="font-size:0.75rem; color:var(--text-muted);">${e.discipline}</p>` : ''}
                </div>
                <span class="card-badge cal-event ${cls}" style="display:inline-block;">${e.event_type || 'Event'}</span>
            </div>
        `;
    }).join('');
}

function getEventClass(type) {
    const map = {
        'rodeo': 'rodeo',
        'horse show': 'show',
        'roping': 'roping',
        'futurity': 'futurity'
    };
    return map[type] || 'default';
}

async function showEvent(slug) {
    const modal = document.getElementById('eventModal');
    const content = document.getElementById('eventModalContent');

    const ev = allEvents.find(e => e.slug === slug);
    if (!ev) return;

    const startDate = new Date(ev.start_date);
    const endDate = ev.end_date ? new Date(ev.end_date) : null;

    content.innerHTML = `
        <span class="card-badge cal-event ${getEventClass(ev.event_type)}" style="margin-bottom:0.75rem; display:inline-block;">${ev.event_type || 'Event'}</span>
        <h2 style="margin-bottom:0.5rem;">${ev.title}</h2>
        <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:1rem;">
            ${ev.arena_name || 'Arena TBD'} · ${ev.arena_city || ''}${ev.arena_city && ev.arena_state ? ', ' : ''}${ev.arena_state || ''}
        </p>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1rem;">
            <div>
                <p style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Starts</p>
                <p style="font-size:0.95rem;">${startDate.toLocaleDateString('en-US',{weekday:'long', month:'long', day:'numeric', year:'numeric'})}</p>
            </div>
            ${endDate ? `
            <div>
                <p style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Ends</p>
                <p style="font-size:0.95rem;">${endDate.toLocaleDateString('en-US',{weekday:'long', month:'long', day:'numeric', year:'numeric'})}</p>
            </div>` : ''}
        </div>

        ${ev.discipline ? `<p style="margin-bottom:0.5rem;"><strong>Discipline:</strong> ${ev.discipline}</p>` : ''}
        ${ev.entry_fee ? `<p style="margin-bottom:0.5rem;"><strong>Entry Fee:</strong> $${parseFloat(ev.entry_fee).toLocaleString()}</p>` : ''}
        ${ev.added_money ? `<p style="margin-bottom:0.5rem;"><strong>Added Money:</strong> $${parseFloat(ev.added_money).toLocaleString()}</p>` : ''}
        ${ev.description ? `<p style="margin-top:1rem; color:var(--text-secondary); font-size:0.9rem;">${ev.description}</p>` : ''}

        ${ev.contact_name || ev.contact_email ? `
        <div style="margin-top:1.25rem; padding-top:1rem; border-top:1px solid var(--border-light);">
            <p style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted); margin-bottom:0.35rem;">Contact</p>
            ${ev.contact_name ? `<p>${ev.contact_name}</p>` : ''}
            ${ev.contact_email ? `<p><a href="mailto:${ev.contact_email}">${ev.contact_email}</a></p>` : ''}
        </div>` : ''}

        ${ev.flyer_url ? `<a href="${ev.flyer_url}" target="_blank" class="btn btn-primary" style="margin-top:1rem;">View Flyer →</a>` : ''}
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('eventModal').style.display = 'none';
    document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Init
init();
