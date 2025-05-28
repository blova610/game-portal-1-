"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  BaseDataTable,
  type Column,
} from "@/components/dashboard/base/data-table";
import { AddAdvertisementDialog } from "@/components/dashboard/add-advertisement-dialog";
import { EditAdvertisementDialog } from "@/components/dashboard/edit-advertisement-dialog";
import { DeleteAdvertisementDialog } from "@/components/dashboard/delete-advertisement-dialog";
import type { Advertisement } from "@/types/supabase";
import {
  AD_TABS,
  AD_TAB_LABELS,
  AD_STATUS,
  AD_STATUS_STYLES,
  AD_POSITIONS,
} from "@/constants/advertisement-constants";

export default function AdvertisementsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [deletingAd, setDeletingAd] = useState<Advertisement | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAds: 0,
    activeAds: 0,
    positions: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const supabase = getSupabaseBrowser();

  // Fetch advertisements and stats
  const fetchAdvertisements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAdvertisements(data || []);

      // Calculate stats
      const stats = {
        totalAds: data?.length || 0,
        activeAds:
          data?.filter((ad: Advertisement) => ad.is_active).length || 0,
        positions:
          new Set(data?.map((ad: Advertisement) => ad.position).filter(Boolean))
            .size || 0,
      };
      setStats(stats);
    } catch (error) {
      console.error("Error fetching advertisements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const handleAdAdded = () => {
    fetchAdvertisements();
  };

  const handleEditAd = (ad: Advertisement) => {
    setEditingAd(ad);
  };

  const handleAdUpdated = () => {
    setEditingAd(null);
    fetchAdvertisements();
  };

  const handleDeleteAd = (ad: Advertisement) => {
    setDeletingAd(ad);
    setIsDeleteDialogOpen(true);
  };

  const columns: Column<Advertisement>[] = [
    {
      key: "id",
      header: "ID",
      render: (ad: Advertisement) => <div className="font-medium">{ad.id}</div>,
    },
    {
      key: "title",
      header: "Advertisement",
      render: (ad: Advertisement) => (
        <div className="flex items-center gap-2">
          <img
            src={ad.image_url}
            alt={ad.title}
            className="h-10 w-10 rounded object-cover"
          />
          <div>
            <div className="font-medium">{ad.title}</div>
            <div className="text-sm text-muted-foreground">
              {ad.position || "No position"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "link_url",
      header: "Link URL",
      render: (ad: Advertisement) => (
        <a
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline truncate max-w-[200px] block"
        >
          {ad.link_url}
        </a>
      ),
    },
    {
      key: "position",
      header: "Position",
      render: (ad: Advertisement) => (
        <div className="font-medium">{ad.position || "No position"}</div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (ad: Advertisement) => (
        <div className="flex flex-col">
          <span className="font-medium">
            Created: {new Date(ad.created_at || "").toLocaleDateString()}
          </span>
          {ad.updated_at && (
            <span className="text-sm text-muted-foreground">
              Updated: {new Date(ad.updated_at).toLocaleDateString()}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (ad: Advertisement) => {
        const status = ad.is_active ? AD_STATUS.ACTIVE : AD_STATUS.INACTIVE;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${AD_STATUS_STYLES[status]}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (ad: Advertisement) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEditAd(ad)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteAd(ad)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const tableStats = [
    {
      title: "Total Ads",
      value: stats.totalAds,
    },
    {
      title: "Active Ads",
      value: stats.activeAds,
      subtext: `${Math.round(
        (stats.activeAds / stats.totalAds) * 100
      )}% of total`,
    },
    {
      title: "Positions",
      value: stats.positions,
    },
  ];

  const tabs = [
    {
      value: AD_TABS.ALL,
      label: AD_TAB_LABELS[AD_TABS.ALL],
      filter: () => true,
    },
    {
      value: AD_TABS.ACTIVE,
      label: AD_TAB_LABELS[AD_TABS.ACTIVE],
      filter: (ad: Advertisement) => ad.is_active,
    },
    {
      value: AD_TABS.INACTIVE,
      label: AD_TAB_LABELS[AD_TABS.INACTIVE],
      filter: (ad: Advertisement) => !ad.is_active,
    },
  ];

  // Get unique positions for filter
  const positions = Array.from(
    new Set(
      advertisements.map((ad: Advertisement) => ad.position).filter(Boolean)
    )
  ).sort();

  return (
    <>
      <BaseDataTable
        title="Advertisements Management"
        description="Manage your site advertisements."
        data={advertisements}
        columns={columns}
        loading={loading}
        stats={tableStats}
        filterOptions={{
          search: {
            placeholder: "Search advertisements...",
            value: searchQuery,
            onChange: setSearchQuery,
          },
          select: {
            key: "position",
            options: positions.map((pos) => ({
              key: "position",
              label: pos,
              value: pos,
            })),
            value: selectedPosition,
            onChange: setSelectedPosition,
            placeholder: "All Positions",
          },
        }}
        tabs={tabs}
        onAdd={() => setIsAddDialogOpen(true)}
        addButtonLabel="Add Advertisement"
      />

      <AddAdvertisementDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdAdded={handleAdAdded}
      />

      {editingAd && (
        <EditAdvertisementDialog
          advertisement={editingAd}
          open={!!editingAd}
          onOpenChange={(open) => !open && setEditingAd(null)}
          onAdUpdated={handleAdUpdated}
        />
      )}

      <DeleteAdvertisementDialog
        advertisement={deletingAd}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onAdDeleted={fetchAdvertisements}
      />
    </>
  );
}
