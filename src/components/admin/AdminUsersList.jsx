import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Ban, RotateCcw, Trash2, Users as UsersIcon } from "lucide-react";

import adminService from "../../services/adminService";
import SearchBar from "../SearchBar";
import Select from "../Select";
import Pagination from "../Pagination";
import LoadingSpinner from "../LoadingSpinner";
import EmptyState from "../EmptyState";
import RoleBadge from "./RoleBadge";
import ConfirmModal from "./ConfirmModal";
import { useQueryParams } from "../../hooks/useQueryParams";
import { normalizeUserList } from "../../utils/normalizeAdminUsers";
import { formatDate } from "../../utils/formatDate";

const ROLE_OPTIONS = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "admin", label: "Admin" },
];

const PAGE_SIZE = 10;

const iconButtonBase =
  "flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-40";

export default function AdminUsersList() {
  const { params, setParams } = useQueryParams();
  const search = params.search || "";
  const role = params.role || "";
  const page = Number(params.page) || 1;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { type: "block" | "unblock" | "delete", user }
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminService
      .getUsers({ search, role })
      .then(({ data }) => setUsers(normalizeUserList(data?.data ?? data)))
      .catch(() => {
        setUsers([]);
        toast.error("Could not load users");
      })
      .finally(() => setLoading(false));
  }, [search, role]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = role ? u.role === role : true;
      const matchesSearch = term
        ? u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
        : true;
      return matchesRole && matchesSearch;
    });
  }, [users, search, role]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const closeModal = () => {
    if (!actionLoading) setModal(null);
  };

  const runAction = async (fn, successMsg) => {
    setActionLoading(true);
    try {
      await fn();
      toast.success(successMsg);
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = () => runAction(() => adminService.blockUser(modal.user.id), "User blocked");
  const handleUnblock = () => runAction(() => adminService.unblockUser(modal.user.id), "User unblocked");
  const handleDelete = () => runAction(() => adminService.deleteUser(modal.user.id), "User deleted");

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-ink-900">All Users</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:max-w-sm sm:flex-1">
          <SearchBar
            value={search}
            onSearch={(v) => setParams({ search: v })}
            placeholder="Search by name or email..."
          />
        </div>
        <div className="sm:w-48">
          <Select
            value={role}
            onChange={(e) => setParams({ role: e.target.value })}
            options={ROLE_OPTIONS}
            placeholder="All roles"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading users..." />
      ) : paged.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No users found" message="Try adjusting your search or role filter." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-ink-100 bg-cream-50 text-xs uppercase text-ink-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {paged.map((u) => (
                <tr key={u.id} className="hover:bg-cream-50">
                  <td className="px-4 py-3 font-medium text-ink-800">{u.name}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-ink-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        u.isBlocked ? "bg-ink-800 text-cream-50" : "bg-forest-100 text-forest-700"
                      }`}
                    >
                      {u.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-400">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/users/${u.id}`}
                        className={`${iconButtonBase} border-ink-200 text-ink-600 hover:bg-cream-100`}
                        aria-label="View user"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {u.isBlocked ? (
                        <button
                          type="button"
                          onClick={() => setModal({ type: "unblock", user: u })}
                          className={`${iconButtonBase} border-forest-200 text-forest-600 hover:bg-forest-50`}
                          aria-label="Unblock user"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setModal({ type: "block", user: u })}
                          className={`${iconButtonBase} border-red-200 text-red-500 hover:bg-red-50`}
                          aria-label="Block user"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setModal({ type: "delete", user: u })}
                        className={`${iconButtonBase} border-red-200 text-red-500 hover:bg-red-50`}
                        aria-label="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setParams({ page: p }, { resetPage: false })}
      />

      <ConfirmModal
        open={modal?.type === "block"}
        title="Block this user?"
        message={modal?.user ? `"${modal.user.name}" won't be able to log in until unblocked.` : ""}
        confirmLabel="Block"
        tone="danger"
        loading={actionLoading}
        onConfirm={handleBlock}
        onClose={closeModal}
      />
      <ConfirmModal
        open={modal?.type === "unblock"}
        title="Unblock this user?"
        message={modal?.user ? `"${modal.user.name}" will regain access to their account.` : ""}
        confirmLabel="Unblock"
        tone="success"
        loading={actionLoading}
        onConfirm={handleUnblock}
        onClose={closeModal}
      />
      <ConfirmModal
        open={modal?.type === "delete"}
        title="Delete this user?"
        message={
          modal?.user
            ? `This permanently removes "${modal.user.name}"'s account. This can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        tone="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
        onClose={closeModal}
      />
    </div>
  );
}
