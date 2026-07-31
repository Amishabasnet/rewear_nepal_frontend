import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Recaptcha from "../../components/Recaptcha";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPath } from "../../utils/roleRedirect";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaError, setCaptchaError] = useState("");
  const { login, verifyMfa } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Set once the password step succeeds on an MFA-enabled account. Its
  // presence switches the form into "enter your code" mode.
  const [mfaToken, setMfaToken] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState("");

  const goToDashboard = (user) => {
    const from = location.state?.from?.pathname;
    navigate(from || getDashboardPath(user.role), { replace: true });
  };

  const onSubmit = async (formData) => {
    if (!captchaToken) {
      setCaptchaError("Please complete the CAPTCHA");
      return;
    }
    setCaptchaError("");
    setLoading(true);
    try {
      const result = await login({ ...formData, captchaToken });
      if (result.mfaRequired) {
        setMfaToken(result.mfaToken);
        return;
      }
      goToDashboard(result);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitMfa = async (e) => {
    e.preventDefault();
    if (!mfaCode.trim()) {
      setMfaError("Enter the 6-digit code from your authenticator app");
      return;
    }
    setMfaError("");
    setLoading(true);
    try {
      const user = await verifyMfa(mfaToken, mfaCode.trim());
      goToDashboard(user);
    } catch (err) {
      setMfaError(err.response?.data?.message || "Invalid authentication code");
    } finally {
      setLoading(false);
    }
  };

  if (mfaToken) {
    return (
      <div>
        <h1 className="mb-1 text-2xl font-semibold text-ink-900">Two-step verification</h1>
        <p className="mb-8 text-sm text-ink-500">
          Enter the 6-digit code from your authenticator app, or one of your backup codes.
        </p>

        <form onSubmit={onSubmitMfa} className="space-y-4" noValidate>
          <Input
            label="Authentication code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            error={mfaError}
            autoFocus
          />

          <Button loading={loading}>Verify</Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          <button
            type="button"
            className="font-semibold text-rust-500 hover:underline"
            onClick={() => {
              setMfaToken(null);
              setMfaCode("");
              setMfaError("");
            }}
          >
            Back to login
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-ink-900">Welcome back</h1>
      <p className="mb-8 text-sm text-ink-500">Log in to continue thrifting.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
          })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password", { required: "Password is required" })}
        />

        <div>
          <Recaptcha onChange={setCaptchaToken} />
          {captchaError && <p className="mt-1 text-xs text-red-500">{captchaError}</p>}
        </div>

        <Button loading={loading}>Log in</Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        New to ReWear Nepal?{" "}
        <Link to="/register" className="font-semibold text-rust-500 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

