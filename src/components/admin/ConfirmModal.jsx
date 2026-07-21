import { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import Textarea from "../Textarea";

const TONE_STYLES = {
  default: { iconBg: "bg-forest-50 text-forest-600", button: "bg-forest-600 hover:bg-forest-700" },
  success: { iconBg: "bg-forest-50 text-forest-600", button: "bg-forest-600 hover:bg-forest-700" },
  danger: { iconBg: "bg-red-50 text-red-600", button: "bg-red-600 hover:bg-red-700" },
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  tone = "default",
  requireReason = false,
  reasonLabel = "Reason",
  reasonPlaceholder = "Explain why...",
  loading = false,
  onConfirm,
  onClose,
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReason("");
      setTouched(false);
    }
  }, [open]);

  if (!open) return null;

  const styles = TONE_STYLES[tone] || TONE_STYLES.default;
  const reasonInvalid = requireReason && touched && !reason.trim();

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setTouched(true);
      return;
    }
    onConfirm(requireReason ? reason.trim() : undefined);
  };

  const handleBackdropClick = () => {
    if (!loading) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleBackdropClick} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 text-ink-400 transition hover:text-ink-600 disabled:opacity-40"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${styles.iconBg}`}>
          <AlertTriangle className="h-5 w-5" />
        </div>

        <h3 className="pr-6 text-base font-semibold text-ink-900">{title}</h3>
        {message && <p className="mt-1.5 text-sm text-ink-500">{message}</p>}

        {requireReason && (
          <div className="mt-4">
            <Textarea
              label={reasonLabel}
              placeholder={reasonPlaceholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              error={reasonInvalid ? "A reason is required" : undefined}
              disabled={loading}
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-600 transition hover:bg-cream-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`rounded-full px-4 py-2 text-sm font-semibold text-cream-50 transition disabled:opacity-50 ${styles.button}`}
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
