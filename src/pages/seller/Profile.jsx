import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { UserCog } from "lucide-react";
import sellerService from "../../services/sellerService";
import Input from "../../components/Input";
import Textarea from "../../components/Textarea";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function SellerProfile() {
  const [loading, setLoading] = useState(true);
  const {
    register,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    sellerService
      .getProfile()
      .then(({ data }) => {
        const profile = data.seller || data.profile || data;
        reset({
          fullName: profile.fullName || profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          shopName: profile.shopName || "",
          shopDescription: profile.shopDescription || "",
          address: profile.address || "",
          city: profile.city || "",
        });
      })
      .catch(() => toast.error("Could not load your profile"))
      .finally(() => setLoading(false));
  }, [reset]);

  if (loading) return <LoadingSpinner label="Loading your profile..." />;

  return (
    <div className="max-w-xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-50 text-forest-600">
          <UserCog className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Edit Profile</h1>
          <p className="text-sm text-ink-500">Update your shop and account details.</p>
        </div>
      </div>

      <form className="space-y-4 rounded-xl border border-ink-100 bg-white p-5" noValidate>
        <Input label="Full name" error={errors.fullName?.message} {...register("fullName")} />
        <Input label="Email address" type="email" error={errors.email?.message} {...register("email")} />
        <Input label="Phone number" type="tel" error={errors.phone?.message} {...register("phone")} />
        <Input label="Shop name" error={errors.shopName?.message} {...register("shopName")} />
        <Textarea
          label="Shop description"
          error={errors.shopDescription?.message}
          {...register("shopDescription")}
        />
        <Input label="Address" error={errors.address?.message} {...register("address")} />
        <Input label="City" error={errors.city?.message} {...register("city")} />

        <button
          type="button"
          disabled
          title="Profile editing is coming soon"
          className="btn-primary opacity-50"
        >
          Save changes (coming soon)
        </button>
      </form>
    </div>
  );
}
