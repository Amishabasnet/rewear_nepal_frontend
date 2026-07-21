import { forwardRef } from "react";

const Textarea = forwardRef(({ label, error, rows = 4, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="label-field">{label}</label>}
      <textarea
        ref={ref}
        rows={rows}
        className={`input-field resize-none ${
          error ? "border-red-400 focus:border-red-500 focus:ring-red-500" : ""
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
});

Textarea.displayName = "Textarea";
export default Textarea;
