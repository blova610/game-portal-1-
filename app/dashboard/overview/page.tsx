"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GamepadIcon,
  Users,
  TrendingUp,
  Star,
  Plus,
  Settings,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "../layout";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalGames: 0,
    totalUsers: 0,
    totalLikes: 0,
    recentGames: 0,
    topCategory: "",
    featuredGameId: process.env.NEXT_PUBLIC_FEATURED_GAME_ID || "1",
  });
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = getSupabaseBrowser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [gamesResult, usersResult, likesResult] = await Promise.all([
        supabase
          .from("games")
          .select("id, title, category, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, created_at"),
        supabase.from("likes").select("id"),
      ]);

      const games = gamesResult.data || [];
      const users = usersResult.data || [];
      const likes = likesResult.data || [];

      // Calculate recent games (last 7 days)
      const recentGames = games.filter(
        (g) =>
          new Date(g.created_at) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;

      // Find top category
      const categoryCount = games.reduce((acc: any, game) => {
        const category = game.category || "Uncategorized";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      const topCategory =
        Object.entries(categoryCount).sort(
          ([, a]: any, [, b]: any) => b - a
        )[0]?.[0] || "None";

      setStats({
        totalGames: games.length,
        totalUsers: users.length,
        totalLikes: likes.length,
        recentGames,
        topCategory,
        featuredGameId: process.env.NEXT_PUBLIC_FEATURED_GAME_ID || "1",
      });

      setRecentGames(games.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p>Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <p className="text-muted-foreground">
              Welcome to your game portal admin dashboard
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard/games">
                <Plus className="mr-2 h-4 w-4" />
                Add Game
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Games</CardTitle>
              <GamepadIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGames}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.recentGames} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes}</div>
              <p className="text-xs text-muted-foreground">User engagement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Top Category
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.topCategory}</div>
              <p className="text-xs text-muted-foreground">Most popular</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Games */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Games</CardTitle>
              <CardDescription>
                Latest games added to your portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{game.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {game.category && (
                          <Badge variant="secondary">{game.category}</Badge>
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(game.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {recentGames.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No games added yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/dashboard/games">
                    <GamepadIcon className="mr-2 h-4 w-4" />
                    Manage Games
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/dashboard/users">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/dashboard/analytics">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Analytics
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Site Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Game Info */}
        <Card>
          <CardHeader>
            <CardTitle>Featured Game Configuration</CardTitle>
            <CardDescription>
              Currently featured game on homepage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Featured Game ID: {stats.featuredGameId}
                </p>
                <p className="text-sm text-muted-foreground">
                  This game will be displayed prominently on the homepage hero
                  section.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/dashboard/settings">Change Featured Game</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
