// ============================================================
// ARENA DIRECTORY — arena.js
// ============================================================

const API = '';
let allArenas = [];
let currentView = 'grid';

async function loadArenas() {
    const search = document.getElementById('searchInput').value;
    const state = document.getElementById('stateFilter').value;
    const type = document.getElementById('typeFilter').value;

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (state) params.set('state', state);
    if (type) params.set('type', type);

    try {
        const res = await fetch(`${API}/api/arenas?${params}`);
        const data = await res.json();
        allArenas = data.arenas || [];

        document.getElementById('resultCount').textContent = `${allArenas.length} Arena${allArenas.length !== 1 ? 's' : ''}`;
        renderArenas();
    } catch (err) {
        console.error('Failed to load arenas:', err);
        document.getElementById('arenaResults').innerHTML = '<div class="empty-state"><h3>Failed to load arenas</h3><p>Please check your connection and try again.</p></div>';
    }
}

function renderArenas() {
    const container = document.getElementById('arenaResults');

    if (allArenas.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><h3>No arenas found</h3><p>Try adjusting your search or filters.</p></div>';
        return;
    }

    if (currentView === 'grid') {
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
        container.innerHTML = allArenas.map(a => `
            <div class="card fade-up">
                ${a.cover_image_url ? `<img src="${a.cover_image_url}" alt="${a.name}" style="width:100%; height:140px; object-fit:cover; border-radius:var(--radius-md); margin-bottom:0.75rem;">` : ''}
                <div class="card-header">
                    <h3 style="font-size:1rem;">${a.name}</h3>
                    ${a.is_verified ? '<span class="card-badge verified">Verified</span>' : ''}
                </div>
                <p style="font-size:0.85rem; color:var(--text-secondary);">
                    ${a.city || ''}${a.city && a.state ? ', ' : ''}${a.state || ''}
                </p>
                <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.5rem; display:flex; flex-wrap:wrap; gap:0.5rem;">
                    <span>${capitalize(a.arena_type || 'equine')}</span>
                    ${a.is_indoor ? '<span>· Indoor</span>' : ''}
                    ${a.is_outdoor ? '<span>· Outdoor</span>' : ''}
                    ${a.seating_capacity ? `<span>· ${a.seating_capacity.toLocaleString()} seats</span>` : ''}
                    ${a.stall_count ? `<span>· ${a.stall_count} stalls</span>` : ''}
                    ${a.rv_hookups ? '<span>· RV Hookups</span>' : ''}
                </div>
                <div style="margin-top:0.75rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
                    ${a.phone ? `<span style="font-size:0.8rem;">📞 ${a.phone}</span>` : ''}
                    ${a.website ? `<a href="${a.website}" target="_blank" style="font-size:0.8rem;">🌐 Website</a>` : ''}
                </div>
            </div>
        `).join('');
    } else {
        container.style.gridTemplateColumns = '1fr';
        container.innerHTML = allArenas.map(a => `
            <div class="card fade-up" style="display:grid; grid-template-columns:1fr auto; gap:1rem; align-items:center;">
                <div>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <h3 style="font-size:1rem;">${a.name}</h3>
                        ${a.is_verified ? '<span class="card-badge verified">Verified</span>' : ''}
                    </div>
                    <p style="font-size:0.85rem; color:var(--text-secondary);">${a.city || ''}${a.city && a.state ? ', ' : ''}${a.state || ''}</p>
                    <p style="font-size:0.8rem; color:var(--text-muted);">${capitalize(a.arena_type || 'equine')} ${a.seating_capacity ? '· ' + a.seating_capacity.toLocaleString() + ' seats' : ''}</p>
                </div>
                <div style="text-align:right;">
                    ${a.phone ? `<p style="font-size:0.8rem;">${a.phone}</p>` : ''}
                    ${a.website ? `<a href="${a.website}" target="_blank" class="btn btn-outline" style="font-size:0.75rem; padding:0.3rem 0.6rem; margin-top:0.25rem;">Visit</a>` : ''}
                </div>
            </div>
        `).join('');
    }
}

function setView(view) {
    currentView = view;
    document.getElementById('btnGrid').classList.toggle('active', view === 'grid');
    document.getElementById('btnList').classList.toggle('active', view === 'list');
    // Quick active style
    document.getElementById('btnGrid').style.background = view === 'grid' ? 'var(--brand-navy)' : '';
    document.getElementById('btnGrid').style.color = view === 'grid' ? 'var(--brand-cream)' : '';
    document.getElementById('btnList').style.background = view === 'list' ? 'var(--brand-navy)' : '';
    document.getElementById('btnList').style.color = view === 'list' ? 'var(--brand-cream)' : '';
    renderArenas();
}

async function populateStates() {
    try {
        const res = await fetch(`${API}/api/arenas`);
        const data = await res.json();
        const states = [...new Set((data.arenas || []).map(a => a.state).filter(Boolean))].sort();
        const sel = document.getElementById('stateFilter');
        states.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            sel.appendChild(opt);
        });
    } catch (err) {
        console.error('Failed to load states:', err);
    }
}

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// Debounce search
let searchTimer;
document.getElementById('searchInput').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadArenas, 300);
});

// Init
populateStates();
loadArenas();
