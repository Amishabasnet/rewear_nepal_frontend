import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, KeyRound, MapPin, Package, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import LoadingSpinner from "../../components/LoadingSpinner";
import Button from "../../components/Button";

export default function Profile() {
  const { user: contextUser, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(contextUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .getProfile()
      .then(({ data }) => setProfile(data.data))
      .catch(() => setProfile(contextUser))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingSpinner label="Loading profile..." />;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink-900">Profile</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>

      {/* Credentials — pulled straight from the logged-in account */}
      <div className="space-y-4 rounded-xl border border-ink-100 bg-white p-6">
        <Field label="Full name" value={profile?.name} />
        <Field label="Email" value={profile?.email} />
        <Field label="Phone" value={profile?.phone} />
        <Field label="Role" value={profile?.role} capitalize />
      </div>

      {/* Quick links to everything else account-related */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ProfileLink to="/profile/edit" icon={Pencil} label="Edit Profile" />
        <ProfileLink to="/profile/change-password" icon={KeyRound} label="Change Password" />
        <ProfileLink to="/addresses" icon={MapPin} label="Saved Addresses" />
        <ProfileLink to="/orders" icon={Package} label="My Orders" />
      </div>

      <div className="mt-6 rounded-xl border border-ink-100 bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold text-ink-900">Two-Factor Authentication</h2>
        <p className="mb-4 text-sm text-ink-500">
          Add an extra layer of security — after entering your password, you'll also need a
          code from an authenticator app to log in.
        </p>
        <MfaSection
          enabled={profile?.mfaEnabled}
          onChange={(enabled) => {
            setProfile((p) => ({ ...p, mfaEnabled: enabled }));
            updateUser({ mfaEnabled: enabled });
          }}
        />
      </div>
    </div>
  );
}

function ProfileLink({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-4 text-sm font-semibold text-ink-800 hover:border-forest-300 hover:bg-forest-50"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-100 text-forest-700">
        <Icon className="h-4 w-4" />
      </span>
      {label}
    </Link>
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

// Handles the whole MFA lifecycle inline: enable (QR + confirm code + show
// backup codes once) and disable (re-enter password).
function MfaSection({ enabled, onChange }) {
  const [stage, setStage] = useState("idle"); // idle | setup | backupCodes | disabling
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    try {
      const { data } = await authService.setupMfa();
      setQrCodeDataUrl(data.data.qrCodeDataUrl);
      setSecret(data.data.secret);
      setStage("setup");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not start MFA setup");
    } finally {
      setLoading(false);
    }
  };

  const confirmSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.confirmMfaSetup(code);
      setBackupCodes(data.data.backupCodes);
      setStage("backupCodes");
      onChange(true);
      toast.success("MFA enabled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid code — please try again");
    } finally {
      setLoading(false);
    }
  };

  const disable = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.disableMfa(password);
      onChange(false);
      setStage("idle");
      setPassword("");
      toast.success("MFA disabled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect password");
    } finally {
      setLoading(false);
    }
  };

  if (stage === "backupCodes") {
    return (
      <div>
        <p className="mb-2 text-sm font-semibold text-ink-800">
          Save these backup codes somewhere safe
        </p>
        <p className="mb-3 text-xs text-ink-500">
          Each one can be used once to log in if you lose access to your authenticator app.
          They won't be shown again.
        </p>
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-cream-100 p-4 font-mono text-sm">
          {backupCodes.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <Button onClick={() => setStage("idle")}>Done</Button>
      </div>
    );
  }

  if (stage === "setup") {
    return (
      <form onSubmit={confirmSetup} className="space-y-4">
        <div className="flex flex-col items-center gap-3 rounded-lg bg-cream-100 p-4">
          {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="MFA QR code" className="h-40 w-40" />}
          <p className="text-xs text-ink-500">
            Scan with Google Authenticator, Authy, or similar — or enter this code manually:
          </p>
          <code className="rounded bg-white px-2 py-1 text-xs">{secret}</code>
        </div>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <Button type="submit" loading={loading}>Confirm & Enable</Button>
          <button
            type="button"
            onClick={() => setStage("idle")}
            className="rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:bg-cream-100"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  if (stage === "disabling") {
    return (
      <form onSubmit={disable} className="space-y-3">
        <input
          type="password"
          placeholder="Enter your password to confirm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <Button type="submit" loading={loading}>Disable MFA</Button>
          <button
            type="button"
            onClick={() => setStage("idle")}
            className="rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:bg-cream-100"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return enabled ? (
    <div className="flex items-center justify-between">
      <span className="rounded-full bg-forest-100 px-3 py-1 text-xs font-semibold text-forest-700">
        Enabled
      </span>
      <button
        onClick={() => setStage("disabling")}
        className="rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:bg-cream-100"
      >
        Disable MFA
      </button>
    </div>
  ) : (
    <Button onClick={startSetup} loading={loading}>
      Enable MFA
    </Button>
  );
}
