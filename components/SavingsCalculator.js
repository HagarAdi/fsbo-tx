export default function SavingsCalculator({ homeValue = 600000, commissionRate = 0.03 }) {
  const savings = homeValue * commissionRate;
  const formatted = savings.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const homeFmt = homeValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-green-800 uppercase tracking-wide mb-3">
        Your Estimated Savings
      </h2>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-extrabold text-green-700">{formatted}</span>
        <span className="text-gray-500 text-sm mb-1">saved by selling FSBO</span>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Based on a {homeFmt} home value at {commissionRate * 100}% listing-side commission.
      </p>
    </div>
  );
}
