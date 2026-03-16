#!/usr/bin/env python3
"""
============================================================
ARENA NETWORK — Event Scraper Worker
============================================================

Scrapes event data from arena websites, rodeo listings,
and event pages. Uses rule-based extraction first, then
falls back to LLM parsing via the Anthropic Claude API.

Workflow:
    1. Receive URL
    2. Download page HTML
    3. Clean and extract text with BeautifulSoup
    4. Attempt rule-based extraction (JSON-LD, markup, tables)
    5. If no results, send cleaned text to LLM parser
    6. Return structured JSON

Usage:
    python scraper.py --url "https://example.com/events"
    python scraper.py --url "https://example.com/events" --dry-run
    python scraper.py --url "https://example.com/events" --submit
    python scraper.py --url "https://example.com/events" --no-llm

Output format:
    {
        "status": "complete",
        "url": "...",
        "method": "json-ld | markup | table | llm",
        "events_found": 3,
        "events_submitted": 0,
        "llm_usage": { "input_tokens": 0, "output_tokens": 0, "cost": 0 },
        "events": [
            {
                "title": "",
                "start_date": "",
                "end_date": "",
                "discipline": "",
                "arena": "",
                "website": ""
            }
        ]
    }

Requirements:
    pip install requests beautifulsoup4 python-dateutil
    Optional: ANTHROPIC_API_KEY env var for LLM fallback
"""

import os
import sys
import json
import uuid
import argparse
import logging
import re
from datetime import datetime
from urllib.parse import urlparse, urljoin

import requests
from bs4 import BeautifulSoup, Comment
from dateutil import parser as dateparser

# ── Configuration ──────────────────────────────────────────

ANTHROPIC_API_KEY  = os.environ.get('ANTHROPIC_API_KEY', '')
ANTHROPIC_API_URL  = 'https://api.anthropic.com/v1/messages'
ANTHROPIC_MODEL    = 'claude-sonnet-4-20250514'
ANTHROPIC_MAX_TOK  = 4096

API_BASE           = os.environ.get('API_BASE', 'http://localhost:3000')
USER_AGENT         = 'ArenaNetwork-Scraper/2.0 (+https://arenanetwork.com)'
REQUEST_TIMEOUT    = 30
MAX_HTML_SIZE      = 500_000   # 500KB max page size
MAX_TEXT_FOR_LLM   = 12_000   # chars sent to LLM

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
log = logging.getLogger('scraper')


# ════════════════════════════════════════════════════════════
# STEP 1 — Download Page HTML
# ════════════════════════════════════════════════════════════

def fetch_page(url):
    """Download a web page and return raw HTML string."""
    log.info(f'[FETCH] {url}')

    headers = {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
    }

    try:
        resp = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        resp.raise_for_status()

        content_type = resp.headers.get('Content-Type', '')
        if 'text/html' not in content_type and 'application/xhtml' not in content_type:
            log.warning(f'[FETCH] Unexpected content type: {content_type}')

        html = resp.text[:MAX_HTML_SIZE]
        log.info(f'[FETCH] Downloaded {len(html):,} bytes ({resp.status_code})')
        return html

    except requests.Timeout:
        log.error(f'[FETCH] Timeout after {REQUEST_TIMEOUT}s')
        return None
    except requests.ConnectionError as e:
        log.error(f'[FETCH] Connection error: {e}')
        return None
    except requests.HTTPError as e:
        log.error(f'[FETCH] HTTP {e.response.status_code}: {e}')
        return None
    except requests.RequestException as e:
        log.error(f'[FETCH] Request failed: {e}')
        return None


# ════════════════════════════════════════════════════════════
# STEP 2 — Clean HTML with BeautifulSoup
# ════════════════════════════════════════════════════════════

