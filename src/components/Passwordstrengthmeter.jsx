import { calculatePasswordStrength } from "../utils/passwordStrength";

export default function PasswordStrengthMeter({ password }) {
  if (!password) return null;

  const { score, label, feedback, barColor, textColor } = calculatePasswordStrength(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < score ? barColor : "bg-ink-200"
            }`}
          />
        ))}
      </div>

      <div className="mt-1.5 flex items-center justify-between">
        <p className="text-xs font-medium text-ink-500">
          {label && (
            <>
              Strength: <span className={`font-semibold ${textColor}`}>{label}</span>
            </>
          )}
        </p>
      </div>

      {feedback.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {feedback.map((tip) => (
            <li key={tip} className="text-xs text-ink-400">
              • {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}