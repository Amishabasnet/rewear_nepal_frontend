import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPath } from "../../utils/roleRedirect";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const user = await login(formData);
      // Respect a redirect the user was on their way to, otherwise send them
      // to their role's dashboard.
      const from = location.state?.from?.pathname;
      navigate(from || getDashboardPath(user.role), { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

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
