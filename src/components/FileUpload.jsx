import { forwardRef, useEffect, useState } from "react";
import { UploadCloud, ImageOff } from "lucide-react";

const FileUpload = forwardRef(
  ({ label, hint, error, onChange, onFileChange, round = false, ...props }, ref) => {
    const [preview, setPreview] = useState(null);

    useEffect(() => {
      return () => {
        if (preview) URL.revokeObjectURL(preview);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preview]);

    const handleChange = (e) => {
      const file = e.target.files?.[0] || null;
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return file ? URL.createObjectURL(file) : null;
      });
      onChange?.(e);
      onFileChange?.(file);
    };

    return (
      <div className="w-full">
        {label && <label className="label-field">{label}</label>}
        <div className="flex items-center gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-dashed border-ink-200 bg-cream-50 text-ink-300 ${
              round ? "rounded-full" : "rounded-lg"
            }`}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <ImageOff className="h-5 w-5" />
            )}
          </div>

          <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-ink-300 bg-cream-50 px-4 py-2.5 text-sm font-medium text-ink-600 transition hover:border-rust-500 hover:text-rust-500">
            <UploadCloud className="h-4 w-4" />
            <span>{preview ? "Change file" : "Choose file"}</span>
            <input
              ref={ref}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
              {...props}
            />
          </label>
        </div>
        {hint && !error && <p className="mt-1.5 text-xs text-ink-400">{hint}</p>}
        {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";
export default FileUpload;
