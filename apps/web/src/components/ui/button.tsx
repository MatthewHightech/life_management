import { cn } from "@/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
};

const variants = {
  primary: "bg-primary-container text-on-primary hover:bg-primary hover:shadow-sm",
  secondary: "bg-sage text-primary hover:bg-sage/70 hover:shadow-sm",
  outline: "border border-primary-container bg-transparent text-primary-container hover:bg-sage/40",
  ghost: "border border-transparent text-text-main hover:border-border-subtle hover:bg-surface",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
