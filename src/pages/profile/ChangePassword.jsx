import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import Input from "../../components/Input";
import Button from "../../components/Button";
import PasswordStrengthMeter from "../../components/PasswordStrengthMeter";
import { isStrongPassword, STRONG_PASSWORD_MESSAGE } from "../../utils/passwordStrength";
import { getDashboardPath } from "../../utils/roleRedirect";

export default function ChangePassword() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const nextErrors = {};
    if (!form.currentPassword) nextErrors.currentPassword = "Current password is required";
    if (!isStrongPassword(form.newPassword)) nextErrors.newPassword = STRONG_PASSWORD_MESSAGE;
    if (form.newPassword !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully");
      navigate(getDashboardPath(user?.role), { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change your password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link
        to="/profile"
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-rust-500"
      >
        <ArrowLeft className="h-4 w-4" /> Back to profile
      </Link>

      <h1 className="mb-6 text-2xl font-semibold text-ink-900">Change Password</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-ink-100 bg-white p-6">
        <Input
          label="Current password"
          name="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
        />
        <div>
          <Input
            label="New password"
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
          />
          <PasswordStrengthMeter password={form.newPassword} />
        </div>
        <Input
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
        <Button loading={loading}>Update password</Button>
      </form>
    </div>
  );
}
