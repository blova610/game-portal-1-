"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BaseDialog } from "@/components/dashboard/base/dialog";
import { useBaseCrud } from "@/components/dashboard/base/crud";
import { generateSlug } from "@/lib/game-utils";
import type { Game } from "@/types/supabase";

interface AddGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGameAdded: () => void;
}

export function AddGameDialog({
  open,
  onOpenChange,
  onGameAdded,
}: AddGameDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    thumbnail: "",
    game_url: "",
    description: "",
    instructions: "",
    category: "",
    meta_title: "",
    meta_description: "",
    keywords: "",
    robots: "index, follow",
  });

  const { create, isLoading } = useBaseCrud<Game>({
    tableName: "games",
    onSuccess: () => {
      setFormData({
        title: "",
        slug: "",
        thumbnail: "",
        game_url: "",
        description: "",
        instructions: "",
        category: "",
        meta_title: "",
        meta_description: "",
        keywords: "",
        robots: "index, follow",
      });
      onOpenChange(false);
      onGameAdded();
    },
  });

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

    const gameData = {
      title: formData.title,
      slug: formData.slug,
      thumbnail:
        formData.thumbnail ||
        `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(
          formData.title
        )}`,
      game_url: formData.game_url,
      description: formData.description || null,
      instructions: formData.instructions || null,
      category: formData.category || null,
      meta_title: formData.meta_title || formData.title,
      meta_description:
        formData.meta_description || formData.description || null,
      keywords: formData.keywords || null,
      robots: formData.robots,
    };

    await create(gameData);
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Game"
      description="Add a new game to your collection."
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? (
              "Adding..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Add Game
              </>
            )}
          </Button>
        </div>
      }
    >
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="mb-4 bg-muted/50">
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
                value={formData.category}
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
              value={formData.description}
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
              value={formData.instructions}
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
              value={formData.meta_title}
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
              value={formData.meta_description}
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
              value={formData.keywords}
              onChange={handleChange}
              placeholder="keyword1, keyword2, keyword3"
              className="bg-background text-foreground border-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="robots" className="text-foreground">
              Robots
            </Label>
            <Input
              id="robots"
              name="robots"
              value={formData.robots}
              onChange={handleChange}
              placeholder="index, follow"
              className="bg-background text-foreground border-input"
            />
          </div>
        </TabsContent>
      </Tabs>
    </BaseDialog>
  );
}

export default AddGameDialog;
