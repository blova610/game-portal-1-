"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import {
  BaseDataTable,
  type Column,
} from "@/components/dashboard/base/data-table";
import type { Profile } from "@/types/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { EditUserDialog } from "@/components/dashboard/edit-user-dialog";

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
  });
  const supabase = getSupabaseBrowser();

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setUsers(profiles || []);

      // Calculate stats
      const stats = {
        totalUsers: profiles?.length || 0,
        adminUsers: profiles?.filter((p: Profile) => p.is_admin).length || 0,
      };
      setStats(stats);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserUpdated = () => {
    setEditingUser(null);
    fetchUsers();
  };

  const handleDeleteUser = (user: Profile) => {
    // TODO: Implement delete user functionality
    console.log("Delete user:", user.id);
  };

  const columns: Column<Profile>[] = [
    {
      key: "id",
      header: "ID",
      render: (user: Profile) => <div className="font-medium">{user.id}</div>,
    },
    {
      key: "username",
      header: "Username",
      render: (user: Profile) => (
        <div className="font-medium">{user.username || "No username"}</div>
      ),
    },
    {
      key: "avatar_url",
      header: "Avatar",
      render: (user: Profile) =>
        user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <span className="text-muted-foreground">No avatar</span>
        ),
    },
    {
      key: "is_admin",
      header: "Admin",
      render: (user: Profile) =>
        user.is_admin ? (
          <Badge variant="default" className="bg-purple-600">
            Admin
          </Badge>
        ) : (
          <Badge variant="outline">User</Badge>
        ),
    },
    {
      key: "date",
      header: "Date",
      render: (user: Profile) => (
        <div className="flex flex-col">
          <span className="font-medium">
            Created: {new Date(user.created_at).toLocaleDateString()}
          </span>
          {user.updated_at && (
            <span className="text-sm text-muted-foreground">
              Updated: {new Date(user.updated_at).toLocaleDateString()}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user: Profile) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingUser(user)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  const tableStats = [
    {
      title: "Total Users",
      value: stats.totalUsers,
    },
    {
      title: "Admin Users",
      value: stats.adminUsers,
    },
  ];

  const tabs = [
    {
      value: "all",
      label: "All Users",
      filter: () => true,
    },
    {
      value: "admins",
      label: "Admins",
      filter: (user: Profile) => user.is_admin,
    },
    {
      value: "users",
      label: "Regular Users",
      filter: (user: Profile) => !user.is_admin,
    },
  ];

  return (
    <>
      <BaseDataTable<Profile>
        title="User Management"
        description="Manage your user profiles and permissions"
        data={users}
        columns={columns}
        loading={loading}
        stats={tableStats}
        filterOptions={{
          search: {
            placeholder: "Search by username...",
            value: searchQuery,
            onChange: setSearchQuery,
          },
        }}
        tabs={tabs}
      />

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </>
  );
}
