import { randomUUID } from "crypto";

const RADICALE_URL = process.env.RADICALE_URL || "http://radicale:5232";
const RADICALE_USER = process.env.RADICALE_USER || "artur";
const RADICALE_PASSWORD = process.env.RADICALE_PASSWORD || "";
const CALENDAR_PATH = `/${RADICALE_USER}/calendar/`;

function authHeader(): string {
  return "Basic " + Buffer.from(`${RADICALE_USER}:${RADICALE_PASSWORD}`).toString("base64");
}

function toICSDatetime(dateStr: string): string {
  // "2026-03-15" => "20260315" (all-day)
  // "2026-03-15T14:00:00" => "20260315T140000" (local time)
  // "2026-03-15T14:00:00Z" => "20260315T140000Z" (UTC)
  if (dateStr.length === 10) return dateStr.replace(/-/g, "");
  // Remove ms, keep Z if present
  const clean = dateStr.replace(/\.\d+/, "");
  return clean.replace(/[-:]/g, "").replace("T", "T");
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
  const body = `<?xml version="1.0" encoding="utf-8" ?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop><D:getetag/><C:calendar-data/></D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="${start.replace(/-/g, "")}T000000Z" end="${end.replace(/-/g, "")}T235959Z"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`;
  try {
    const res = await fetch(RADICALE_URL + CALENDAR_PATH, {
      method: "REPORT",
      headers: { Authorization: authHeader(), "Content-Type": "application/xml; charset=utf-8", Depth: "1" },
      body,
    });
    if (!res.ok) return await listAllEvents();
    const text = await res.text();
    return parseEvents(text);
  } catch {
    return await listAllEvents();
  }
}

async function listAllEvents(): Promise<CalEvent[]> {
  try {
    const res = await fetch(RADICALE_URL + CALENDAR_PATH, { method: "GET", headers: { Authorization: authHeader() } });
    if (!res.ok) return [];
    return parseICS(await res.text());
  } catch { return []; }
}

function parseEvents(xml: string): CalEvent[] {
  const events: CalEvent[] = [];
  const re = /<C:calendar-data[^>]*>([\s\S]*?)<\/C:calendar-data>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const ics = m[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    events.push(...parseICS(ics));
  }
  return events;
}

function parseICS(ics: string): CalEvent[] {
  const events: CalEvent[] = [];
  const blocks = ics.split("BEGIN:VEVENT");
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split("END:VEVENT")[0];
    const get = (key: string) => {
      const r = new RegExp("^" + key + "[^:]*:(.+)$", "m");
      const m = block.match(r);
      return m ? m[1].trim() : undefined;
    };
    const uid = get("UID"), title = get("SUMMARY");
    if (uid && title) {
      events.push({
        uid,
        title,
        start: get("DTSTART") || "",
        end: get("DTEND"),
        description: get("DESCRIPTION"),
        location: get("LOCATION"),
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
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");

  let dtStart: string;
  let dtEnd: string;

  if (isAllDay) {
    dtStart = opts.start.replace(/-/g, "");
    if (opts.end) {
      // CalDAV all-day DTEND is exclusive, so add 1 day
      const endDate = new Date(opts.end);
      endDate.setDate(endDate.getDate() + 1);
      dtEnd = endDate.toISOString().substring(0, 10).replace(/-/g, "");
    } else {
      const nextDay = new Date(opts.start);
      nextDay.setDate(nextDay.getDate() + 1);
      dtEnd = nextDay.toISOString().substring(0, 10).replace(/-/g, "");
    }
  } else {
    dtStart = toICSDatetime(opts.start);
    if (opts.end) {
      dtEnd = toICSDatetime(opts.end);
    } else {
      // Default 1 hour
      dtEnd = toICSDatetime(new Date(new Date(opts.start).getTime() + 3600000).toISOString());
    }
  }

  const startProp = isAllDay ? `DTSTART;VALUE=DATE:${dtStart}` : `DTSTART:${dtStart}`;
  const endProp = isAllDay ? `DTEND;VALUE=DATE:${dtEnd}` : `DTEND:${dtEnd}`;

  // Build ICS lines — RFC 5545 requires CRLF
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OpenBrain//AI//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    startProp,
    endProp,
    `SUMMARY:${opts.title}`,
  ];
  if (opts.description) lines.push(`DESCRIPTION:${opts.description.replace(/\n/g, "\\n")}`);
  if (opts.location) lines.push(`LOCATION:${opts.location}`);
  lines.push("END:VEVENT", "END:VCALENDAR");

  const ics = lines.join("\r\n") + "\r\n";

  const res = await fetch(RADICALE_URL + CALENDAR_PATH + uid + ".ics", {
    method: "PUT",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "text/calendar; charset=utf-8",
      "If-None-Match": "*",
    },
    body: ics,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create event: ${res.status} ${body}`);
  }
  return uid;
}

export async function deleteEvent(uid: string): Promise<void> {
  const res = await fetch(RADICALE_URL + CALENDAR_PATH + uid + ".ics", {
    method: "DELETE",
    headers: { Authorization: authHeader() },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete event: ${res.status}`);
  }
}
