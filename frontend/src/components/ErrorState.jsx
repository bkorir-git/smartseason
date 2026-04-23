export default function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="state-card error-state">
      <h3>Unable to load data</h3>
      <p>{message}</p>
      {onRetry ? (
        <button className="button secondary" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}