def clean_html(raw_html):
    """Parse HTML, strip noise, return BeautifulSoup object and cleaned text."""
    soup = BeautifulSoup(raw_html, 'html.parser')

    # Remove non-content elements
    for tag in soup(['script', 'style', 'noscript', 'iframe', 'svg', 'path',
                     'meta', 'link', 'head']):
        tag.decompose()

    # Remove HTML comments
    for comment in soup.find_all(string=lambda t: isinstance(t, Comment)):
        comment.extract()

    # Remove common noise elements
    noise_selectors = [
        'nav', 'footer', 'header', '.cookie-banner', '.popup',
        '#cookie-consent', '.advertisement', '.ad-container',
        '.sidebar', '.widget', '[role="navigation"]', '[role="banner"]'
    ]
    for selector in noise_selectors:
        for el in soup.select(selector):
            el.decompose()

    # Get clean text
    text = soup.get_text(separator='\n', strip=True)

    # Collapse multiple blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)

    log.info(f'[CLEAN] Extracted {len(text):,} chars of text')
    return soup, text


# ════════════════════════════════════════════════════════════
# STEP 3 — Rule-Based Extraction (no LLM)
# ════════════════════════════════════════════════════════════

def extract_rules(soup, source_url):
    """
    Try three strategies in order:
      1. JSON-LD structured data
      2. Common event markup (CSS classes)
      3. HTML tables with event-like headers
    Returns (events_list, method_name) or ([], None).
    """

    # ── Strategy 1: JSON-LD ──
    events = _extract_json_ld(soup, source_url)
    if events:
        return events, 'json-ld'

    # ── Strategy 2: Event markup ──
    events = _extract_markup(soup, source_url)
    if events:
        return events, 'markup'

    # ── Strategy 3: Tables ──
    events = _extract_tables(soup, source_url)
    if events:
        return events, 'table'

    return [], None


def _extract_json_ld(soup, source_url):
    """Extract events from JSON-LD schema.org markup."""
    events = []
    for script in soup.find_all('script', type='application/ld+json'):
        try:
            raw = script.string
            if not raw:
                continue
            data = json.loads(raw)

            # Handle @graph arrays
            items = []
            if isinstance(data, list):
                items = data
            elif isinstance(data, dict):
                if data.get('@type') == 'Event':
                    items = [data]
                elif '@graph' in data:
                    items = [i for i in data['@graph'] if i.get('@type') == 'Event']

            for item in items:
                if item.get('@type') != 'Event':
                    continue

                title = (item.get('name') or '').strip()
                if not title:
                    continue

                start_date = _parse_date(item.get('startDate'))
                end_date = _parse_date(item.get('endDate'))

                # Location
                loc = item.get('location', {})
                arena = ''
                if isinstance(loc, dict):
                    arena = loc.get('name', '')
                elif isinstance(loc, str):
                    arena = loc

                # URL
                website = item.get('url', '')

                # Description
                desc = (item.get('description') or '')[:500]

                events.append(_make_event(
                    title=title,
                    start_date=start_date,
                    end_date=end_date,
                    arena=arena,
                    website=website or source_url,
                    description=desc,
                    source_url=source_url
                ))

        except (json.JSONDecodeError, TypeError, AttributeError):
            continue

    log.info(f'[RULES] JSON-LD: found {len(events)} events')
    return events


def _extract_markup(soup, source_url):
    """Extract events from common CSS class patterns."""
    events = []

    selectors = [
        '.tribe-events-single',          # The Events Calendar (WordPress)
        '.type-tribe_events',
        '.eventlist-event',
        '.event-item', '.event-card',
        '.event-listing', '.event-entry',
        '[itemtype*="schema.org/Event"]',
        '[data-event-id]', '[data-event]',
        '.fc-event',                      # FullCalendar
        '.em-event',                       # Events Manager
    ]

    found_elements = []
    for selector in selectors:
        elements = soup.select(selector)
        if elements:
            found_elements = elements
            log.info(f'[RULES] Markup: matched selector "{selector}" ({len(elements)} elements)')
            break

    for el in found_elements:
        # Title
        title_el = el.select_one(
            'h1, h2, h3, h4, .event-title, .entry-title, .tribe-events-list-event-title, '
            '[class*="title"], [class*="name"]'
        ) or el.select_one('a[href]')
        title = title_el.get_text(strip=True) if title_el else ''
        if not title or len(title) < 3:
            continue

        # Date
        date_el = el.select_one(
            'time[datetime], .event-date, .tribe-event-schedule-details, '
            '.start-date, [class*="date"], [datetime]'
        )
        start_date = None
        if date_el:
            dt_attr = date_el.get('datetime') or date_el.get('content') or date_el.get_text(strip=True)
            start_date = _parse_date(dt_attr)

        # Link
        link_el = el.select_one('a[href]')
        href = ''
        if link_el and link_el.get('href'):
            href = urljoin(source_url, link_el['href'])

        # Description
        desc_el = el.select_one('.event-description, .description, .excerpt, p')
        desc = desc_el.get_text(strip=True)[:500] if desc_el else ''

        events.append(_make_event(
            title=title[:255],
            start_date=start_date,
            arena='',
            website=href or source_url,
            description=desc,
            source_url=source_url
        ))

    log.info(f'[RULES] Markup: found {len(events)} events')
    return events


