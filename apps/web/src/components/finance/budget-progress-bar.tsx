import { cn } from "@/lib/cn";

type BudgetProgressBarProps = {
  percent: number;
  className?: string;
};

function remainingBarColor(remainingPercent: number): string {
  const value = Math.max(0, Math.min(100, remainingPercent));

  if (value >= 50) {
    const blend = (value - 50) / 50;
    const hue = 48 + blend * 94;
    return `hsl(${hue} 34% 78%)`;
  }

  const blend = value / 50;
  const hue = 6 + blend * 42;
  return `hsl(${hue} 38% 76%)`;
}

export function BudgetProgressBar({ percent, className }: BudgetProgressBarProps) {
  const width = Math.max(0, Math.min(100, percent));

  return (
    <div className={cn("h-1.5 w-full min-w-[4rem] rounded-full bg-border-subtle/80", className)}>
      <div
        className="h-1.5 rounded-full transition-[width,background-color] duration-300"
        style={{
          width: `${width}%`,
          backgroundColor: remainingBarColor(width),
        }}
      />
    </div>
  );
}
