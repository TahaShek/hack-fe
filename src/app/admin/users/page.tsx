"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Shield, Ban, UserCheck, MoreVertical } from "lucide-react";
import { mockUsers } from "@/lib/mock-data";
import { formatDate, getStatusColor } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filtered = mockUsers.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">User Management</h1>

      <div className="flex items-center gap-4">
        <div className="max-w-sm flex-1">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." icon={<Search size={16} />} />
        </div>
        <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
          {["all", "buyer", "seller", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer capitalize ${
                roleFilter === r ? "bg-violet-500 text-white" : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80">
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">User</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Role</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Joined</th>
              <th className="text-right py-3 px-4 text-zinc-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center">
                      <span className="text-sm font-medium text-zinc-300">{user.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{user.name}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 capitalize">
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-zinc-400">{formatDate(user.createdAt)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    {user.status === "active" ? (
                      <>
                        <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300 gap-1">
                          <Ban size={12} /> Suspend
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 gap-1">
                          <Shield size={12} /> Block
                        </Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 gap-1">
                        <UserCheck size={12} /> Activate
                      </Button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