def _extract_tables(soup, source_url):
    """Extract events from HTML tables with recognizable headers."""
    events = []

    event_keywords = {'event', 'name', 'title', 'show', 'rodeo', 'roping', 'date',
                      'when', 'start', 'discipline', 'class', 'location', 'venue', 'arena'}

    for table in soup.find_all('table'):
        # Get headers
        header_row = table.find('tr')
        if not header_row:
            continue
        headers = [cell.get_text(strip=True).lower() for cell in header_row.find_all(['th', 'td'])]

        # Check if this table is event-related
        header_text = ' '.join(headers)
        if not any(kw in header_text for kw in event_keywords):
            continue

        # Map column indices to fields
        col_map = {}
        for i, h in enumerate(headers):
            if any(k in h for k in ('name', 'event', 'title', 'show')):
                col_map['title'] = i
            elif any(k in h for k in ('date', 'when', 'start')):
                col_map['date'] = i
            elif any(k in h for k in ('end',)):
                col_map['end_date'] = i
            elif any(k in h for k in ('location', 'venue', 'arena', 'where')):
                col_map['arena'] = i
            elif any(k in h for k in ('discipline', 'class', 'type')):
                col_map['discipline'] = i
            elif any(k in h for k in ('url', 'website', 'link')):
                col_map['website'] = i

        if 'title' not in col_map:
            continue

        # Parse rows
        rows = table.find_all('tr')[1:]
        for row in rows:
            cells = [td.get_text(strip=True) for td in row.find_all(['td', 'th'])]
            if len(cells) <= col_map['title']:
                continue

            title = cells[col_map['title']][:255]
            if not title or len(title) < 3:
                continue

            start_date = None
            if 'date' in col_map and col_map['date'] < len(cells):
                start_date = _parse_date(cells[col_map['date']])

            end_date = None
            if 'end_date' in col_map and col_map['end_date'] < len(cells):
                end_date = _parse_date(cells[col_map['end_date']])

            arena = ''
            if 'arena' in col_map and col_map['arena'] < len(cells):
                arena = cells[col_map['arena']]

            discipline = ''
            if 'discipline' in col_map and col_map['discipline'] < len(cells):
                discipline = cells[col_map['discipline']]

            website = ''
            if 'website' in col_map and col_map['website'] < len(cells):
                website = cells[col_map['website']]

            # Check for link in title cell
            if not website:
                title_cell = row.find_all(['td', 'th'])[col_map['title']]
                link = title_cell.find('a', href=True)
                if link:
                    website = urljoin(source_url, link['href'])

            events.append(_make_event(
                title=title,
                start_date=start_date,
                end_date=end_date,
                discipline=discipline,
                arena=arena,
                website=website or source_url,
                source_url=source_url
            ))

    log.info(f'[RULES] Tables: found {len(events)} events')
    return events


# ════════════════════════════════════════════════════════════
# STEP 4 — LLM Fallback (Anthropic Claude API)
# ════════════════════════════════════════════════════════════

LLM_SYSTEM_PROMPT = """You are an expert at extracting structured event data from web page text about equestrian events, rodeos, agricultural fairs, horse shows, team ropings, barrel races, futurities, and similar events.

Given the raw text content of a web page, extract ALL events mentioned and return them as a JSON array.

Each event object MUST have these fields:
- title (string): Event name
- start_date (string): YYYY-MM-DD format. If year not stated, assume current year.
- end_date (string or null): YYYY-MM-DD format, null if single-day
- discipline (string or null): e.g. team roping, barrel racing, reining, cutting
- arena (string or null): Venue or arena name
- website (string or null): Event URL if found

Optional fields to include when found:
- event_type (string or null): rodeo, horse show, roping, futurity, clinic, sale, fair
- promoter (string or null): Organizer name
- entry_fee (number or null): In dollars
- added_money (number or null): In dollars
- description (string or null): Brief summary
- contact_name (string or null)
- contact_email (string or null)
- contact_phone (string or null)
- city (string or null)
- state (string or null): Two-letter abbreviation

Rules:
- Return ONLY a valid JSON array. No markdown, no explanation, no backticks.
- Extract every distinct event. If a page lists 20 events, return all 20.
- If no events found, return [].
- Normalize dates to YYYY-MM-DD.
- If a year is missing, assume the nearest future occurrence."""


