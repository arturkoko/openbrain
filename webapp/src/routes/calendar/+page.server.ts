import type { PageServerLoad } from "./$types";
import { listEvents } from "$lib/server/calendar";

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!(locals as Record<string, unknown>).user) return { events: [] };
  const from = url.searchParams.get("from") || new Date().toISOString().substring(0, 10);
  // Default: show 60 days
  const to = url.searchParams.get("to") || new Date(Date.now() + 60 * 86400000).toISOString().substring(0, 10);
  try {
    const events = await listEvents(from, to);
    return { events, from, to };
  } catch {
    return { events: [], from, to };
  }
};
