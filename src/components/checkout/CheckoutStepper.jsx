import { Check } from "lucide-react";

const STEPS = ["Delivery Address", "Order Review", "Payment Method", "Place Order"];

export default function CheckoutStepper({ currentStep, onStepClick }) {
  return (
    <div className="mb-6 flex items-center overflow-x-auto rounded-xl border border-ink-100 bg-white p-4">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const isComplete = step < currentStep;
        const isActive = step === currentStep;
        const clickable = isComplete;

        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick(step)}
              className="flex shrink-0 items-center gap-2"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  isActive
                    ? "bg-rust-500 text-cream-50"
                    : isComplete
                    ? "bg-forest-600 text-cream-50"
                    : "bg-cream-200 text-ink-400"
                }`}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" /> : step}
              </span>
              <span
                className={`hidden whitespace-nowrap text-xs font-semibold sm:inline ${
                  isActive ? "text-ink-900" : isComplete ? "text-ink-700" : "text-ink-400"
                }`}
              >
                {label}
              </span>
            </button>
            {step < STEPS.length && (
              <div className={`mx-2 h-px flex-1 ${isComplete ? "bg-forest-500" : "bg-ink-100"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
