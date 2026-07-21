import { useEffect, useRef } from "react";
import { UploadCloud, X, ImagePlus } from "lucide-react";

export default function MultiImageUpload({
  value = [],
  onChange,
  label = "Product images",
  hint = "Add up to 8 photos. JPG or PNG, clear lighting helps buyers trust your listing.",
  error,
  maxImages = 8,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      value.forEach((item) => {
        if (item.file && item.preview) URL.revokeObjectURL(item.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;

    const room = maxImages - value.length;
    if (room <= 0) return;

    const newItems = incoming.slice(0, room).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      preview: URL.createObjectURL(file),
      remoteUrl: null,
      uploading: false,
      error: null,
    }));

    onChange([...value, ...newItems]);
  };

  const removeItem = (id) => {
    const target = value.find((item) => item.id === id);
    if (target?.file && target.preview) URL.revokeObjectURL(target.preview);
    onChange(value.filter((item) => item.id !== id));
  };

  return (
    <div className="w-full">
      {label && <label className="label-field">{label}</label>}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-ink-100 bg-cream-100"
          >
            <img
              src={item.preview || item.remoteUrl}
              alt="Product preview"
              className="h-full w-full object-cover"
            />
            {item.uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink-900/40">
                <svg className="h-5 w-5 animate-spin text-cream-50" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </div>
            )}
            {item.error && (
              <div className="absolute inset-x-0 bottom-0 bg-red-600/90 px-1.5 py-1 text-center text-[10px] font-medium text-cream-50">
                Upload failed
              </div>
            )}
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink-900/70 text-cream-50 opacity-0 transition group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {value.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-300 bg-cream-50 text-ink-500 transition hover:border-rust-500 hover:text-rust-500"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-xs font-medium">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-400">
        <UploadCloud className="h-3.5 w-3.5" />
        <span>{hint}</span>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
