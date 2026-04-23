export default function EmptyState({ title = "No data available", message = "Nothing to show yet." }) {
  return (
    <div className="state-card empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
