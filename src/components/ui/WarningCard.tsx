import { Info, AlertTriangle, AlertOctagon, CheckCircle } from "lucide-react";
import type { ReactNode } from "react";

type Variant = "info" | "warning" | "danger" | "success";

const variants = {
  info:    { bg: "bg-blue-50",    border: "border-blue-100",   Icon: Info,          iconCls: "text-blue-500",    text: "text-blue-800"    },
  warning: { bg: "bg-amber-50",   border: "border-amber-200",  Icon: AlertTriangle, iconCls: "text-amber-500",   text: "text-amber-800"   },
  danger:  { bg: "bg-red-50",     border: "border-red-200",    Icon: AlertOctagon,  iconCls: "text-red-500",     text: "text-red-800"     },
  success: { bg: "bg-emerald-50", border: "border-emerald-100",Icon: CheckCircle,   iconCls: "text-emerald-500", text: "text-emerald-800" },
} as const;

interface WarningCardProps {
  variant?: Variant;
  title?: string;
  children: ReactNode;
  className?: string;
  action?: { label: string; onClick: () => void };
}

export function WarningCard({ variant = "info", title, children, className = "", action }: WarningCardProps) {
  const { bg, border, Icon, iconCls, text } = variants[variant];
  return (
    <div className={`rounded-xl border ${bg} ${border} p-3.5 flex gap-2.5 ${className}`}>
      <Icon size={14} className={`${iconCls} shrink-0 mt-0.5`} />
      <div className={`text-sm ${text} leading-snug flex-1`}>
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="text-sm opacity-90">{children}</div>
        {action && (
          <button
            onClick={action.onClick}
            className={`mt-1.5 text-xs font-semibold underline underline-offset-2 ${text}`}
          >
            {action.label} →
          </button>
        )}
      </div>
    </div>
  );
}
