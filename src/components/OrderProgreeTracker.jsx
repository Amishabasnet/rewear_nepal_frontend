import { Check, X } from "lucide-react";
import { ORDER_PROGRESS_STEPS, ORDER_STATUS_META } from "../utils/constants";

export default function OrderProgressTracker({ status }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 text-cream-50">
          <X className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-700">Order cancelled</p>
          <p className="text-xs text-red-500">This order will not be processed further.</p>
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_PROGRESS_STEPS.indexOf(status);

  return (
    <div className="flex items-start">
      {ORDER_PROGRESS_STEPS.map((step, i) => {
        const isComplete = i <= currentIndex;
        const isLast = i === ORDER_PROGRESS_STEPS.length - 1;
        return (
          <div key={step} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  isComplete ? "bg-forest-600 text-cream-50" : "bg-cream-200 text-ink-400"
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`whitespace-nowrap text-[11px] font-medium capitalize ${
                  isComplete ? "text-ink-800" : "text-ink-400"
                }`}
              >
                {ORDER_STATUS_META[step].label}
              </span>
            </div>
            {!isLast && (
              <div className={`mx-1.5 mb-4 h-px flex-1 ${i < currentIndex ? "bg-forest-500" : "bg-ink-100"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
