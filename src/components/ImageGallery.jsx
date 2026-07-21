import { useState } from "react";

export default function ImageGallery({ images = [], alt = "" }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : ["https://placehold.co/600x750?text=No+Image"];

  return (
    <div>
      <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-cream-200">
        <img src={list[active]} alt={alt} className="h-full w-full object-cover" />
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {list.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                active === i ? "border-rust-500" : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
