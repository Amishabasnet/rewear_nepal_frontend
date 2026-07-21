import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Ban, RotateCcw, Trash2, Mail, Phone, ShieldCheck } from "lucide-react";

import adminService from "../../services/adminService";
import RoleBadge from "../../components/admin/RoleBadge";
import ConfirmModal from "../../components/admin/ConfirmModal";
import Select from "../../components/Select";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { normalizeUser, normalizeUserList } from "../../utils/normalizeAdminUsers";
import { formatDate } from "../../utils/formatDate";

const ROLE_OPTIONS = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "admin", label: "Admin" },
];

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [modalType, setModalType] = useState(null); // "role" | "block" | "unblock" | "delete"
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const { data } = await adminService.getUser(id);
      const normalized = normalizeUser(data?.data ?? data);
      setUser(normalized);
      setSelectedRole(normalized.role);
    } catch {
      try {
        const { data } = await adminService.getUsers();
        const list = normalizeUserList(data?.data ?? data);
        const found = list.find((u) => u.id === id);
        if (found) {
          setUser(found);
          setSelectedRole(found.role);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
        toast.error("Could not load this user");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const closeModal = () => {
    if (!actionLoading) setModalType(null);
  };

  const runAction = async (fn, successMsg, { redirectAfter = false } = {}) => {
    setActionLoading(true);
    try {
      await fn();
      toast.success(successMsg);
      setModalType(null);
      if (redirectAfter) {
        navigate("/admin/users");
      } else {
        load();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = () =>
    runAction(() => adminService.updateUser(id, { role: selectedRole }), "Role updated");
  const handleBlock = () => runAction(() => adminService.blockUser(id), "User blocked");
  const handleUnblock = () => runAction(() => adminService.unblockUser(id), "User unblocked");
  const handleDelete = () =>
    runAction(() => adminService.deleteUser(id), "User deleted", { redirectAfter: true });

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner label="Loading user..." />
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <EmptyState
        title="User not found"
        message="This account may have been removed."
        action={
          <Link to="/admin/users" className="mt-1 text-sm font-semibold text-rust-500 hover:underline">
            Back to all users
          </Link>
        }
      />
    );
  }

  const roleChanged = selectedRole !== user.role;

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to all users
      </Link>

      <div className="rounded-xl border border-ink-100 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-ink-900">{user.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <RoleBadge role={user.role} />
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  user.isBlocked ? "bg-ink-800 text-cream-50" : "bg-forest-100 text-forest-700"
                }`}
              >
                {user.isBlocked ? "Blocked" : "Active"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2 text-sm text-ink-600">
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0 text-ink-400" /> {user.email || "—"}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0 text-ink-400" /> {user.phone || "—"}
          </p>
          {user.shopName && (
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-ink-400" /> Shop: {user.shopName}
            </p>
          )}
        </div>

        <p className="mt-4 text-xs text-ink-400">Joined {formatDate(user.createdAt)}</p>
      </div>

      {/* Role management */}
      <div className="rounded-xl border border-ink-100 bg-white p-6">
        <h3 className="text-sm font-semibold text-ink-900">Account Role</h3>
        <p className="mt-1 text-xs text-ink-500">
          Changing a user's role affects what they can access on the platform.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="sm:w-48">
            <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} options={ROLE_OPTIONS} />
          </div>
          <button
            type="button"
            disabled={!roleChanged}
            onClick={() => setModalType("role")}
            className="rounded-full bg-forest-600 px-4 py-2 text-sm font-semibold text-cream-50 transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save Role
          </button>
        </div>
      </div>

      {/* Dangerous actions */}
      <div className="rounded-xl border border-ink-100 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-ink-900">Account Actions</h3>
        <div className="flex flex-wrap gap-3">
          {user.isBlocked ? (
            <button
              type="button"
              onClick={() => setModalType("unblock")}
              className="flex items-center gap-2 rounded-full border border-forest-200 px-4 py-2 text-sm font-semibold text-forest-600 transition hover:bg-forest-50"
            >
              <RotateCcw className="h-4 w-4" /> Unblock User
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setModalType("block")}
              className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
            >
              <Ban className="h-4 w-4" /> Block User
            </button>
          )}
          <button
            type="button"
            onClick={() => setModalType("delete")}
            className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Delete User
          </button>
        </div>
      </div>

      <ConfirmModal
        open={modalType === "role"}
        title="Update this user's role?"
        message={`Change ${user.name}'s role from ${user.role} to ${selectedRole}.`}
        confirmLabel="Update Role"
        tone="default"
        loading={actionLoading}
        onConfirm={handleRoleChange}
        onClose={closeModal}
      />
      <ConfirmModal
        open={modalType === "block"}
        title="Block this user?"
        message={`"${user.name}" won't be able to log in until unblocked.`}
        confirmLabel="Block"
        tone="danger"
        loading={actionLoading}
        onConfirm={handleBlock}
        onClose={closeModal}
      />
      <ConfirmModal
        open={modalType === "unblock"}
        title="Unblock this user?"
        message={`"${user.name}" will regain access to their account.`}
        confirmLabel="Unblock"
        tone="success"
        loading={actionLoading}
        onConfirm={handleUnblock}
        onClose={closeModal}
      />
      <ConfirmModal
        open={modalType === "delete"}
        title="Delete this user?"
        message={`This permanently removes "${user.name}"'s account. This can't be undone.`}
        confirmLabel="Delete"
        tone="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
        onClose={closeModal}
      />
    </div>
  );
}
