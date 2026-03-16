// ============================================================
// DASHBOARD — dashboard.js
// ============================================================

const API = '';

async function loadDashboard() {
    try {
        // Load counts
        const [arenaRes, eventRes, vendorRes, sponsorRes] = await Promise.all([
            fetch(`${API}/api/arenas`),
            fetch(`${API}/api/events?limit=500`),
            fetch(`${API}/api/vendors`),
            fetch(`${API}/api/sponsors`)
        ]);

        const arenas = (await arenaRes.json()).arenas || [];
        const events = (await eventRes.json()).events || [];
        const vendors = (await vendorRes.json()).vendors || [];
        const sponsors = (await sponsorRes.json()).sponsors || [];

        document.getElementById('dArenas').textContent = arenas.length;
        document.getElementById('dEvents').textContent = events.length;
        document.getElementById('dVendors').textContent = vendors.length;
        document.getElementById('dSponsors').textContent = sponsors.length;

        // Recent events (last 10 by date)
        const recent = [...events].sort((a, b) => b.start_date.localeCompare(a.start_date)).slice(0, 10);
        const recentDiv = document.getElementById('recentEvents');

        if (recent.length === 0) {
            recentDiv.innerHTML = '<div class="empty-state"><p>No events yet.</p></div>';
        } else {
            recentDiv.innerHTML = `<table class="data-table">
                <thead><tr><th>Event</th><th>Arena</th><th>Date</th><th>Type</th></tr></thead>
                <tbody>${recent.map(e => `
                    <tr>
                        <td><strong>${e.title}</strong></td>
                        <td>${e.arena_name || '—'}</td>
                        <td>${new Date(e.start_date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</td>
                        <td><span class="card-badge">${e.event_type || '—'}</span></td>
                    </tr>
                `).join('')}</tbody>
            </table>`;
        }

        // Pending approvals
        const pending = events.filter(e => !e.is_approved);
        const pendingDiv = document.getElementById('pendingEvents');

        if (pending.length === 0) {
            pendingDiv.innerHTML = '<div class="empty-state" style="padding:1.5rem;"><p>No pending approvals.</p></div>';
        } else {
            pendingDiv.innerHTML = `<table class="data-table">
                <thead><tr><th>Event</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>${pending.map(e => `
                    <tr>
                        <td><strong>${e.title}</strong></td>
                        <td>${new Date(e.start_date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</td>
                        <td>
                            <button class="btn btn-primary" style="font-size:0.75rem; padding:0.3rem 0.5rem;" onclick="approveEvent('${e.id}')">Approve</button>
                        </td>
                    </tr>
                `).join('')}</tbody>
            </table>`;
        }

    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

async function approveEvent(id) {
    try {
        await fetch(`${API}/api/events/${id}/approve`, { method: 'POST' });
        loadDashboard();
    } catch (err) {
        console.error('Approve error:', err);
    }
}

loadDashboard();
