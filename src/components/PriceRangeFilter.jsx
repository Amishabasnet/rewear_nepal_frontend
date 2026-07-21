import { useEffect, useState } from "react";

export default function PriceRangeFilter({ minPrice = "", maxPrice = "", onApply }) {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMin(minPrice);
    setMax(maxPrice);
  }, [minPrice, maxPrice]);

  const handleApply = () => {
    if (min && max && Number(min) > Number(max)) {
      // swap so the user never ends up with an inverted, empty-result range
      onApply({ minPrice: max, maxPrice: min });
      return;
    }
    onApply({ minPrice: min, maxPrice: max });
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          inputMode="numeric"
          placeholder="Min"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          className="input-field !py-1.5 text-sm"
        />
        <span className="text-ink-400">–</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          placeholder="Max"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="input-field !py-1.5 text-sm"
        />
      </div>
      <button
        onClick={handleApply}
        className="mt-2 w-full rounded-lg border border-ink-200 py-1.5 text-xs font-semibold text-ink-600 hover:border-rust-400 hover:text-rust-500"
      >
        Apply price range
      </button>
    </div>
  );
}
