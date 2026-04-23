export default function StatusBadge({ label }) {
  const normalized = String(label || "").toLowerCase();

  let className = "badge";

  if (normalized === "active") {
    className += " badge-active";
  } else if (normalized === "at risk") {
    className += " badge-risk";
  } else if (normalized === "completed") {
    className += " badge-completed";
  } else if (normalized === "planted") {
    className += " badge-stage-planted";
  } else if (normalized === "growing") {
    className += " badge-stage-growing";
  } else if (normalized === "ready") {
    className += " badge-stage-ready";
  } else if (normalized === "harvested") {
    className += " badge-stage-harvested";
  }

  return <span className={className}>{label}</span>;
}
