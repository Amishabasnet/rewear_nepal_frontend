import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Star, Plus } from "lucide-react";
import toast from "react-hot-toast";
import addressService from "../../services/addressService";
import LoadingSpinner from "../../components/LoadingSpinner";
import Input from "../../components/Input";
import Button from "../../components/Button";

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: false,
};

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // null = not editing, "new" = adding
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const loadAddresses = () => {
    setLoading(true);
    addressService
      .getAddresses()
      .then(({ data }) => setAddresses(data.data || []))
      .catch(() => toast.error("Could not load your addresses"))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(loadAddresses, []);

  const startAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId("new");
  };

  const startEdit = (address) => {
    setForm({
      fullName: address.fullName || "",
      phone: address.phone || "",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "",
      isDefault: address.isDefault || false,
    });
    setEditingId(address._id);
  };

  const cancelForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId === "new") {
        await addressService.addAddress(form);
        toast.success("Address added");
      } else {
        // isDefault is not accepted on update — handled by a separate endpoint
        const {  ...payload } = form;
        await addressService.updateAddress(editingId, payload);
        toast.success("Address updated");
      }
      cancelForm();
      loadAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save this address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await addressService.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      toast.success("Address removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove this address");
    } finally {
      setBusyId(null);
    }
  };

  const handleSetDefault = async (id) => {
    setBusyId(id);
    try {
      await addressService.setDefaultAddress(id);
      toast.success("Default address updated");
      loadAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update default address");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/profile"
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-rust-500"
      >
        <ArrowLeft className="h-4 w-4" /> Back to profile
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink-900">Saved Addresses</h1>
        {editingId === null && (
          <button
            onClick={startAdd}
            className="flex items-center gap-1.5 rounded-full bg-forest-600 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-forest-700"
          >
            <Plus className="h-4 w-4" /> Add address
          </button>
        )}
      </div>

      {editingId !== null && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 space-y-4 rounded-xl border border-ink-100 bg-white p-6"
        >
          <h2 className="text-sm font-semibold text-ink-900">
            {editingId === "new" ? "New address" : "Edit address"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" name="fullName" value={form.fullName} onChange={handleChange} required />
            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
          </div>
          <Input label="Street address" name="street" value={form.street} onChange={handleChange} required />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="City" name="city" value={form.city} onChange={handleChange} required />
            <Input label="State (optional)" name="state" value={form.state} onChange={handleChange} />
            <Input label="Postal code" name="postalCode" value={form.postalCode} onChange={handleChange} required />
          </div>
          <Input label="Country" name="country" value={form.country} onChange={handleChange} required />
          {editingId === "new" && (
            <label className="flex items-center gap-2 text-sm text-ink-600">
              <input
                type="checkbox"
                name="isDefault"
                checked={form.isDefault}
                onChange={handleChange}
                className="h-4 w-4 rounded border-ink-300"
              />
              Set as default address
            </label>
          )}
          <div className="flex gap-2">
            <Button loading={saving}>Save address</Button>
            <button
              type="button"
              onClick={cancelForm}
              className="rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:bg-cream-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSpinner label="Loading addresses..." />
      ) : addresses.length === 0 ? (
        <div className="rounded-xl border border-ink-100 bg-white p-6 text-sm text-ink-700">
          <p>No addresses saved yet.</p>
          <p className="mt-2 text-ink-500">Add one above, or save one during checkout.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className="flex items-start justify-between gap-4 rounded-xl border border-ink-100 bg-white p-6 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink-900">{address.fullName}</p>
                  {address.isDefault && (
                    <span className="rounded-full bg-forest-100 px-2 py-0.5 text-[11px] font-semibold text-forest-700">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink-600">{address.street}</p>
                <p className="text-sm text-ink-600">
                  {[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}
                  {address.country ? `, ${address.country}` : ""}
                </p>
                <p className="text-sm text-ink-600">{address.phone}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => startEdit(address)}
                    aria-label="Edit address"
                    className="rounded-full p-2 text-ink-500 hover:bg-cream-100 hover:text-ink-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address._id)}
                    disabled={busyId === address._id}
                    aria-label="Delete address"
                    className="rounded-full p-2 text-ink-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address._id)}
                    disabled={busyId === address._id}
                    className="flex items-center gap-1 text-xs font-semibold text-forest-600 hover:underline"
                  >
                    <Star className="h-3 w-3" /> Set as default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
