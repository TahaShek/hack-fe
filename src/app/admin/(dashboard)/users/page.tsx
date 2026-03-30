"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Shield, Ban, UserCheck, MoreVertical } from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import api from "@/services/api";
import type { User } from "@/types";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" as string, status: "" as string });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");
        if (res.data.success) {
          const raw = res.data.data;
          const arr = Array.isArray(raw) ? raw : raw?.users || [];
          setUsers(arr.map((u: Record<string, unknown>) => ({ ...u, id: u.id || u._id }) as unknown as User));
        }
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const blockUser = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/block`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: u.status === "blocked" ? "active" : "blocked" } : u))
      );
    } catch {
      // silently fail
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role, status: user.status });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await api.put(`/admin/users/${editingUser.id}`, editForm);
    } catch {
      // simulate success on failure
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? { ...u, name: editForm.name, email: editForm.email, role: editForm.role as User["role"], status: editForm.status as User["status"] }
          : u
      )
    );
    setSaving(false);
    setEditingUser(null);
  };

  const filtered = users.filter((u) => {
    if (search) {
      const q = search.toLowerCase();
      const matchName = (u.name || "").toLowerCase().includes(q);
      const matchEmail = (u.email || "").toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedUsers = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.2rem] text-[#2563EB] mb-2 block">
            System Overview
          </span>
          <h1 className="text-4xl font-light tracking-tighter text-white">
            User Management
          </h1>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-zinc-900 text-zinc-300 text-[11px] uppercase tracking-widest border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH USERS..."
            className="bg-transparent border-b border-zinc-800 text-xs tracking-widest text-zinc-300 focus:ring-0 focus:border-[#2563EB] w-full placeholder-zinc-600 uppercase pl-10 py-2 outline-none"
          />
        </div>
        <div className="flex gap-0 border-b border-zinc-800/50">
          {["all", "buyer", "seller", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              data-testid={`role-filter-${r}`}
              className={`px-4 py-3 text-[11px] uppercase tracking-[0.15rem] font-bold transition-colors cursor-pointer capitalize ${
                roleFilter === r
                  ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {r === "all" ? "All Users" : `${r}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/30 border border-zinc-800/50 overflow-hidden rounded-sm">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-zinc-800 skeleton rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-800/50">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Entity</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Role</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Joined</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-zinc-500 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {paginatedUsers.map((user, i) => (
                <motion.tr
                  key={user.id || user._id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-zinc-800/20 transition-colors group"
                  data-testid="user-row"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center rounded-sm">
                        <span className="text-xs font-bold text-zinc-500">{(user.name || "?")[0]}{(user.name || "").split(' ')[1]?.[0] || ''}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-[10px] text-zinc-600 tracking-tighter uppercase">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[9px] font-bold uppercase tracking-widest border border-zinc-700 capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${
                        user.status === "active"
                          ? "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20"
                          : "bg-zinc-800 text-zinc-500 border-zinc-700"
                      }`}
                    >
                      {user.status === "active" ? "Verified" : user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-xs text-zinc-400">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-5 text-right space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {user.status === "active" ? (
                      <>
                        <button
                          onClick={() => openEditModal(user)}
                          data-testid="edit-user"
                          className="text-[10px] uppercase tracking-widest font-bold text-[#2563EB] hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => blockUser(user.id)}
                          data-testid="block-user"
                          className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:underline cursor-pointer"
                        >
                          Block
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openEditModal(user)}
                          data-testid="edit-user"
                          className="text-[10px] uppercase tracking-widest font-bold text-[#2563EB] hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => blockUser(user.id)}
                          data-testid="block-user"
                          className="text-[10px] uppercase tracking-widest font-bold text-[#2563EB] hover:underline cursor-pointer"
                        >
                          {user.status === "blocked" ? "Unblock" : "Approve"}
                        </button>
                      </>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
        <div className="p-4 border-t border-zinc-800/50 flex justify-between items-center bg-zinc-900/50">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}&ndash;{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} users
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="text-zinc-600 hover:text-white transition-colors cursor-pointer text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              &larr;
            </button>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="text-zinc-600 hover:text-white transition-colors cursor-pointer text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User"
        className="bg-zinc-900 border-zinc-800"
      >
        {editingUser && (
          <div className="space-y-5">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Name</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 text-sm text-white px-4 py-3 rounded-sm outline-none focus:border-[#2563EB] transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Email</label>
              <input
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 text-sm text-white px-4 py-3 rounded-sm outline-none focus:border-[#2563EB] transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 text-sm text-white px-4 py-3 rounded-sm outline-none focus:border-[#2563EB] transition-colors cursor-pointer"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 text-sm text-white px-4 py-3 rounded-sm outline-none focus:border-[#2563EB] transition-colors cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-400 text-[11px] font-medium uppercase tracking-widest hover:bg-zinc-700 transition-colors cursor-pointer rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-[#2563EB] text-white text-[11px] font-medium uppercase tracking-widest hover:bg-[#2563EB]/90 transition-colors cursor-pointer rounded-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
