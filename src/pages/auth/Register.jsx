import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPath } from "../../utils/roleRedirect";

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { role: "buyer" } });
  const [loading, setLoading] = useState(false);
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const password = watch("password");

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const {  ...payload } = formData;
      const user = await signUp(payload);
      navigate(getDashboardPath(user.role), { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-ink-900">Create your account</h1>
      <p className="mb-8 text-sm text-ink-500">Join Nepal's thrift fashion community.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Full name"
          placeholder="Anisha Sharma"
          error={errors.name?.message}
          {...register("name", {
            required: "Name is required",
            minLength: { value: 2, message: "Name is too short" },
          })}
        />

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
          label="Phone number"
          type="tel"
          placeholder="98XXXXXXXX"
          error={errors.phone?.message}
          {...register("phone", {
            required: "Phone number is required",
            pattern: { value: /^[0-9+\s-]{7,15}$/, message: "Enter a valid phone number" },
          })}
        />

        <Select
          label="I want to..."
          options={[
            { value: "buyer", label: "Buy pre-loved fashion" },
            { value: "seller", label: "Sell my clothes" },
          ]}
          error={errors.role?.message}
          {...register("role", { required: "Please select a role" })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Use at least 8 characters" },
          })}
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
        />

        <Button loading={loading}>Create account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-rust-500 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
