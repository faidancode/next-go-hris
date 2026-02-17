import { cn } from "@/lib/utils"; // kalau kamu pakai cn helper
import { AlertCircle, BadgeCheck, BadgeAlert, Info } from "lucide-react";
import { ReactNode } from "react";

type AlertVariant = "error" | "warning" | "info" | "success";

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
  showIcon?: boolean;
}

const VARIANT_STYLES: Record<AlertVariant, string> = {
  error: "border-red-800 bg-red-200 text-red-800",
  warning: "border-orange-800 bg-orange-200 text-orange-800",
  info: "border-blue-800 bg-blue-200 text-blue-800",
  success: "border-green-800 bg-green-200 text-green-800",
};

const VARIANT_ICONS: Record<AlertVariant, React.ElementType> = {
  error: AlertCircle,
  warning: BadgeAlert,
  info: Info,
  success: BadgeCheck,
};

export function Alert({
  variant = "info",
  children,
  className,
  showIcon = true,
}: AlertProps) {
  const Icon = VARIANT_ICONS[variant];

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-l-4 px-3 py-2 text-sm",
        VARIANT_STYLES[variant],
        className
      )}
      role="alert"
    >
      {showIcon && <Icon className="mt-0.5 h-6 w-6 shrink-0" />}
      <div>{children}</div>
    </div>
  );
}
