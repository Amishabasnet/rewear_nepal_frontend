import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Flag, LogIn, X } from "lucide-react";
import productService from "../services/productService";
import { useAuth } from "../context/AuthContext";

const REASON_OPTIONS = [
  { value: "counterfeit", label: "Counterfeit or fake item" },
  { value: "misleading_description", label: "Misleading description" },
  { value: "inappropriate_images", label: "Inappropriate images" },
  { value: "prohibited_item", label: "Prohibited item" },
  { value: "other", label: "Other" },
];

export default function ReportProductButton({ productId }) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    if (submitting) return;
    setOpen(false);
    setReason("");
    setDetails("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }

    setSubmitting(true);
    try {
      await productService.reportProduct(productId, { reason, details: details.trim() });
      toast.success("Thanks — our team will review this listing.");
      close();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit your report");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-400 hover:text-rust-500"
      >
        <LogIn className="h-3.5 w-3.5" /> Log in to report this item
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-400 hover:text-red-500"
      >
        <Flag className="h-3.5 w-3.5" /> Report this listing
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-sm rounded-xl bg-white p-5 shadow-lg"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900">Report this listing</h3>
              <button type="button" onClick={close} className="text-ink-400 hover:text-ink-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="label-field">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field mb-3"
            >
              <option value="">Select a reason...</option>
              {REASON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <label className="label-field">Additional details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Anything that would help our team review this faster"
              rows={3}
              maxLength={500}
              className="input-field resize-none"
            />

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-4 w-full disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit report"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
