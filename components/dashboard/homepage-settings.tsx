"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function HomepageSettings() {
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [games, setGames] = useState<any[]>([]);
  const [config, setConfig] = useState({
    // Hero Section
    hero_title: "Play the Best Online Games for Free",
    hero_description:
      "Discover and enjoy hundreds of games right in your browser. No downloads required. Start playing now!",
    hero_buttons: [
      { text: "Popular Games", link: "/popular", variant: "default" },
      { text: "New Games", link: "/new", variant: "outline" },
      { text: "Browse Categories", link: "/categories", variant: "outline" },
    ],

    // Featured Game
    featured_game_id: "",
    show_featured_game: true,

    // Layout Settings
    games_per_page: "12",
    games_per_row: "4",
    show_game_descriptions: true,

    // Sections
    show_categories_section: true,
    categories_section_title: "Browse by Category",
    categories_to_show: "8",

    show_popular_section: true,
    popular_section_title: "Popular Games",
    popular_games_count: "4",

    show_new_section: true,
    new_section_title: "New Games",
    new_games_count: "8",

    // Advertisements
    show_advertisements: true,
    ad_positions: ["header", "sidebar", "between-sections"],

    // Theme
    theme_colors: {
      primary: "#7c3aed",
      background: "#0f0f23",
      sidebar: "#16213e",
      card: "#1a1f35",
      text: "#ffffff",
      textMuted: "#94a3b8",
    },

    // SEO
    site_title: "Modern Web Game Portal",
    site_description:
      "Play the best online games for free on our modern web game portal.",
    site_keywords: "web games, online games, free games, browser games",
  });

  // Fetch games and homepage config
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch games for the featured game selector
        const { data: gamesData } = await supabase
          .from("games")
          .select("id, title")
          .order("title");
        setGames(gamesData || []);

        // Fetch homepage config
        const { data: configData } = await supabase
          .from("homepage_config")
          .select("key, value");

        if (configData && configData.length > 0) {
          const configObj = configData.reduce((acc: any, item) => {
            try {
              acc[item.key] = JSON.parse(item.value);
            } catch (e) {
              acc[item.key] = item.value;
            }
            return acc;
          }, {});

          setConfig({
            ...config,
            ...configObj,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load homepage settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Save homepage config
  const saveConfig = async () => {
    setSaving(true);
    try {
      // Convert config to array of {key, value} objects
      const configArray = Object.entries(config).map(([key, value]) => ({
        key,
        value:
          typeof value === "object" ? JSON.stringify(value) : String(value),
      }));

      // Upsert config
      for (const item of configArray) {
        const { error } = await supabase
          .from("homepage_config")
          .upsert({ key: item.key, value: item.value })
          .select();

        if (error) throw error;
      }

      // Note: The featured game ID will be read from the homepage_config table
      // No need to modify process.env directly

      toast({
        title: "Success",
        description:
          "Homepage settings saved successfully. Changes will be visible on the homepage.",
      });
    } catch (error) {
      console.error("Error saving config:", error);
      toast({
        title: "Error",
        description: "Failed to save homepage settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleChange = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle theme color changes
  const handleColorChange = (colorKey: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      theme_colors: {
        ...prev.theme_colors,
        [colorKey]: value,
      },
    }));
  };

  // Handle hero button changes
  const handleHeroButtonChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newButtons = [...config.hero_buttons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    setConfig((prev) => ({ ...prev, hero_buttons: newButtons }));
  };

  const addHeroButton = () => {
    setConfig((prev) => ({
      ...prev,
      hero_buttons: [
        ...prev.hero_buttons,
        { text: "New Button", link: "/", variant: "outline" },
      ],
    }));
  };

  const removeHeroButton = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      hero_buttons: prev.hero_buttons.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
            <CardDescription>
              Basic information about your game portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_title">Site Title</Label>
              <Input
                id="site_title"
                value={config.site_title}
                onChange={(e) => handleChange("site_title", e.target.value)}
                placeholder="Enter site title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_description">Site Description</Label>
              <Textarea
                id="site_description"
                value={config.site_description}
                onChange={(e) =>
                  handleChange("site_description", e.target.value)
                }
                placeholder="Enter site description for SEO"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_keywords">
                Site Keywords (comma separated)
              </Label>
              <Input
                id="site_keywords"
                value={config.site_keywords}
                onChange={(e) => handleChange("site_keywords", e.target.value)}
                placeholder="games, online, free, browser"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Featured Game</CardTitle>
            <CardDescription>
              Select and configure the featured game display
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show_featured_game"
                checked={config.show_featured_game}
                onCheckedChange={(checked) =>
                  handleChange("show_featured_game", checked)
                }
              />
              <Label htmlFor="show_featured_game">Show Featured Game</Label>
            </div>

            {config.show_featured_game && (
              <div className="space-y-2">
                <Label htmlFor="featured_game_id">Featured Game</Label>
                <Select
                  value={config.featured_game_id}
                  onValueChange={(value) =>
                    handleChange("featured_game_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.map((game) => (
                      <SelectItem key={game.id} value={String(game.id)}>
                        {game.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Layout Settings</CardTitle>
            <CardDescription>Configure how games are displayed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="games_per_page">Games Per Page</Label>
                <Input
                  id="games_per_page"
                  type="number"
                  value={config.games_per_page}
                  onChange={(e) =>
                    handleChange("games_per_page", e.target.value)
                  }
                  min="4"
                  max="50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="games_per_row">Games Per Row</Label>
                <Select
                  value={config.games_per_row}
                  onValueChange={(value) =>
                    handleChange("games_per_row", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 columns</SelectItem>
                    <SelectItem value="3">3 columns</SelectItem>
                    <SelectItem value="4">4 columns</SelectItem>
                    <SelectItem value="5">5 columns</SelectItem>
                    <SelectItem value="6">6 columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show_game_descriptions"
                checked={config.show_game_descriptions}
                onCheckedChange={(checked) =>
                  handleChange("show_game_descriptions", checked)
                }
              />
              <Label htmlFor="show_game_descriptions">
                Show Game Descriptions
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show_advertisements"
                checked={config.show_advertisements}
                onCheckedChange={(checked) =>
                  handleChange("show_advertisements", checked)
                }
              />
              <Label htmlFor="show_advertisements">Show Advertisements</Label>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="content" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>
              Customize the hero section on the homepage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hero_title">Hero Title</Label>
              <Input
                id="hero_title"
                value={config.hero_title}
                onChange={(e) => handleChange("hero_title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero_description">Hero Description</Label>
              <Textarea
                id="hero_description"
                value={config.hero_description}
                onChange={(e) =>
                  handleChange("hero_description", e.target.value)
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Hero Buttons</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addHeroButton}
                  disabled={config.hero_buttons.length >= 5}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Button
                </Button>
              </div>

              <div className="space-y-2">
                {config.hero_buttons.map((button, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={button.text}
                      onChange={(e) =>
                        handleHeroButtonChange(index, "text", e.target.value)
                      }
                      placeholder="Button text"
                      className="flex-1"
                    />
                    <Input
                      value={button.link}
                      onChange={(e) =>
                        handleHeroButtonChange(index, "link", e.target.value)
                      }
                      placeholder="Link"
                      className="flex-1"
                    />
                    <Select
                      value={button.variant}
                      onValueChange={(value) =>
                        handleHeroButtonChange(index, "variant", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Primary</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="ghost">Ghost</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHeroButton(index)}
                      disabled={config.hero_buttons.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Homepage Sections</CardTitle>
            <CardDescription>
              Configure which sections to show and their settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categories Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Categories Section</h4>
                <Switch
                  checked={config.show_categories_section}
                  onCheckedChange={(checked) =>
                    handleChange("show_categories_section", checked)
                  }
                />
              </div>
              {config.show_categories_section && (
                <>
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={config.categories_section_title}
                      onChange={(e) =>
                        handleChange("categories_section_title", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Categories to Show</Label>
                    <Input
                      type="number"
                      value={config.categories_to_show}
                      onChange={(e) =>
                        handleChange("categories_to_show", e.target.value)
                      }
                      min="4"
                      max="20"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Popular Games Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Popular Games Section</h4>
                <Switch
                  checked={config.show_popular_section}
                  onCheckedChange={(checked) =>
                    handleChange("show_popular_section", checked)
                  }
                />
              </div>
              {config.show_popular_section && (
                <>
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={config.popular_section_title}
                      onChange={(e) =>
                        handleChange("popular_section_title", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Games to Show</Label>
                    <Input
                      type="number"
                      value={config.popular_games_count}
                      onChange={(e) =>
                        handleChange("popular_games_count", e.target.value)
                      }
                      min="2"
                      max="12"
                    />
                  </div>
                </>
              )}
            </div>

            {/* New Games Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">New Games Section</h4>
                <Switch
                  checked={config.show_new_section}
                  onCheckedChange={(checked) =>
                    handleChange("show_new_section", checked)
                  }
                />
              </div>
              {config.show_new_section && (
                <>
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={config.new_section_title}
                      onChange={(e) =>
                        handleChange("new_section_title", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Games to Show</Label>
                    <Input
                      type="number"
                      value={config.new_games_count}
                      onChange={(e) =>
                        handleChange("new_games_count", e.target.value)
                      }
                      min="2"
                      max="20"
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="appearance" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Theme Colors</CardTitle>
            <CardDescription>
              Customize the colors used throughout the site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Color changes will be applied immediately after saving
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={config.theme_colors.primary}
                    onChange={(e) =>
                      handleColorChange("primary", e.target.value)
                    }
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={config.theme_colors.primary}
                    onChange={(e) =>
                      handleColorChange("primary", e.target.value)
                    }
                    className="flex-1"
                  />
                  <Badge
                    style={{ backgroundColor: config.theme_colors.primary }}
                  >
                    Preview
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background_color">Background Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="background_color"
                    type="color"
                    value={config.theme_colors.background}
                    onChange={(e) =>
                      handleColorChange("background", e.target.value)
                    }
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={config.theme_colors.background}
                    onChange={(e) =>
                      handleColorChange("background", e.target.value)
                    }
                    className="flex-1"
                  />
                  <div
                    className="px-3 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: config.theme_colors.background }}
                  >
                    Preview
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sidebar_color">Sidebar Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="sidebar_color"
                    type="color"
                    value={config.theme_colors.sidebar}
                    onChange={(e) =>
                      handleColorChange("sidebar", e.target.value)
                    }
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={config.theme_colors.sidebar}
                    onChange={(e) =>
                      handleColorChange("sidebar", e.target.value)
                    }
                    className="flex-1"
                  />
                  <div
                    className="px-3 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: config.theme_colors.sidebar }}
                  >
                    Preview
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card_color">Card Background Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="card_color"
                    type="color"
                    value={config.theme_colors.card}
                    onChange={(e) => handleColorChange("card", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={config.theme_colors.card}
                    onChange={(e) => handleColorChange("card", e.target.value)}
                    className="flex-1"
                  />
                  <div
                    className="px-3 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: config.theme_colors.card }}
                  >
                    Preview
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text_color">Text Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="text_color"
                    type="color"
                    value={config.theme_colors.text}
                    onChange={(e) => handleColorChange("text", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={config.theme_colors.text}
                    onChange={(e) => handleColorChange("text", e.target.value)}
                    className="flex-1"
                  />
                  <div
                    className="px-3 py-1 rounded bg-gray-800"
                    style={{ color: config.theme_colors.text }}
                  >
                    Preview Text
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text_muted_color">Muted Text Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="text_muted_color"
                    type="color"
                    value={config.theme_colors.textMuted}
                    onChange={(e) =>
                      handleColorChange("textMuted", e.target.value)
                    }
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={config.theme_colors.textMuted}
                    onChange={(e) =>
                      handleColorChange("textMuted", e.target.value)
                    }
                    className="flex-1"
                  />
                  <div
                    className="px-3 py-1 rounded bg-gray-800"
                    style={{ color: config.theme_colors.textMuted }}
                  >
                    Preview Muted
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              See how your color choices will look
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="p-6 rounded-lg space-y-4"
              style={{ backgroundColor: config.theme_colors.background }}
            >
              <h3
                className="text-xl font-bold"
                style={{ color: config.theme_colors.text }}
              >
                Sample Game Portal
              </h3>
              <p style={{ color: config.theme_colors.textMuted }}>
                This is how your text will appear with the selected colors.
              </p>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded"
                  style={{
                    backgroundColor: config.theme_colors.primary,
                    color: "white",
                  }}
                >
                  Primary Button
                </button>
                <div
                  className="px-4 py-2 rounded"
                  style={{
                    backgroundColor: config.theme_colors.card,
                    color: config.theme_colors.text,
                  }}
                >
                  Card Example
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <div className="mt-6 flex justify-end">
        <Button onClick={saveConfig} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>
    </Tabs>
  );
}
