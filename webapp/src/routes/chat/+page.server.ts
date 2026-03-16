import type { PageServerLoad } from "./$types";
import { loadHistory } from "$lib/server/ai";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) return { history: [] };
  const history = await loadHistory(50);
  return { history };
};
