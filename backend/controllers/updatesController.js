import { getRecentUpdatesForAdmin } from "../services/dashboardService.js";

export async function getGlobalUpdatesFeed(req, res, next) {
  try {
    const limit = Number(req.query.limit || 20);
    const updates = await getRecentUpdatesForAdmin(limit);
    return res.json(updates);
  } catch (error) {
    next(error);
  }
}
