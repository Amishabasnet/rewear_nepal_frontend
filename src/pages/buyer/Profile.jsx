import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Profile() {
  const { user: contextUser } = useAuth();
  const [profile, setProfile] = useState(contextUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .getProfile()
      .then(({ data }) => setProfile(data.user || data))
      .catch(() => setProfile(contextUser))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingSpinner label="Loading profile..." />;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-ink-900">Profile</h1>
      <div className="space-y-4 rounded-xl border border-ink-100 bg-white p-6">
        <Field label="Full name" value={profile?.name} />
        <Field label="Email" value={profile?.email} />
        <Field label="Phone" value={profile?.phone} />
        <Field label="Role" value={profile?.role} capitalize />
      </div>
    </div>
  );
}

function Field({ label, value, capitalize }) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-400">{label}</p>
      <p className={`text-sm font-semibold text-ink-800 ${capitalize ? "capitalize" : ""}`}>{value || "—"}</p>
    </div>
  );
}
