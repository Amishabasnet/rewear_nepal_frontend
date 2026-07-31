const MIN_LENGTH = 8;
const HAS_LOWERCASE = /[a-z]/;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_NUMBER = /[0-9]/;
const HAS_SPECIAL_CHAR = /[^A-Za-z0-9]/;

const COMMON_PASSWORDS = new Set(
  [
    "password",
    "password1",
    "password123",
    "12345678",
    "123456789",
    "qwerty123",
    "letmein1",
    "welcome123",
    "admin123",
    "iloveyou1",
    "p@ssw0rd",
    "passw0rd",
  ].map((p) => p.toLowerCase())
);

export const STRONG_PASSWORD_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, " +
  "a lowercase letter, a number, and a special character";

export function isStrongPassword(value) {
  if (typeof value !== "string") return false;
  if (value.length < MIN_LENGTH || value.length > 128) return false;
  if (!HAS_LOWERCASE.test(value)) return false;
  if (!HAS_UPPERCASE.test(value)) return false;
  if (!HAS_NUMBER.test(value)) return false;
  if (!HAS_SPECIAL_CHAR.test(value)) return false;
  if (COMMON_PASSWORDS.has(value.toLowerCase())) return false;
  return true;
}

const LABELS = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];
const BAR_COLORS = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"];
const TEXT_COLORS = ["text-red-500", "text-orange-500", "text-amber-600", "text-lime-600", "text-emerald-600"];

export function calculatePasswordStrength(password) {
  if (typeof password !== "string" || password.length === 0) {
    return { score: 0, label: "", feedback: [], barColor: BAR_COLORS[0], textColor: TEXT_COLORS[0] };
  }

  const feedback = [];
  let score = 0;

  if (password.length >= MIN_LENGTH) score += 1;
  else feedback.push(`Use at least ${MIN_LENGTH} characters`);

  if (password.length >= 12) score += 1;
  else feedback.push("Longer passwords (12+ characters) are harder to crack");

  const varietyCount = [HAS_LOWERCASE, HAS_UPPERCASE, HAS_NUMBER, HAS_SPECIAL_CHAR].filter((re) =>
    re.test(password)
  ).length;
  if (varietyCount >= 3) score += 1;
  if (varietyCount === 4) score += 1;

  if (!HAS_UPPERCASE.test(password)) feedback.push("Add an uppercase letter");
  if (!HAS_LOWERCASE.test(password)) feedback.push("Add a lowercase letter");
  if (!HAS_NUMBER.test(password)) feedback.push("Add a number");
  if (!HAS_SPECIAL_CHAR.test(password)) feedback.push("Add a special character");

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    score = 0;
    feedback.unshift("This password is far too common — choose something more unique");
  }

  if (/(.)\1{2,}/.test(password)) {
    feedback.push("Avoid repeating the same character several times in a row");
  }

  score = Math.max(0, Math.min(4, score));

  return {
    score,
    label: LABELS[score],
    feedback,
    barColor: BAR_COLORS[score],
    textColor: TEXT_COLORS[score],
  };
}