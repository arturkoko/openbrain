import { z } from "zod";
import { config } from "../config.js";

const RADICALE = config.radicale;

async function caldavRequest(method: string, path: string, body?: string, contentType?: string) {
  const headers: Record<string, string> = {
    Authorization: "Basic " + Buffer.from(`${RADICALE.user}:${RADICALE.password}`).toString("base64"),
  };
  if (contentType) headers["Content-Type"] = contentType;

  const response = await fetch(`${RADICALE.url}${path}`, {
    method,
    headers,
    body,
  });

  return { status: response.status, text: await response.text() };
}

function generateUID() {
  return `openbrain-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildVEvent(params: {
  uid: string;
  summary: string;
  dtstart: string;
  dtend?: string;
  description?: string;
  location?: string;
}) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OpenBrain//EN",
    "BEGIN:VEVENT",
    `UID:${params.uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "")}`,
    `DTSTART:${params.dtstart.replace(/[-:]/g, "").replace(/\.\d+/, "")}`,
  ];

  if (params.dtend) {
    lines.push(`DTEND:${params.dtend.replace(/[-:]/g, "").replace(/\.\d+/, "")}`);
  }

  lines.push(`SUMMARY:${params.summary}`);

  if (params.description) {
    lines.push(`DESCRIPTION:${params.description.replace(/\n/g, "\\n")}`);
  }
  if (params.location) {
    lines.push(`LOCATION:${params.location}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

export const calendarTools = {
  cal_list_events: {
    description:
      "List calendar events within a date range from the CalDAV server. Returns event summaries, dates, and UIDs.",
    inputSchema: z.object({
      start: z.string().describe("Start date in ISO format, e.g. '2026-03-01'"),
      end: z.string().describe("End date in ISO format, e.g. '2026-03-31'"),
    }),
    async execute({ start, end }: { start: string; end: string }) {
      const reportBody = `<?xml version="1.0" encoding="utf-8" ?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:getetag/>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="${start.replace(/-/g, "")}T000000Z" end="${end.replace(/-/g, "")}T235959Z"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`;

      const { status, text } = await caldavRequest(
        "REPORT",
        `/${RADICALE.user}/calendar.ics/`,
        reportBody,
        "application/xml; charset=utf-8"
      );

      if (status >= 400) {
        return {
          content: [{ type: "text" as const, text: `CalDAV error (${status}): ${text}` }],
          isError: true,
        };
      }

      // Simple extraction of VEVENT data from the XML response
      const events: { uid: string; summary: string; start: string; end: string; description: string }[] = [];
      const calDataRegex = /BEGIN:VEVENT[\s\S]*?END:VEVENT/g;
      let match;
      while ((match = calDataRegex.exec(text)) !== null) {
        const block = match[0];
        const uid = block.match(/UID:(.*)/)?.[1]?.trim() || "";
        const summary = block.match(/SUMMARY:(.*)/)?.[1]?.trim() || "";
        const dtstart = block.match(/DTSTART[^:]*:(.*)/)?.[1]?.trim() || "";
        const dtend = block.match(/DTEND[^:]*:(.*)/)?.[1]?.trim() || "";
        const description = block.match(/DESCRIPTION:(.*)/)?.[1]?.trim().replace(/\\n/g, "\n") || "";
        events.push({ uid, summary, start: dtstart, end: dtend, description });
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ events, count: events.length }, null, 2) }],
      };
    },
  },

  cal_create_event: {
    description:
      "Create a new calendar event. The event will sync to iOS Calendar via CalDAV.",
    inputSchema: z.object({
      summary: z.string().describe("Event title"),
      dtstart: z.string().describe("Start date/time in ISO format, e.g. '2026-03-15T10:00:00'"),
      dtend: z.string().optional().describe("End date/time in ISO format"),
      description: z.string().optional().describe("Event description"),
      location: z.string().optional().describe("Event location"),
    }),
    async execute(params: {
      summary: string;
      dtstart: string;
      dtend?: string;
      description?: string;
      location?: string;
    }) {
      const uid = generateUID();
      const ics = buildVEvent({ uid, ...params });

      const { status } = await caldavRequest(
        "PUT",
        `/${RADICALE.user}/calendar.ics/${uid}.ics`,
        ics,
        "text/calendar; charset=utf-8"
      );

      if (status >= 400) {
        return {
          content: [{ type: "text" as const, text: `Failed to create event (HTTP ${status})` }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ created: true, uid, summary: params.summary, start: params.dtstart }, null, 2) }],
      };
    },
  },

  cal_update_event: {
    description:
      "Update an existing calendar event by UID.",
    inputSchema: z.object({
      uid: z.string().describe("The UID of the event to update"),
      summary: z.string().describe("Updated event title"),
      dtstart: z.string().describe("Updated start date/time"),
      dtend: z.string().optional().describe("Updated end date/time"),
      description: z.string().optional().describe("Updated description"),
      location: z.string().optional().describe("Updated location"),
    }),
    async execute(params: {
      uid: string;
      summary: string;
      dtstart: string;
      dtend?: string;
      description?: string;
      location?: string;
    }) {
      const ics = buildVEvent(params);

      const { status } = await caldavRequest(
        "PUT",
        `/${RADICALE.user}/calendar.ics/${params.uid}.ics`,
        ics,
        "text/calendar; charset=utf-8"
      );

      if (status >= 400) {
        return {
          content: [{ type: "text" as const, text: `Failed to update event (HTTP ${status})` }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ updated: true, uid: params.uid }, null, 2) }],
      };
    },
  },

  cal_delete_event: {
    description:
      "Delete a calendar event by UID.",
    inputSchema: z.object({
      uid: z.string().describe("The UID of the event to delete"),
    }),
    async execute({ uid }: { uid: string }) {
      const { status } = await caldavRequest(
        "DELETE",
        `/${RADICALE.user}/calendar.ics/${uid}.ics`
      );

      if (status >= 400) {
        return {
          content: [{ type: "text" as const, text: `Failed to delete event (HTTP ${status})` }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ deleted: true, uid }, null, 2) }],
      };
    },
  },
};
