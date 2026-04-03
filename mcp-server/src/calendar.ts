import { randomUUID } from 'crypto';

const RADICALE_URL = process.env.RADICALE_URL || 'http://127.0.0.1:5232';
const RADICALE_USER = process.env.RADICALE_USER || 'artur';
const RADICALE_PASSWORD = process.env.RADICALE_PASSWORD || 'change_me_radicale';
const CALENDAR_PATH = `/${RADICALE_USER}/calendar.ics/`;

function authHeader(): string {
  return 'Basic ' + Buffer.from(`${RADICALE_USER}:${RADICALE_PASSWORD}`).toString('base64');
}

function formatICSDate(dateStr: string): string {
  // Handle YYYY-MM-DD (all-day) or ISO datetime
  if (dateStr.length === 10) {
    return dateStr.replace(/-/g, '');
  }
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export interface CalEvent {
  uid: string;
  title: string;
  start: string;
  end?: string;
  description?: string;
  location?: string;
}

export async function listEvents(from?: string, to?: string): Promise<CalEvent[]> {
  const start = from || new Date().toISOString().substring(0, 10);
  const end = to || new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10);

  // Use REPORT method for CalDAV time-range query
  const body = `<?xml version="1.0" encoding="utf-8" ?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop><D:getetag/><C:calendar-data/></D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="${start.replace(/-/g, '')}T000000Z" end="${end.replace(/-/g, '')}T235959Z"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`;

  try {
    const res = await fetch(RADICALE_URL + CALENDAR_PATH, {
      method: 'REPORT',
      headers: {
        Authorization: authHeader(),
        'Content-Type': 'application/xml; charset=utf-8',
        Depth: '1',
      },
      body,
    });

    if (!res.ok) {
      // Fallback: try to GET all events
      return await listAllEvents();
    }

    const text = await res.text();
    return parseEvents(text);
  } catch {
    return await listAllEvents();
  }
}

async function listAllEvents(): Promise<CalEvent[]> {
  try {
    const res = await fetch(RADICALE_URL + CALENDAR_PATH, {
      method: 'GET',
      headers: { Authorization: authHeader() },
    });
    if (!res.ok) return [];
    const text = await res.text();
    return parseICS(text);
  } catch {
    return [];
  }
}

function parseEvents(xml: string): CalEvent[] {
  const events: CalEvent[] = [];
  const calDataRegex = /<C:calendar-data[^>]*>([\s\S]*?)<\/C:calendar-data>/gi;
  let match;
  while ((match = calDataRegex.exec(xml)) !== null) {
    const ics = match[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    events.push(...parseICS(ics));
  }
  return events;
}

function parseICS(ics: string): CalEvent[] {
  const events: CalEvent[] = [];
  const blocks = ics.split('BEGIN:VEVENT');
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split('END:VEVENT')[0];
    const get = (key: string) => {
      const re = new RegExp(`^${key}[^:]*:(.+)$`, 'm');
      const m = block.match(re);
      return m ? m[1].trim() : undefined;
    };
    const uid = get('UID');
    const title = get('SUMMARY');
    if (uid && title) {
      events.push({
        uid,
        title,
        start: get('DTSTART') || '',
        end: get('DTEND'),
        description: get('DESCRIPTION'),
        location: get('LOCATION'),
      });
    }
  }
  return events;
}

export async function createEvent(opts: {
  title: string;
  start: string;
  end?: string;
  description?: string;
  location?: string;
}): Promise<string> {
  const uid = randomUUID();
  const isAllDay = opts.start.length === 10;
  const dtStart = formatICSDate(opts.start);
  let dtEnd: string;
  if (opts.end) {
    dtEnd = formatICSDate(opts.end);
  } else if (isAllDay) {
    const next = new Date(opts.start);
    next.setDate(next.getDate() + 1);
    dtEnd = next.toISOString().substring(0, 10).replace(/-/g, '');
  } else {
    const end = new Date(new Date(opts.start).getTime() + 3600000);
    dtEnd = formatICSDate(end.toISOString());
  }

  const startProp = isAllDay ? `DTSTART;VALUE=DATE:${dtStart}` : `DTSTART:${dtStart}`;
  const endProp = isAllDay ? `DTEND;VALUE=DATE:${dtEnd}` : `DTEND:${dtEnd}`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OpenBrain//MCP//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(new Date().toISOString())}`,
    startProp,
    endProp,
    `SUMMARY:${opts.title}`,
    opts.description ? `DESCRIPTION:${opts.description}` : '',
    opts.location ? `LOCATION:${opts.location}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  // Ensure calendar collection exists
  await fetch(RADICALE_URL + CALENDAR_PATH, {
    method: 'MKCALENDAR',
    headers: { Authorization: authHeader() },
  }).catch(() => {});

  const res = await fetch(RADICALE_URL + CALENDAR_PATH + uid + '.ics', {
    method: 'PUT',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'text/calendar; charset=utf-8',
    },
    body: ics,
  });

  if (!res.ok) {
    throw new Error(`Failed to create event: ${res.status} ${await res.text()}`);
  }

  return uid;
}

export async function deleteEvent(uid: string): Promise<void> {
  const res = await fetch(RADICALE_URL + CALENDAR_PATH + uid + '.ics', {
    method: 'DELETE',
    headers: { Authorization: authHeader() },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete event: ${res.status}`);
  }
}
