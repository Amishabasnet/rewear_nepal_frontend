import { useForm } from "react-hook-form";
import Input from "../Input";
import Select from "../Select";
import Button from "../Button";
import { LOCATIONS } from "../../utils/constants";

export default function AddressForm({ onSave, onCancel, saving }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4 rounded-xl border border-ink-100 bg-cream-50 p-4" noValidate>
      <Input
        label="Full name"
        placeholder="Anisha Sharma"
        error={errors.fullName?.message}
        {...register("fullName", { required: "Full name is required" })}
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
      <Input
        label="Street address"
        placeholder="House no., street, ward"
        error={errors.street?.message}
        {...register("street", { required: "Street address is required" })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="City"
          options={LOCATIONS.map((loc) => ({ value: loc, label: loc }))}
          error={errors.city?.message}
          {...register("city", { required: "Select a city" })}
        />
        <Input label="Landmark (optional)" placeholder="Near..." {...register("landmark")} />
      </div>

      <div className="flex gap-3 pt-1">
        <div className="flex-1">
          <Button loading={saving}>Save address</Button>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 transition hover:bg-cream-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
