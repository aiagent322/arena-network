// ============================================================
// ARENA FACILITY MAP — map.js
// Interactive SVG map of arena grounds with clickable markers
//
// Mobile-first: 320px base, touch events, 44px+ tap targets,
// pinch-to-zoom, swipe-to-pan.
//
// Usage:
//   <div id="facilityMap" style="width:100%;aspect-ratio:4/3;"></div>
//   <script src="js/map.js"></script>
//   <script>
//     ArenaMap.init('facilityMap', {
//       name: 'WestWorld of Scottsdale',
//       markers: [ ... ]   // optional custom markers
//     });
//   </script>
//
// Or pass marker data from API:
//   ArenaMap.init('facilityMap', { name: arena.name });
//   ArenaMap.loadMarkers(markerArray);
// ============================================================

var ArenaMap = (function () {
    'use strict';

    // ── Brand colors ──
    var C = {
        navy:    '#0B1D3A',
        gold:    '#C8993C',
        cream:   '#FAF6EF',
        rust:    '#9B4D2B',
        sage:    '#5A7247',
        sand:    '#E8DFD0',
        slate:   '#3C5A8A',
        white:   '#FFFFFF',
        text:    '#0B1D3A',
        muted:   '#8C8C8C',
    };

    // ── Marker type config ──
    var TYPES = {
        arena:   { label: 'Arena',      color: C.navy,  icon: 'arena',   fill: '#0B1D3A' },
        barn:    { label: 'Barn',       color: C.rust,  icon: 'barn',    fill: '#9B4D2B' },
        vendor:  { label: 'Vendor Area',color: C.sage,  icon: 'vendor',  fill: '#5A7247' },
        parking: { label: 'Parking',    color: C.slate, icon: 'parking', fill: '#3C5A8A' },
        rv:      { label: 'RV Hookups', color: C.gold,  icon: 'rv',      fill: '#C8993C' },
    };

    // ── Default facility layout (used when no custom markers provided) ──
    var DEFAULT_MARKERS = [
        { id: 'main-arena',   type: 'arena',   x: 50, y: 35, label: 'Main Arena',       desc: 'Indoor arena · 200 x 300 ft · Seats 5,000' },
        { id: 'warmup-arena', type: 'arena',   x: 25, y: 35, label: 'Warm-Up Arena',    desc: 'Outdoor covered · 150 x 200 ft' },
        { id: 'barn-a',       type: 'barn',    x: 75, y: 25, label: 'Barn A',           desc: '120 stalls · Wash racks · Tack rooms' },
        { id: 'barn-b',       type: 'barn',    x: 75, y: 45, label: 'Barn B',           desc: '100 stalls · Open-air · Fans' },
        { id: 'barn-c',       type: 'barn',    x: 75, y: 65, label: 'Barn C',           desc: '80 stalls · Temporary · Portable panels' },
        { id: 'vendor-main',  type: 'vendor',  x: 35, y: 60, label: 'Vendor Row',       desc: '24 booth spaces · Power & water available' },
        { id: 'vendor-food',  type: 'vendor',  x: 55, y: 60, label: 'Food Court',       desc: '8 food vendors · Covered seating' },
        { id: 'parking-main', type: 'parking', x: 15, y: 75, label: 'Main Parking',     desc: 'Paved · 400 spaces · ADA accessible' },
        { id: 'parking-over', type: 'parking', x: 50, y: 82, label: 'Overflow Parking',  desc: 'Grass lot · 200 spaces · Event days only' },
        { id: 'rv-north',     type: 'rv',      x: 85, y: 82, label: 'RV Area — North',  desc: '50 hookups · Full service · 30/50 amp' },
        { id: 'rv-south',     type: 'rv',      x: 15, y: 55, label: 'RV Area — South',  desc: '30 hookups · Water & electric · Dump station' },
    ];

    // ── State ──
    var container, svg, markersGroup, popupEl;
    var markers = [];
    var activeFilters = { arena: true, barn: true, vendor: true, parking: true, rv: true };
    var activeMarker = null;
    var viewBox = { x: 0, y: 0, w: 100, h: 100 };
    var arenaName = 'Arena Facility Map';
    var isPanning = false, panStart = { x: 0, y: 0 }, vbStart = { x: 0, y: 0 };
    var pinchStartDist = 0, pinchStartW = 0;

    // ── Init ──────────────────────────────────────────────────

    function init(containerId, options) {
        options = options || {};
        container = document.getElementById(containerId);
        if (!container) { console.error('ArenaMap: container not found:', containerId); return; }

        arenaName = options.name || 'Arena Facility Map';
        markers = options.markers || DEFAULT_MARKERS;

        container.innerHTML = '';
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        container.style.touchAction = 'none';
        container.style.userSelect = 'none';
        container.style.webkitUserSelect = 'none';
        container.style.cursor = 'grab';
        container.style.borderRadius = '12px';
        container.style.border = '1px solid ' + C.sand;
        container.style.background = C.cream;

        viewBox = { x: -5, y: -5, w: 110, h: 110 };

        buildSVG();
        buildLegend();
        buildPopup();
        bindEvents();
        render();
    }

    // ── SVG scaffold ──────────────────────────────────────────

    function buildSVG() {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', vbStr());
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.display = 'block';

        // Defs: drop shadow
        var defs = svgEl('defs');
        defs.innerHTML = '<filter id="amshadow" x="-20%" y="-20%" width="140%" height="140%">' +
            '<feDropShadow dx="0" dy="0.5" stdDeviation="1" flood-color="' + C.navy + '" flood-opacity="0.2"/>' +
            '</filter>' +
            '<filter id="ampopShadow" x="-30%" y="-30%" width="160%" height="160%">' +
            '<feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="' + C.navy + '" flood-opacity="0.25"/>' +
            '</filter>';
        svg.appendChild(defs);

        // Background — subtle grid
        var bg = svgEl('g', { class: 'am-bg' });
        for (var gx = 0; gx <= 100; gx += 10) {
            bg.appendChild(svgEl('line', { x1: gx, y1: 0, x2: gx, y2: 100, stroke: C.sand, 'stroke-width': 0.15 }));
        }
        for (var gy = 0; gy <= 100; gy += 10) {
            bg.appendChild(svgEl('line', { x1: 0, y1: gy, x2: 100, y2: gy, stroke: C.sand, 'stroke-width': 0.15 }));
        }
        // Perimeter outline
        bg.appendChild(svgEl('rect', { x: 2, y: 2, width: 96, height: 96, rx: 2, fill: 'none', stroke: C.gold, 'stroke-width': 0.3, 'stroke-dasharray': '1,1', opacity: 0.4 }));
        svg.appendChild(bg);

        // Title
        var title = svgEl('text', { x: 50, y: 7, 'text-anchor': 'middle', 'font-family': "'Bitter',Georgia,serif", 'font-size': 3.5, 'font-weight': 700, fill: C.navy, opacity: 0.7 });
        title.textContent = arenaName;
        svg.appendChild(title);

        // Markers group
        markersGroup = svgEl('g', { class: 'am-markers' });
        svg.appendChild(markersGroup);

        container.appendChild(svg);
    }

    // ── Render markers ────────────────────────────────────────

    function render() {
        // Clear existing
        while (markersGroup.firstChild) markersGroup.removeChild(markersGroup.firstChild);

        markers.forEach(function (m, i) {
            if (!activeFilters[m.type]) return;

            var cfg = TYPES[m.type] || TYPES.arena;
            var g = svgEl('g', {
                class: 'am-marker',
                'data-id': m.id,
                'data-type': m.type,
                style: 'cursor:pointer;',
                transform: 'translate(' + m.x + ',' + m.y + ')'
            });

            // Pulse ring (animated)
            var pulse = svgEl('circle', { cx: 0, cy: 0, r: 3.5, fill: cfg.fill, opacity: 0 });
            var anim = svgEl('animate', { attributeName: 'r', from: 2.5, to: 5, dur: '2s', repeatCount: 'indefinite' });
            pulse.appendChild(anim);
            var animOp = svgEl('animate', { attributeName: 'opacity', from: 0.3, to: 0, dur: '2s', repeatCount: 'indefinite' });
            pulse.appendChild(animOp);
            g.appendChild(pulse);

            // Marker dot — 44px tap target at phone zoom
            var hitArea = svgEl('circle', { cx: 0, cy: 0, r: 4, fill: 'transparent' });
            g.appendChild(hitArea);

            // Visible marker
            var dot = svgEl('circle', { cx: 0, cy: 0, r: 2.5, fill: cfg.fill, stroke: C.white, 'stroke-width': 0.6, filter: 'url(#amshadow)' });
            g.appendChild(dot);

            // Icon inside marker
            var icon = buildIcon(cfg.icon, 0, 0, 1.6);
            if (icon) g.appendChild(icon);

            // Label below
            var lbl = svgEl('text', {
                x: 0, y: 5,
                'text-anchor': 'middle',
                'font-family': "'DM Sans',system-ui,sans-serif",
                'font-size': 1.8,
                'font-weight': 600,
                fill: C.navy,
                opacity: 0.6
            });
            lbl.textContent = m.label;
            g.appendChild(lbl);

            // Tap/click handler
            g.addEventListener('click', function (e) {
                e.stopPropagation();
                showPopup(m);
            });
            g.addEventListener('touchend', function (e) {
                if (!isPanning) {
                    e.preventDefault();
                    showPopup(m);
                }
            });

            // Hover effects (desktop)
            g.addEventListener('mouseenter', function () {
                dot.setAttribute('r', 3);
                dot.setAttribute('stroke-width', 0.8);
                lbl.setAttribute('opacity', 1);
                lbl.setAttribute('font-size', 2);
            });
            g.addEventListener('mouseleave', function () {
                dot.setAttribute('r', 2.5);
                dot.setAttribute('stroke-width', 0.6);
                lbl.setAttribute('opacity', 0.6);
                lbl.setAttribute('font-size', 1.8);
            });

            markersGroup.appendChild(g);
        });
    }

    // ── Marker icons ──────────────────────────────────────────

    function buildIcon(type, cx, cy, size) {
        var s = size * 0.45;
        var g = svgEl('g', { transform: 'translate(' + (cx - s) + ',' + (cy - s) + ') scale(' + (s * 2 / 24) + ')', fill: 'none', stroke: C.white, 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });

        switch (type) {
            case 'arena':
                g.innerHTML = '<rect x="3" y="7" width="18" height="14" rx="1"/><path d="M3 10h18"/><path d="M7 7V4h10v3"/>';
                break;
            case 'barn':
                g.innerHTML = '<path d="M3 21V11l9-7 9 7v10"/><path d="M9 21v-6h6v6"/>';
                break;
            case 'vendor':
                g.innerHTML = '<path d="M3 21V9.349m0 0a3 3 0 003.75-.615A3 3 0 009.75 9.75a3 3 0 002.25-1.016A3 3 0 0014.25 9.75a3 3 0 002.25-1.015A3 3 0 0021 9.349M3 9.349a3 3 0 01-.621-4.72L3.568 3.44A1.5 1.5 0 014.628 3h14.744a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72"/><path d="M7 14h4v4H7z"/>';
                break;
            case 'parking':
                g.innerHTML = '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 010 6H9"/>';
                break;
            case 'rv':
                g.innerHTML = '<path d="M7 18.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H2.25V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124A17.9 17.9 0 0017.25 8.4a2.056 2.056 0 00-1.58-.86H14.25m2.25 10.5h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.5 48.5 0 00-10.026 0A1.106 1.106 0 002.25 5.86v7.635"/>';
                break;
            default:
                return null;
        }
        return g;
    }

    // ── Popup panel ───────────────────────────────────────────

    function buildPopup() {
        popupEl = document.createElement('div');
        popupEl.style.cssText = 'display:none;position:absolute;bottom:0;left:0;right:0;' +
            'background:' + C.white + ';border-top:3px solid ' + C.gold + ';' +
            'padding:16px;font-family:"DM Sans",system-ui,sans-serif;z-index:10;' +
            'box-shadow:0 -4px 20px rgba(11,29,58,0.15);transition:transform 0.25s ease,opacity 0.25s ease;' +
            'transform:translateY(100%);opacity:0;border-radius:12px 12px 0 0;';
        popupEl.innerHTML = '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">' +
            '<div id="am-popup-body" style="flex:1;min-width:0;"></div>' +
            '<button id="am-popup-close" style="flex-shrink:0;width:32px;height:32px;border-radius:8px;border:none;' +
            'background:' + C.sand + ';cursor:pointer;display:flex;align-items:center;justify-content:center;color:' + C.muted + ';">' +
            '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">' +
            '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg></button></div>';

        container.appendChild(popupEl);

        document.getElementById('am-popup-close').addEventListener('click', hidePopup);
        document.getElementById('am-popup-close').addEventListener('touchend', function (e) { e.preventDefault(); hidePopup(); });
    }

    function showPopup(marker) {
        var cfg = TYPES[marker.type] || TYPES.arena;
        var body = document.getElementById('am-popup-body');
        body.innerHTML =
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
                '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + cfg.fill + ';flex-shrink:0;"></span>' +
                '<span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:' + cfg.fill + ';">' + cfg.label + '</span>' +
            '</div>' +
            '<h3 style="font-family:Bitter,Georgia,serif;font-weight:700;font-size:16px;color:' + C.navy + ';margin:0 0 4px;line-height:1.3;">' + esc(marker.label) + '</h3>' +
            (marker.desc ? '<p style="font-size:13px;color:' + C.muted + ';margin:0;line-height:1.5;">' + esc(marker.desc) + '</p>' : '');

        activeMarker = marker.id;
        popupEl.style.display = 'block';
        requestAnimationFrame(function () {
            popupEl.style.transform = 'translateY(0)';
            popupEl.style.opacity = '1';
        });
    }

    function hidePopup() {
        popupEl.style.transform = 'translateY(100%)';
        popupEl.style.opacity = '0';
        activeMarker = null;
        setTimeout(function () { popupEl.style.display = 'none'; }, 250);
    }

    // ── Legend / filter toggles ────────────────────────────────

    function buildLegend() {
        var legend = document.createElement('div');
        legend.style.cssText = 'position:absolute;top:8px;left:8px;display:flex;flex-wrap:wrap;gap:4px;z-index:5;';

        Object.keys(TYPES).forEach(function (key) {
            var cfg = TYPES[key];
            var btn = document.createElement('button');
            btn.setAttribute('data-filter', key);
            btn.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:5px 10px;' +
                'border-radius:6px;border:1.5px solid ' + cfg.fill + '30;background:' + C.white + 'ee;' +
                'font-family:"DM Sans",system-ui,sans-serif;font-size:10px;font-weight:700;' +
                'text-transform:uppercase;letter-spacing:0.05em;color:' + cfg.fill + ';cursor:pointer;' +
                'transition:all 0.2s;min-height:32px;';

            btn.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:' + cfg.fill + ';flex-shrink:0;"></span>' + cfg.label;

            btn.addEventListener('click', function () { toggleFilter(key, btn); });
            btn.addEventListener('touchend', function (e) { e.preventDefault(); toggleFilter(key, btn); });

            legend.appendChild(btn);
        });

        // Zoom controls
        var zoomBox = document.createElement('div');
        zoomBox.style.cssText = 'position:absolute;bottom:60px;right:8px;display:flex;flex-direction:column;gap:2px;z-index:5;';

        ['+', '−', '⟲'].forEach(function (sym, i) {
            var zb = document.createElement('button');
            zb.textContent = sym;
            zb.style.cssText = 'width:36px;height:36px;border-radius:8px;border:1px solid ' + C.sand + ';' +
                'background:' + C.white + 'ee;font-size:16px;font-weight:700;color:' + C.navy + ';cursor:pointer;' +
                'display:flex;align-items:center;justify-content:center;transition:background 0.2s;';
            zb.addEventListener('click', function () {
                if (i === 0) zoom(0.8);
                else if (i === 1) zoom(1.25);
                else resetView();
            });
            zoomBox.appendChild(zb);
        });

        container.appendChild(legend);
        container.appendChild(zoomBox);
    }

    function toggleFilter(key, btn) {
        activeFilters[key] = !activeFilters[key];
        var cfg = TYPES[key];
        if (activeFilters[key]) {
            btn.style.background = C.white + 'ee';
            btn.style.color = cfg.fill;
            btn.style.borderColor = cfg.fill + '30';
            btn.style.opacity = '1';
        } else {
            btn.style.background = C.sand + '80';
            btn.style.color = C.muted;
            btn.style.borderColor = C.sand;
            btn.style.opacity = '0.5';
        }
        hidePopup();
        render();
    }

    // ── Pan & zoom ────────────────────────────────────────────

    function bindEvents() {
        // Mouse pan
        container.addEventListener('mousedown', function (e) {
            if (e.target.closest('.am-marker') || e.target.closest('button')) return;
            isPanning = true;
            container.style.cursor = 'grabbing';
            panStart = { x: e.clientX, y: e.clientY };
            vbStart = { x: viewBox.x, y: viewBox.y };
            hidePopup();
        });
        window.addEventListener('mousemove', function (e) {
            if (!isPanning) return;
            var rect = container.getBoundingClientRect();
            var dx = (e.clientX - panStart.x) / rect.width * viewBox.w;
            var dy = (e.clientY - panStart.y) / rect.height * viewBox.h;
            viewBox.x = vbStart.x - dx;
            viewBox.y = vbStart.y - dy;
            svg.setAttribute('viewBox', vbStr());
        });
        window.addEventListener('mouseup', function () {
            isPanning = false;
            container.style.cursor = 'grab';
        });

        // Scroll zoom
        container.addEventListener('wheel', function (e) {
            e.preventDefault();
            zoom(e.deltaY > 0 ? 1.1 : 0.9, e);
        }, { passive: false });

        // Touch pan
        container.addEventListener('touchstart', function (e) {
            if (e.target.closest('.am-marker') || e.target.closest('button')) return;
            if (e.touches.length === 1) {
                isPanning = true;
                panStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                vbStart = { x: viewBox.x, y: viewBox.y };
            }
            if (e.touches.length === 2) {
                isPanning = false;
                pinchStartDist = pinchDist(e);
                pinchStartW = viewBox.w;
            }
        }, { passive: true });

        container.addEventListener('touchmove', function (e) {
            if (e.touches.length === 1 && isPanning) {
                var rect = container.getBoundingClientRect();
                var dx = (e.touches[0].clientX - panStart.x) / rect.width * viewBox.w;
                var dy = (e.touches[0].clientY - panStart.y) / rect.height * viewBox.h;
                viewBox.x = vbStart.x - dx;
                viewBox.y = vbStart.y - dy;
                svg.setAttribute('viewBox', vbStr());
            }
            if (e.touches.length === 2) {
                e.preventDefault();
                var dist = pinchDist(e);
                var scale = pinchStartDist / dist;
                var newW = Math.max(30, Math.min(200, pinchStartW * scale));
                var ratio = viewBox.h / viewBox.w;
                var cx = viewBox.x + viewBox.w / 2;
                var cy = viewBox.y + viewBox.h / 2;
                viewBox.w = newW;
                viewBox.h = newW * ratio;
                viewBox.x = cx - viewBox.w / 2;
                viewBox.y = cy - viewBox.h / 2;
                svg.setAttribute('viewBox', vbStr());
            }
        }, { passive: false });

        container.addEventListener('touchend', function () {
            isPanning = false;
        });

        // Click background to close popup
        svg.addEventListener('click', function (e) {
            if (!e.target.closest('.am-marker')) hidePopup();
        });
    }

    function zoom(factor, evt) {
        var cx = viewBox.x + viewBox.w / 2;
        var cy = viewBox.y + viewBox.h / 2;

        if (evt) {
            var rect = container.getBoundingClientRect();
            cx = viewBox.x + ((evt.clientX - rect.left) / rect.width) * viewBox.w;
            cy = viewBox.y + ((evt.clientY - rect.top) / rect.height) * viewBox.h;
        }

        var newW = Math.max(30, Math.min(200, viewBox.w * factor));
        var ratio = viewBox.h / viewBox.w;
        viewBox.w = newW;
        viewBox.h = newW * ratio;
        viewBox.x = cx - viewBox.w / 2;
        viewBox.y = cy - viewBox.h / 2;
        svg.setAttribute('viewBox', vbStr());
    }

    function resetView() {
        viewBox = { x: -5, y: -5, w: 110, h: 110 };
        svg.setAttribute('viewBox', vbStr());
        hidePopup();
    }

    function pinchDist(e) {
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function vbStr() {
        return viewBox.x + ' ' + viewBox.y + ' ' + viewBox.w + ' ' + viewBox.h;
    }

    // ── Public API: load custom markers ───────────────────────

    function loadMarkers(data) {
        if (!Array.isArray(data)) return;
        markers = data.map(function (m) {
            return {
                id:    m.id || ('m-' + Math.random().toString(36).substr(2, 6)),
                type:  m.type || 'arena',
                x:     parseFloat(m.x) || 50,
                y:     parseFloat(m.y) || 50,
                label: m.label || m.name || 'Marker',
                desc:  m.desc || m.description || ''
            };
        });
        render();
    }

    // ── Helpers ───────────────────────────────────────────────

    function svgEl(tag, attrs) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
        }
        return el;
    }

    function esc(s) {
        if (!s) return '';
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ── Public interface ──────────────────────────────────────

    return {
        init: init,
        loadMarkers: loadMarkers,
        zoom: zoom,
        resetView: resetView,
        showPopup: showPopup,
        hidePopup: hidePopup,
        TYPES: TYPES
    };

})();
