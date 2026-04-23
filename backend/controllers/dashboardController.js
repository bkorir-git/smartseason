import { getAdminDashboard, getAgentDashboard } from "../services/dashboardService.js";

export async function getAdminDashboardData(req, res, next) {
  try {
    const data = await getAdminDashboard(req.user);
    return res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getAgentDashboardData(req, res, next) {
  try {
    const data = await getAgentDashboard(req.user);
    return res.json(data);
  } catch (error) {
    next(error);
  }
}
