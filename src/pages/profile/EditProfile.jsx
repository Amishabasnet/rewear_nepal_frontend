import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { getDashboardPath } from "../../utils/roleRedirect";

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Pre-fill with whatever's already known from the logged-in session, then
  // refresh from the server in case it's changed since login.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) setForm({ name: user.name || "", email: user.email || "" });
    authService
      .getProfile()
      .then(({ data }) => setForm({ name: data.data.name || "", email: data.data.email || "" }))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!form.name.trim()) {
      setErrors({ name: "Name is required" });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setErrors({ email: "Enter a valid email address" });
      return;
    }

    setLoading(true);
    try {
      const { data } = await authService.updateProfile(form);
      updateUser(data.data);
      toast.success("Profile updated successfully");
      navigate(getDashboardPath(data.data.role), { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update your profile");
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

      <h1 className="mb-6 text-2xl font-semibold text-ink-900">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-ink-100 bg-white p-6">
        <Input
          label="Full name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Input
          label="Email address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <p className="text-xs text-ink-400">
          Need to change your phone number or other details? Contact support.
        </p>
        <Button loading={loading}>Save changes</Button>
      </form>
    </div>
  );
}
