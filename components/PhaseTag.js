const colors = {
  Prepare: "bg-blue-100 text-blue-700",
  Market: "bg-yellow-100 text-yellow-700",
  Close: "bg-purple-100 text-purple-700",
};

export default function PhaseTag({ phase }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[phase] ?? "bg-gray-100 text-gray-600"}`}>
      {phase}
    </span>
  );
}
