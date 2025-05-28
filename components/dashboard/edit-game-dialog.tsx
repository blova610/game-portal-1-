"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BaseDialog } from "@/components/dashboard/base/dialog";
import { useBaseCrud } from "@/components/dashboard/base/crud";
import { generateSlug } from "@/lib/game-utils";
import type { Game } from "@/types/supabase";

interface EditGameDialogProps {
  game: Game;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGameUpdated: () => void;
}

export function EditGameDialog({
  game,
  open,
  onOpenChange,
  onGameUpdated,
}: EditGameDialogProps) {
  const [formData, setFormData] = useState<Game>({
    ...game,
    // Initialize all text fields with empty strings if null/undefined
    description: game.description || "",
    instructions: game.instructions || "",
    category: game.category || "",
    meta_description: game.meta_description || "",
    keywords: game.keywords || "",
    meta_title: game.meta_title || game.title,
    robots: game.robots || "index, follow",
  });

  // Add state for robots checkboxes
  const [robotsIndex, setRobotsIndex] = useState(
    game.robots?.includes("index") ?? true
  );
  const [robotsFollow, setRobotsFollow] = useState(
    game.robots?.includes("follow") ?? true
  );

  const { update, isLoading } = useBaseCrud<Game>({
    tableName: "games",
    onSuccess: () => {
      onOpenChange(false);
      onGameUpdated();
    },
  });

  // Update form data when game prop changes, ensuring no null values
  useEffect(() => {
    setFormData({
      ...game,
      description: game.description || "",
      instructions: game.instructions || "",
      category: game.category || "",
      meta_description: game.meta_description || "",
      keywords: game.keywords || "",
      meta_title: game.meta_title || game.title,
      robots: game.robots || "index, follow",
    });
  }, [game]);

  // Update robots value when checkboxes change
  useEffect(() => {
    const robotsValue: string[] = [];
    if (robotsIndex) robotsValue.push("index");
    if (robotsFollow) robotsValue.push("follow");
    setFormData((prev) => ({
      ...prev,
      robots: robotsValue.join(", ") || "noindex, nofollow",
    }));
  }, [robotsIndex, robotsFollow]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "title") {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.game_url) {
      throw new Error("Title, slug, and game URL are required");
    }

    const gameData: Partial<Game> = {
      ...formData,
      meta_title: formData.meta_title || formData.title,
      meta_description: formData.meta_description || undefined,
      description: formData.description || undefined,
      instructions: formData.instructions || undefined,
      category: formData.category || undefined,
      keywords: formData.keywords || undefined,
      robots: formData.robots || "index, follow",
    };

    await update(game.id, gameData);
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Game"
      description="Edit game details."
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      }
    >
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="mb-4 bg-muted">
          <TabsTrigger
            value="basic"
            className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Basic Info
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Game Details
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Game title"
                className="bg-background text-foreground border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-foreground">
                Slug
              </Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="game-slug"
                className="bg-background text-foreground border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail" className="text-foreground">
                Thumbnail URL
              </Label>
              <Input
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="bg-background text-foreground border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="game_url" className="text-foreground">
                Game URL
              </Label>
              <Input
                id="game_url"
                name="game_url"
                value={formData.game_url}
                onChange={handleChange}
                placeholder="https://example.com/game"
                className="bg-background text-foreground border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">
                Category
              </Label>
              <Input
                id="category"
                name="category"
                value={formData.category || ""}
                onChange={handleChange}
                placeholder="Arcade, Puzzle, etc."
                className="bg-background text-foreground border-input"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Game description"
              rows={3}
              className="bg-background text-foreground border-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-foreground">
              Instructions
            </Label>
            <Textarea
              id="instructions"
              name="instructions"
              value={formData.instructions || ""}
              onChange={handleChange}
              placeholder="How to play the game"
              rows={3}
              className="bg-background text-foreground border-input"
            />
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta_title" className="text-foreground">
              Meta Title
            </Label>
            <Input
              id="meta_title"
              name="meta_title"
              value={formData.meta_title ?? ""}
              onChange={handleChange}
              placeholder="SEO title"
              className="bg-background text-foreground border-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_description" className="text-foreground">
              Meta Description
            </Label>
            <Textarea
              id="meta_description"
              name="meta_description"
              value={formData.meta_description ?? ""}
              onChange={handleChange}
              placeholder="SEO description"
              rows={2}
              className="bg-background text-foreground border-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords" className="text-foreground">
              Keywords
            </Label>
            <Input
              id="keywords"
              name="keywords"
              value={formData.keywords ?? ""}
              onChange={handleChange}
              placeholder="keyword1, keyword2, keyword3"
              className="bg-background text-foreground border-input"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-foreground">Robots</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="robots-index"
                  checked={robotsIndex}
                  onCheckedChange={(checked) =>
                    setRobotsIndex(checked as boolean)
                  }
                  className="border-input"
                />
                <Label
                  htmlFor="robots-index"
                  className="text-sm font-normal text-foreground"
                >
                  Allow search engines to index this page
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="robots-follow"
                  checked={robotsFollow}
                  onCheckedChange={(checked) =>
                    setRobotsFollow(checked as boolean)
                  }
                  className="border-input"
                />
                <Label
                  htmlFor="robots-follow"
                  className="text-sm font-normal text-foreground"
                >
                  Allow search engines to follow links on this page
                </Label>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </BaseDialog>
  );
}

export default EditGameDialog;