def extract_llm(page_text, source_url):
    """Send cleaned page text to Claude API for structured extraction."""

    if not ANTHROPIC_API_KEY:
        log.warning('[LLM] ANTHROPIC_API_KEY not set — skipping LLM extraction')
        return [], {'input_tokens': 0, 'output_tokens': 0, 'cost': 0.0}

    # Truncate text
    text = page_text[:MAX_TEXT_FOR_LLM]
    log.info(f'[LLM] Sending {len(text):,} chars to {ANTHROPIC_MODEL}')

    headers = {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
    }

    payload = {
        'model': ANTHROPIC_MODEL,
        'max_tokens': ANTHROPIC_MAX_TOK,
        'system': LLM_SYSTEM_PROMPT,
        'messages': [
            {
                'role': 'user',
                'content': f'Extract all events from this web page text. Source URL: {source_url}\n\n---\n\n{text}'
            }
        ]
    }

    try:
        resp = requests.post(ANTHROPIC_API_URL, headers=headers, json=payload, timeout=60)
        resp.raise_for_status()
        data = resp.json()

        # Token usage
        usage = data.get('usage', {})
        input_tokens = usage.get('input_tokens', 0)
        output_tokens = usage.get('output_tokens', 0)
        # Cost estimate: Sonnet ~$3/M in, $15/M out
        cost = (input_tokens * 3.0 / 1_000_000) + (output_tokens * 15.0 / 1_000_000)
        llm_usage = {'input_tokens': input_tokens, 'output_tokens': output_tokens, 'cost': round(cost, 6)}

        log.info(f'[LLM] Response: {input_tokens} in / {output_tokens} out (${cost:.6f})')

        # Extract text from response
        response_text = ''
        for block in data.get('content', []):
            if block.get('type') == 'text':
                response_text += block.get('text', '')

        # Parse JSON from response
        events = _parse_llm_response(response_text, source_url)
        log.info(f'[LLM] Extracted {len(events)} events')

        return events, llm_usage

    except requests.Timeout:
        log.error('[LLM] API request timed out')
        return [], {'input_tokens': 0, 'output_tokens': 0, 'cost': 0.0}
    except requests.HTTPError as e:
        log.error(f'[LLM] API HTTP error: {e.response.status_code} — {e.response.text[:200]}')
        return [], {'input_tokens': 0, 'output_tokens': 0, 'cost': 0.0}
    except requests.RequestException as e:
        log.error(f'[LLM] API request failed: {e}')
        return [], {'input_tokens': 0, 'output_tokens': 0, 'cost': 0.0}
    except Exception as e:
        log.error(f'[LLM] Unexpected error: {e}')
        return [], {'input_tokens': 0, 'output_tokens': 0, 'cost': 0.0}


def _parse_llm_response(text, source_url):
    """Parse the JSON array from Claude's response text."""
    text = text.strip()

    # Strip markdown code fences
    if text.startswith('```'):
        text = re.sub(r'^```(?:json)?\s*', '', text)
    if text.endswith('```'):
        text = re.sub(r'\s*```$', '', text)
    text = text.strip()

    # Try direct parse
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        # Try to find JSON array in the text
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            try:
                parsed = json.loads(match.group())
            except json.JSONDecodeError:
                log.error('[LLM] Could not parse JSON from response')
                return []
        else:
            log.error('[LLM] No JSON array found in response')
            return []

    # Normalize to list
    if isinstance(parsed, dict):
        parsed = [parsed]
    if not isinstance(parsed, list):
        return []

    # Normalize each event to our standard format
    events = []
    for item in parsed:
        if not isinstance(item, dict):
            continue

        title = (item.get('title') or '').strip()
        if not title:
            continue

        events.append(_make_event(
            title=title[:255],
            start_date=_parse_date(item.get('start_date')),
            end_date=_parse_date(item.get('end_date')),
            discipline=item.get('discipline', ''),
            arena=item.get('arena') or item.get('venue') or item.get('venue_name', ''),
            website=item.get('website') or item.get('url') or source_url,
            event_type=item.get('event_type', ''),
            promoter=item.get('promoter', ''),
            description=item.get('description', ''),
            entry_fee=item.get('entry_fee'),
            added_money=item.get('added_money'),
            contact_name=item.get('contact_name', ''),
            contact_email=item.get('contact_email', ''),
            contact_phone=item.get('contact_phone', ''),
            city=item.get('city', ''),
            state=item.get('state', ''),
            source_url=source_url
        ))

    return events


