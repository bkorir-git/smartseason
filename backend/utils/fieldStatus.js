export const FIELD_STAGES = ["Planted", "Growing", "Ready", "Harvested"];
export const RISK_DAYS = 7;

function daysBetween(startDate, endDate = new Date()) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function computeFieldStatus(field, updates = []) {
  if (field.current_stage === "Harvested") {
    return "Completed";
  }

  const sortedUpdates = [...updates].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (sortedUpdates.length === 0) {
    return daysBetween(field.planting_date) >= RISK_DAYS ? "At Risk" : "Active";
  }

  const latestUpdate = sortedUpdates[0];
  const daysSinceLastUpdate = daysBetween(latestUpdate.created_at);

  if (daysSinceLastUpdate >= RISK_DAYS) {
    return "At Risk";
  }

  if (sortedUpdates.length > 1) {
    const previousUpdate = sortedUpdates[1];
    const stageDidNotChange = latestUpdate.stage === previousUpdate.stage;
    const gapBetweenUpdates = daysBetween(previousUpdate.created_at, latestUpdate.created_at);

    if (stageDidNotChange && gapBetweenUpdates >= RISK_DAYS) {
      return "At Risk";
    }
  }

  return "Active";
}
