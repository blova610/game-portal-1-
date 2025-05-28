"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  BaseDataTable,
  type Column,
} from "@/components/dashboard/base/data-table";
import { AddGameDialog } from "@/components/dashboard/add-game-dialog";
import { EditGameDialog } from "@/components/dashboard/edit-game-dialog";
import { DeleteGameDialog } from "@/components/dashboard/delete-game-dialog";
import type { Game } from "@/types/supabase";

// Constants for game status and tabs
const GAME_STATUS = {
  PUBLISHED: "Published",
  DRAFT: "Draft",
  INCOMPLETE: "Incomplete",
} as const;

type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

const GAME_STATUS_STYLES: Record<GameStatus, string> = {
  [GAME_STATUS.PUBLISHED]: "bg-green-100 text-green-700",
  [GAME_STATUS.DRAFT]: "bg-gray-100 text-gray-700",
  [GAME_STATUS.INCOMPLETE]: "bg-yellow-100 text-yellow-700",
};

const GAME_TABS = {
  ALL: "all",
  PUBLISHED: "published",
  DRAFT: "draft",
  INCOMPLETE: "incomplete",
  MISSING_META: "missing_meta",
  MISSING_DESC: "missing_desc",
  MISSING_INSTRUCTIONS: "missing_instructions",
} as const;

type GameTab = (typeof GAME_TABS)[keyof typeof GAME_TABS];

