import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";

import Input from "../../components/Input";
import Textarea from "../../components/Textarea";
import Select from "../../components/Select";
import Button from "../../components/Button";
import FileUpload from "../../components/FileUpload";
import { useAuth } from "../../context/AuthContext";
import { LOCATIONS } from "../../utils/constants";

export default function SellerRegister() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onBlur" });
  const [loading, setLoading] = useState(false);
  const { registerSeller } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (formValues) => {
    const documentFile = formValues.documentImage?.[0];
    const profileFile = formValues.profileImage?.[0];

    if (!documentFile) {
      toast.error("Please upload your citizenship / document image");
      return;
    }
    if (!profileFile) {
      toast.error("Please upload a shop logo or profile image");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("fullName", formValues.fullName);
      payload.append("email", formValues.email);
      payload.append("password", formValues.password);
      payload.append("phone", formValues.phone);
      payload.append("shopName", formValues.shopName);
      payload.append("shopDescription", formValues.shopDescription);
      payload.append("address", formValues.address);
      payload.append("city", formValues.city);
      payload.append("documentImage", documentFile);
      payload.append("citizenshipImage", documentFile);
      payload.append("profileImage", profileFile);

      const result = await registerSeller(payload);

      if (result.approved) {
        navigate("/seller/dashboard", { replace: true });
      } else {
        navigate("/seller/registration-status", {
          replace: true,
          state: {
            shopName: formValues.shopName,
            email: formValues.email,
            message: result.message,
          },
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit seller registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-semibold text-ink-900">Become a seller</h1>
      <p className="mb-6 text-sm text-ink-500">
        Set up your shop and start selling pre-loved fashion on ReWear Nepal.
      </p>

      <div className="mb-6 flex items-start gap-2 rounded-lg border border-mustard-400/40 bg-mustard-400/10 p-3 text-xs text-ink-600">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-mustard-600" />
        <p>
          Seller accounts are reviewed for verification. Depending on our current queue, your
          shop may need <span className="font-semibold text-ink-800">admin approval</span> before
          you can start listing items.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
          Your details
        </p>

        <Input
          label="Full name"
          placeholder="Anisha Sharma"
          error={errors.fullName?.message}
          {...register("fullName", {
            required: "Full name is required",
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
          label="Phone number"
          type="tel"
          placeholder="98XXXXXXXX"
          error={errors.phone?.message}
          {...register("phone", {
            required: "Phone number is required",
            pattern: { value: /^[0-9+\s-]{7,15}$/, message: "Enter a valid phone number" },
          })}
        />

        <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
          Shop / profile setup
        </p>

        <Input
          label="Shop name"
          placeholder="Anisha's Closet"
          error={errors.shopName?.message}
          {...register("shopName", {
            required: "Shop name is required",
            minLength: { value: 2, message: "Shop name is too short" },
          })}
        />

        <Textarea
          label="Shop description"
          placeholder="Tell buyers what you sell and what makes your shop special"
          error={errors.shopDescription?.message}
          {...register("shopDescription", {
            required: "A short shop description helps buyers trust you",
            minLength: { value: 20, message: "Add at least 20 characters" },
          })}
        />

        <Input
          label="Address"
          placeholder="Street, ward, area"
          error={errors.address?.message}
          {...register("address", { required: "Address is required" })}
        />

        <Select
          label="City"
          options={LOCATIONS.map((loc) => ({ value: loc, label: loc }))}
          error={errors.city?.message}
          {...register("city", { required: "Please select your city" })}
        />

        <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
          Verification
        </p>

        <FileUpload
          label="Citizenship / document image"
          hint="Used to verify your identity as a seller. Not shown publicly."
          error={errors.documentImage?.message}
          {...register("documentImage", { required: "Upload a valid ID document" })}
        />

        <FileUpload
          label="Shop logo / profile image"
          hint="Shown on your public shop page."
          round
          error={errors.profileImage?.message}
          {...register("profileImage", { required: "Upload a shop logo or profile image" })}
        />

        <Button loading={loading}>Submit for review</Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Just want to shop?{" "}
        <Link to="/register" className="font-semibold text-rust-500 hover:underline">
          Create a buyer account
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-ink-500">
        Already registered as a seller?{" "}
        <Link to="/login" className="font-semibold text-rust-500 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