# ════════════════════════════════════════════════════════════
# STEP 5 — Build Standardized Event Object
# ════════════════════════════════════════════════════════════

def _make_event(title, start_date=None, end_date=None, discipline='',
                arena='', website='', event_type='', promoter='',
                description='', entry_fee=None, added_money=None,
                contact_name='', contact_email='', contact_phone='',
                city='', state='', source_url=''):
    """Build a normalized event dict with the required output fields."""
    return {
        # Required output fields
        'title':        title,
        'start_date':   start_date,
        'end_date':     end_date,
        'discipline':   discipline or None,
        'arena':        arena or None,
        'website':      website or None,
        # Extended fields
        'event_type':   event_type or None,
        'promoter':     promoter or None,
        'description':  (description or '')[:500] or None,
        'entry_fee':    entry_fee,
        'added_money':  added_money,
        'contact_name': contact_name or None,
        'contact_email': contact_email or None,
        'contact_phone': contact_phone or None,
        'city':         city or None,
        'state':        state or None,
        'source_url':   source_url,
    }


def _parse_date(date_str):
    """Attempt to parse a date string into YYYY-MM-DD. Returns None on failure."""
    if not date_str:
        return None
    date_str = str(date_str).strip()
    if not date_str:
        return None
    try:
        dt = dateparser.parse(date_str, fuzzy=True)
        return dt.strftime('%Y-%m-%d')
    except (ValueError, TypeError, OverflowError):
        return None


# ════════════════════════════════════════════════════════════
# STEP 6 — Submit Events to API
# ════════════════════════════════════════════════════════════

def submit_events(events):
    """POST each event to /api/events. Returns count of successfully created events."""
    created = 0
    for ev in events:
        if not ev.get('title') or not ev.get('start_date'):
            log.warning(f'[SUBMIT] Skipping (missing title or date): {ev.get("title", "?")}')
            continue

        payload = {
            'title':         ev['title'],
            'start_date':    ev['start_date'],
            'end_date':      ev.get('end_date'),
            'discipline':    ev.get('discipline'),
            'event_type':    ev.get('event_type'),
            'promoter':      ev.get('promoter'),
            'website':       ev.get('website'),
            'description':   ev.get('description'),
            'entry_fee':     ev.get('entry_fee'),
            'added_money':   ev.get('added_money'),
            'contact_name':  ev.get('contact_name'),
            'contact_email': ev.get('contact_email'),
            'contact_phone': ev.get('contact_phone'),
            'source_url':    ev.get('source_url'),
            'status':        'pending',
        }

        try:
            resp = requests.post(f'{API_BASE}/api/events', json=payload, timeout=10)
            if resp.status_code == 201:
                created += 1
                log.info(f'[SUBMIT] Created: {ev["title"]}')
            else:
                body = resp.json() if resp.headers.get('content-type','').startswith('application/json') else {}
                log.warning(f'[SUBMIT] API {resp.status_code}: {body.get("error","?")} — {ev["title"]}')
        except requests.RequestException as e:
            log.error(f'[SUBMIT] Failed: {e} — {ev["title"]}')

    log.info(f'[SUBMIT] {created}/{len(events)} events created')
    return created


