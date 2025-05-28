"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  BaseDataTable,
  type Column,
} from "@/components/dashboard/base/data-table";
import { AddHomepageConfigDialog } from "@/components/dashboard/add-homepage-config-dialog";
import { EditHomepageConfigDialog } from "@/components/dashboard/edit-homepage-config-dialog";
import { DeleteHomepageConfigDialog } from "@/components/dashboard/delete-homepage-config-dialog";
import type { HomepageConfig } from "@/types/supabase";
import {
  HOMEPAGE_CONFIG_TABS,
  HOMEPAGE_CONFIG_TAB_LABELS,
  HOMEPAGE_CONFIG_STATUS,
  HOMEPAGE_CONFIG_STATUS_STYLES,
} from "@/constants/homepage-config-constants";

export default function HomepageConfigPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<HomepageConfig | null>(
    null
  );
  const [deletingConfig, setDeletingConfig] = useState<HomepageConfig | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [configs, setConfigs] = useState<HomepageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConfigs: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = getSupabaseBrowser();

  // Fetch configurations and stats
  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("homepage_config")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setConfigs(data || []);

      // Calculate stats
      const stats = {
        totalConfigs: data?.length || 0,
      };
      setStats(stats);
    } catch (error) {
      console.error("Error fetching homepage configurations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleConfigAdded = () => {
    fetchConfigs();
  };

  const handleEditConfig = (config: HomepageConfig) => {
    setEditingConfig(config);
  };

  const handleConfigUpdated = () => {
    setEditingConfig(null);
    fetchConfigs();
  };

  const handleDeleteConfig = (config: HomepageConfig) => {
    setDeletingConfig(config);
    setIsDeleteDialogOpen(true);
  };

  const columns: Column<HomepageConfig>[] = [
    {
      key: "id",
      header: "ID",
      render: (config: HomepageConfig) => (
        <div className="font-medium">{config.id}</div>
      ),
    },
    {
      key: "key",
      header: "Key",
      render: (config: HomepageConfig) => (
        <div className="font-medium">{config.key}</div>
      ),
    },
    {
      key: "value",
      header: "Value",
      render: (config: HomepageConfig) => (
        <div className="max-w-[300px] truncate">
          {typeof config.value === "string"
            ? config.value
            : JSON.stringify(config.value, null, 2)}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (config: HomepageConfig) => (
        <div className="flex flex-col">
          <span className="font-medium">
            Created: {new Date(config.created_at).toLocaleDateString()}
          </span>
          {config.updated_at && (
            <span className="text-sm text-muted-foreground">
              Updated: {new Date(config.updated_at).toLocaleDateString()}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (config: HomepageConfig) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditConfig(config)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteConfig(config)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const tableStats = [
    {
      title: "Total Configurations",
      value: stats.totalConfigs,
    },
  ];

  const tabs = [
    {
      value: HOMEPAGE_CONFIG_TABS.ALL,
      label: HOMEPAGE_CONFIG_TAB_LABELS[HOMEPAGE_CONFIG_TABS.ALL],
      filter: () => true,
    },
  ];

  return (
    <>
      <BaseDataTable<HomepageConfig>
        title="Homepage Configuration"
        description="Manage your homepage configurations"
        data={configs}
        columns={columns}
        loading={loading}
        stats={tableStats}
        filterOptions={{
          search: {
            placeholder: "Search by key or value...",
            value: searchQuery,
            onChange: setSearchQuery,
          },
        }}
        tabs={tabs}
        onAdd={() => setIsAddDialogOpen(true)}
        addButtonLabel="Add Configuration"
      />

      <AddHomepageConfigDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onConfigAdded={handleConfigAdded}
      />

      {editingConfig && (
        <EditHomepageConfigDialog
          config={editingConfig}
          open={!!editingConfig}
          onOpenChange={(open) => !open && setEditingConfig(null)}
          onConfigUpdated={handleConfigUpdated}
        />
      )}

      <DeleteHomepageConfigDialog
        config={deletingConfig}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfigDeleted={fetchConfigs}
      />
    </>
  );
}
