import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import addressService from "../../services/addressService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    addressService
      .getAddresses()
      .then(({ data }) => setAddresses(data.addresses || data || []))
      .catch(() => toast.error("Could not load your addresses"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading addresses..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-ink-900">Saved Addresses</h1>
      {addresses.length === 0 ? (
        <div className="rounded-xl border border-ink-100 bg-white p-6 text-sm text-ink-700">
          <p>No addresses have been saved yet.</p>
          <p className="mt-2 text-ink-500">Add an address during checkout to save it for later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address._id || address.id || address.street} className="rounded-xl border border-ink-100 bg-white p-6 shadow-sm">
              <p className="font-semibold text-ink-900">{address.fullName || address.name || "Address"}</p>
              <p className="text-sm text-ink-600">{address.street}</p>
              <p className="text-sm text-ink-600">{[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}</p>
              <p className="text-sm text-ink-600">{address.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