export default function GamesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deletingGame, setDeletingGame] = useState<Game | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGames: 0,
    activeGames: 0,
    draftGames: 0,
    incompleteGames: 0,
    missingMetaGames: 0,
    missingDescGames: 0,
    missingInstructionsGames: 0,
    categories: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentTab, setCurrentTab] = useState<GameTab>(GAME_TABS.ALL);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const supabase = getSupabaseBrowser();

  // Fetch games and stats
  const fetchGames = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const games = data || [];
      setGames(games);
      setFilteredGames(games); // Set initial filtered games

      // Calculate stats
      const publishedGames = games.filter((game: Game) =>
        game.robots?.includes("index")
      );
      const draftGames = games.filter(
        (game: Game) => !game.robots?.includes("index")
      );

      // Games with missing information
      const incompleteGames = games.filter((game: Game) => {
        return (
          !game.description ||
          !game.instructions ||
          !game.meta_title ||
          !game.meta_description ||
          !game.keywords
        );
      });
      const missingMetaGames = games.filter((game: Game) => {
        return !game.meta_title || !game.meta_description || !game.keywords;
      });
      const missingDescGames = games.filter((game: Game) => !game.description);
      const missingInstructionsGames = games.filter(
        (game: Game) => !game.instructions
      );

      const stats = {
        totalGames: games.length,
        activeGames: publishedGames.length,
        draftGames: draftGames.length,
        incompleteGames: incompleteGames.length,
        missingMetaGames: missingMetaGames.length,
        missingDescGames: missingDescGames.length,
        missingInstructionsGames: missingInstructionsGames.length,
        categories:
          new Set(games.map((game: Game) => game.category).filter(Boolean))
            .size || 0,
      };
      setStats(stats);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchGames();
  }, []);

  // Function to apply filters based on current tab and search
  const applyFilters = useCallback(
    (gamesToFilter: Game[], tab: string) => {
      let filtered = [...gamesToFilter];

      // Apply tab filter
      switch (tab) {
        case GAME_TABS.PUBLISHED:
          filtered = filtered.filter((game) => game.robots?.includes("index"));
          break;
        case GAME_TABS.DRAFT:
          filtered = filtered.filter((game) => !game.robots?.includes("index"));
          break;
        case GAME_TABS.INCOMPLETE:
          filtered = filtered.filter(
            (game) =>
              !game.description ||
              !game.instructions ||
              !game.meta_title ||
              !game.meta_description ||
              !game.keywords
          );
          break;
        case GAME_TABS.MISSING_META:
          filtered = filtered.filter(
            (game) =>
              !game.meta_title || !game.meta_description || !game.keywords
          );
          break;
        case GAME_TABS.MISSING_DESC:
          filtered = filtered.filter((game) => !game.description);
          break;
        case GAME_TABS.MISSING_INSTRUCTIONS:
          filtered = filtered.filter((game) => !game.instructions);
          break;
      }

      // Apply search filter if exists
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        filtered = filtered.filter((game) =>
          Object.values(game).some((value) =>
            String(value).toLowerCase().includes(searchLower)
          )
        );
      }

      // Apply category filter if exists
      if (selectedCategory) {
        filtered = filtered.filter(
          (game) => game.category === selectedCategory
        );
      }

      setFilteredGames(filtered);
    },
    [searchQuery, selectedCategory]
  );

  // Update filters when dependencies change
  useEffect(() => {
    if (games.length > 0) {
      applyFilters(games, currentTab);
    }
  }, [games, currentTab, applyFilters]);

  const handleGameAdded = () => {
    fetchGames();
  };

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
  };

  const handleGameUpdated = () => {
    setEditingGame(null);
    fetchGames();
  };

  const handleDeleteGame = (game: Game) => {
    setDeletingGame(game);
    setIsDeleteDialogOpen(true);
  };

  const columns: Column<Game>[] = [
    {
      key: "id",
      header: "ID",
      render: (game: Game) => <div className="font-medium">{game.id}</div>,
    },
    {
      key: "title",
      header: "Game",
      render: (game: Game) => (
        <div className="flex items-center gap-2">
          <img
            src={game.thumbnail}
            alt={game.title}
            className="h-10 w-10 rounded object-cover"
          />
          <div>
            <div className="font-medium">{game.title}</div>
            <div className="text-sm text-muted-foreground">
              {game.category || "Uncategorized"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      render: (game: Game) => <div className="font-medium">{game.slug}</div>,
    },
    {
      key: "game_url",
      header: "Game URL",
      render: (game: Game) => (
        <a
          href={game.game_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline truncate max-w-[200px] block"
        >
          {game.game_url}
        </a>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (game: Game) => (
        <div className="truncate max-w-[200px]">
          {game.description || "No description"}
        </div>
      ),
    },
    {
      key: "instructions",
      header: "Instructions",
      render: (game: Game) => (
        <div className="truncate max-w-[200px]">
          {game.instructions || "No instructions"}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (game: Game) => (
        <div className="font-medium">{game.category || "Uncategorized"}</div>
      ),
    },
    {
      key: "meta",
      header: "Meta Info",
      render: (game: Game) => (
        <div className="space-y-1">
          {game.meta_title && (
            <div
              className="text-sm truncate max-w-[200px]"
              title={game.meta_title}
            >
              Title: {game.meta_title}
            </div>
          )}
          {game.meta_description && (
            <div
              className="text-sm truncate max-w-[200px]"
              title={game.meta_description}
            >
              Desc: {game.meta_description}
            </div>
          )}
          {game.keywords && (
            <div
              className="text-sm truncate max-w-[200px]"
              title={game.keywords}
            >
              Keywords: {game.keywords}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (game: Game) => (
        <div className="flex flex-col">
          <span className="font-medium">
            Created: {new Date(game.created_at || "").toLocaleDateString()}
          </span>
          {game.updated_at && (
            <span className="text-sm text-muted-foreground">
              Updated: {new Date(game.updated_at).toLocaleDateString()}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (game: Game) => {
        const isPublished = game.robots?.includes("index");
        const isIncomplete =
          !game.description ||
          !game.instructions ||
          !game.meta_title ||
          !game.meta_description ||
          !game.keywords;

        let status: GameStatus;
        if (isIncomplete) {
          status = GAME_STATUS.INCOMPLETE;
        } else {
          status = isPublished ? GAME_STATUS.PUBLISHED : GAME_STATUS.DRAFT;
        }

        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${GAME_STATUS_STYLES[status]}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (game: Game) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditGame(game)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteGame(game)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const tableStats = [
    {
      title: "Total Games",
      value: stats.totalGames,
    },
    {
      title: "Published Games",
      value: stats.activeGames,
      subtext: `${Math.round(
        (stats.activeGames / stats.totalGames) * 100
      )}% of total`,
    },
    {
      title: "Draft Games",
      value: stats.draftGames,
      subtext: `${Math.round(
        (stats.draftGames / stats.totalGames) * 100
      )}% of total`,
    },
    {
      title: "Incomplete Games",
      value: stats.incompleteGames,
      subtext: `${Math.round(
        (stats.incompleteGames / stats.totalGames) * 100
      )}% of total`,
    },
    {
      title: "Missing Meta",
      value: stats.missingMetaGames,
      subtext: `${Math.round(
        (stats.missingMetaGames / stats.totalGames) * 100
      )}% of total`,
    },
    {
      title: "Missing Description",
      value: stats.missingDescGames,
      subtext: `${Math.round(
        (stats.missingDescGames / stats.totalGames) * 100
      )}% of total`,
    },
    {
      title: "Missing Instructions",
      value: stats.missingInstructionsGames,
      subtext: `${Math.round(
        (stats.missingInstructionsGames / stats.totalGames) * 100
      )}% of total`,
    },
    {
      title: "Categories",
      value: stats.categories,
    },
  ];

  const tabs = [
    {
      value: GAME_TABS.ALL,
      label: `All Games (${stats.totalGames})`,
      filter: () => true,
    },
    {
      value: GAME_TABS.PUBLISHED,
      label: `Published (${stats.activeGames})`,
      filter: (game: Game) => Boolean(game.robots?.includes("index")),
    },
    {
      value: GAME_TABS.DRAFT,
      label: `Draft (${stats.draftGames})`,
      filter: (game: Game) => !game.robots?.includes("index"),
    },
    {
      value: GAME_TABS.INCOMPLETE,
      label: `Incomplete (${stats.incompleteGames})`,
      filter: (game: Game) =>
        !game.description ||
        !game.instructions ||
        !game.meta_title ||
        !game.meta_description ||
        !game.keywords,
    },
    {
      value: GAME_TABS.MISSING_META,
      label: `Missing Meta (${stats.missingMetaGames})`,
      filter: (game: Game) =>
        !game.meta_title || !game.meta_description || !game.keywords,
    },
    {
      value: GAME_TABS.MISSING_DESC,
      label: `Missing Description (${stats.missingDescGames})`,
      filter: (game: Game) => !game.description,
    },
    {
      value: GAME_TABS.MISSING_INSTRUCTIONS,
      label: `Missing Instructions (${stats.missingInstructionsGames})`,
      filter: (game: Game) => !game.instructions,
    },
  ];

  // Get unique categories for filter
  const categories = Array.from(
    new Set(games.map((game: Game) => game.category).filter(Boolean))
  ).sort() as string[];

  return (
    <>
      <BaseDataTable
        title="Games Management"
        description="Manage your site games."
        data={filteredGames}
        columns={columns}
        loading={loading}
        stats={tableStats}
        filterOptions={{
          search: {
            placeholder: "Search games...",
            value: searchQuery,
            onChange: (value) => {
              setSearchQuery(value);
              applyFilters(games, currentTab);
            },
          },
          select: {
            key: "category",
            options: categories.map((cat) => ({
              key: "category",
              label: cat,
              value: cat,
            })),
            value: selectedCategory,
            onChange: (value) => {
              setSelectedCategory(value);
              applyFilters(games, currentTab);
            },
            placeholder: "All Categories",
          },
        }}
        tabs={tabs.map((tab) => ({
          ...tab,
          value: tab.value,
          label: tab.label,
          onClick: () => {
            setCurrentTab(tab.value);
            applyFilters(games, tab.value);
          },
          isActive: currentTab === tab.value,
        }))}
        onAdd={() => setIsAddDialogOpen(true)}
        addButtonLabel="Add Game"
      />

      <AddGameDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onGameAdded={handleGameAdded}
      />

      {editingGame && (
        <EditGameDialog
          game={editingGame}
          open={!!editingGame}
          onOpenChange={(open: boolean) => !open && setEditingGame(null)}
          onGameUpdated={handleGameUpdated}
        />
      )}

      <DeleteGameDialog
        game={deletingGame}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onGameDeleted={fetchGames}
      />
    </>
  );
}
