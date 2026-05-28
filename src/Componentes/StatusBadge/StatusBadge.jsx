function StatusBadge({ label, style }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold shadow-sm ${style}`}
    >
      {label}
    </span>
  );
}

export default StatusBadge;
