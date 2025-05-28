"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  BaseDataTable,
  type Column,
} from "@/components/dashboard/base/data-table";
import { AddNavigationItemDialog } from "@/components/dashboard/add-navigation-item-dialog";
import { EditNavigationItemDialog } from "@/components/dashboard/edit-navigation-item-dialog";
import { DeleteNavigationItemDialog } from "@/components/dashboard/delete-navigation-item-dialog";
import type { NavigationItem } from "@/types/supabase";
import { DynamicIcon } from "@/components/dynamic-icon";

export default function NavigationPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<NavigationItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = getSupabaseBrowser();

  // Fetch navigation items and stats
  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("navigation_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setItems(data || []);

      // Calculate stats
      const stats = {
        totalItems: data?.length || 0,
      };
      setStats(stats);
    } catch (error) {
      console.error("Error fetching navigation items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleItemAdded = () => {
    fetchItems();
  };

  const handleEditItem = (item: NavigationItem) => {
    setEditingItem(item);
  };

  const handleItemUpdated = () => {
    setEditingItem(null);
    fetchItems();
  };

  const handleDeleteItem = (item: NavigationItem) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const columns: Column<NavigationItem>[] = [
    {
      key: "id",
      header: "ID",
      render: (item: NavigationItem) => (
        <div className="font-medium">{item.id}</div>
      ),
    },
    {
      key: "label",
      header: "Label",
      render: (item: NavigationItem) => (
        <div className="font-medium">{item.label}</div>
      ),
    },
    {
      key: "href",
      header: "Link",
      render: (item: NavigationItem) => (
        <div className="max-w-[200px] truncate text-blue-600 hover:underline">
          <a href={item.href} target="_blank" rel="noopener noreferrer">
            {item.href}
          </a>
        </div>
      ),
    },
    {
      key: "icon",
      header: "Icon",
      render: (item: NavigationItem) => (
        <div className="flex items-center gap-2">
          <DynamicIcon
            name={item.icon}
            className="h-5 w-5"
            color={item.color}
          />
          <span className="font-medium">{item.icon}</span>
        </div>
      ),
    },
    {
      key: "color",
      header: "Color",
      render: (item: NavigationItem) => {
        const isTailwindColor = item.color.startsWith("text-");
        return (
          <div className="flex items-center gap-3">
            {isTailwindColor ? (
              <div
                className={`w-6 h-6 rounded-full border ${item.color} bg-current`}
              />
            ) : (
              <div
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: item.color }}
              />
            )}
            <div className="flex flex-col">
              <span className="font-medium text-sm">{item.color}</span>
              <span className="text-xs text-muted-foreground">
                {isTailwindColor ? "Tailwind Class" : "Hex Color"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "order_index",
      header: "Order",
      render: (item: NavigationItem) => (
        <div className="font-medium">{item.order_index}</div>
      ),
    },
    {
      key: "is_active",
      header: "Active",
      render: (item: NavigationItem) => (
        <div
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            item.is_active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.is_active ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      key: "is_fixed",
      header: "Fixed",
      render: (item: NavigationItem) => (
        <div
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            item.is_fixed
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {item.is_fixed ? "Fixed" : "Normal"}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (item: NavigationItem) => (
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">
            Created: {new Date(item.created_at).toLocaleDateString()}
          </span>
          {item.updated_at && (
            <span className="text-sm text-muted-foreground">
              Updated: {new Date(item.updated_at).toLocaleDateString()}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: NavigationItem) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditItem(item)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteItem(item)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const tableStats = [
    {
      title: "Total Navigation Items",
      value: stats.totalItems,
    },
  ];

  const tabs = [
    {
      value: "all",
      label: "All Items",
      filter: () => true,
    },
    {
      value: "active",
      label: "Active",
      filter: (item: NavigationItem) => item.is_active,
    },
    {
      value: "inactive",
      label: "Inactive",
      filter: (item: NavigationItem) => !item.is_active,
    },
    {
      value: "fixed",
      label: "Fixed Position",
      filter: (item: NavigationItem) => item.is_fixed,
    },
    {
      value: "normal",
      label: "Normal Position",
      filter: (item: NavigationItem) => !item.is_fixed,
    },
  ];

  return (
    <>
      <BaseDataTable<NavigationItem>
        title="Navigation Items"
        description="Manage your navigation menu items"
        data={items}
        columns={columns}
        loading={loading}
        stats={tableStats}
        filterOptions={{
          search: {
            placeholder: "Search by title or URL...",
            value: searchQuery,
            onChange: setSearchQuery,
          },
        }}
        tabs={tabs}
        onAdd={() => setIsAddDialogOpen(true)}
        addButtonLabel="Add Navigation Item"
      />

      <AddNavigationItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onItemAdded={handleItemAdded}
      />

      {editingItem && (
        <EditNavigationItemDialog
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open: boolean) => !open && setEditingItem(null)}
          onItemUpdated={handleItemUpdated}
        />
      )}

      <DeleteNavigationItemDialog
        item={deletingItem}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onItemDeleted={fetchItems}
      />
    </>
  );
}
