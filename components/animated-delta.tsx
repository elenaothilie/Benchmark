"use client";

function formatSigned(value: number, digits = 1) {
  if (value === 0) return `0.${"0".repeat(digits)}`;
  const sign = value > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("nb-NO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Math.abs(value))}`;
}

export function AnimatedDelta({
  value,
  showLead = true,
  digits = 1,
}: {
  value: number;
  showLead?: boolean;
  digits?: number;
}) {
  const isPositive = value > 0;
  const label = showLead && isPositive ? "LEAD" : "pp";

  return (
    <>
      {formatSigned(value, digits)} {label}
    </>
  );
}