def log_llm_usage(llm_usage, source_url):
    """Track LLM token usage via /api/llm-usage POST (if API is available)."""
    if not llm_usage or llm_usage.get('input_tokens', 0) == 0:
        return
    try:
        requests.post(f'{API_BASE}/api/llm-usage', json={
            'operation':     'event_scraping',
            'model':         ANTHROPIC_MODEL,
            'input_tokens':  llm_usage['input_tokens'],
            'output_tokens': llm_usage['output_tokens'],
            'tokens':        llm_usage['input_tokens'] + llm_usage['output_tokens'],
            'cost':          llm_usage['cost'],
            'endpoint':      'scraper.py',
            'metadata':      json.dumps({'url': source_url})
        }, timeout=5)
    except Exception:
        pass  # Non-critical


# ════════════════════════════════════════════════════════════
# MAIN PIPELINE
# ════════════════════════════════════════════════════════════

def scrape(url, use_llm=True, submit=False):
    """
    Full scrape pipeline.
    Returns dict with status, events, and metadata.
    """
    job_id = str(uuid.uuid4())
    log.info(f'[JOB {job_id[:8]}] Starting scrape: {url}')

    result = {
        'status':           'error',
        'job_id':           job_id,
        'url':              url,
        'method':           None,
        'events_found':     0,
        'events_submitted': 0,
        'llm_usage':        {'input_tokens': 0, 'output_tokens': 0, 'cost': 0.0},
        'events':           []
    }

    # ── Step 1: Fetch page ──
    raw_html = fetch_page(url)
    if not raw_html:
        result['status'] = 'fetch_failed'
        log.error(f'[JOB {job_id[:8]}] Fetch failed')
        return result

    # ── Step 2: Clean HTML ──
    soup, clean_text = clean_html(raw_html)

    # ── Step 3: Rule-based extraction ──
    events, method = extract_rules(soup, url)

    # ── Step 4: LLM fallback ──
    llm_usage = {'input_tokens': 0, 'output_tokens': 0, 'cost': 0.0}
    if not events and use_llm:
        log.info(f'[JOB {job_id[:8]}] No rule-based results — trying LLM')
        events, llm_usage = extract_llm(clean_text, url)
        if events:
            method = 'llm'

    if not events:
        result['status'] = 'no_events'
        result['method'] = method
        result['llm_usage'] = llm_usage
        log.warning(f'[JOB {job_id[:8]}] No events found')

        # Still log LLM usage even if no events found
        log_llm_usage(llm_usage, url)
        return result

    # ── Step 5: Build result ──
    result['status'] = 'complete'
    result['method'] = method
    result['events_found'] = len(events)
    result['llm_usage'] = llm_usage
    result['events'] = events

    log.info(f'[JOB {job_id[:8]}] Found {len(events)} events via {method}')

    # ── Step 6: Submit to API (optional) ──
    if submit:
        result['events_submitted'] = submit_events(events)

    # Track LLM usage
    log_llm_usage(llm_usage, url)

    return result


# ════════════════════════════════════════════════════════════
# CLI
# ════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description='Arena Network Event Scraper',
        epilog='Examples:\n'
               '  python scraper.py --url "https://lazye.com/events"\n'
               '  python scraper.py --url "https://example.com" --dry-run\n'
               '  python scraper.py --url "https://example.com" --submit\n'
               '  python scraper.py --url "https://example.com" --no-llm\n',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument('--url', required=True, help='URL to scrape for events')
    parser.add_argument('--dry-run', action='store_true', help='Parse and display, do not submit to API')
    parser.add_argument('--submit', action='store_true', help='Submit extracted events to POST /api/events')
    parser.add_argument('--no-llm', action='store_true', help='Skip LLM fallback, use rule-based only')
    parser.add_argument('--output', help='Save results to JSON file')
    parser.add_argument('--quiet', action='store_true', help='Suppress log output')

    args = parser.parse_args()

    if args.quiet:
        logging.getLogger('scraper').setLevel(logging.WARNING)

    # Run pipeline
    result = scrape(
        url=args.url,
        use_llm=not args.no_llm,
        submit=args.submit and not args.dry_run
    )

    # Output
    output_json = json.dumps(result, indent=2, default=str, ensure_ascii=False)

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output_json)
        log.info(f'[OUTPUT] Saved to {args.output}')

    print(output_json)

    # Exit code
    if result['status'] == 'complete':
        sys.exit(0)
    elif result['status'] == 'no_events':
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == '__main__':
    main()
