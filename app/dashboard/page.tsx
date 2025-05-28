import type React from "react";
import { Suspense } from "react";
import {
  Activity,
  Users,
  GamepadIcon,
  TrendingUp,
  Clock,
  Settings,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  BarChart3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Placeholder for server components
import DashboardLoading from "./loading";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <div className="relative z-0">
        <DashboardContent />
      </div>
    </Suspense>
  );
}

async function DashboardContent() {
  // Fetch data from database here
  // This is a placeholder for actual data fetching
  const stats = {
    totalUsers: 1245,
    totalGames: 87,
    totalPlays: 24689,
    activeUsers: 432,
    userGrowth: 12.5,
    gameGrowth: 8.3,
    playsGrowth: 24.7,
    activeGrowth: -3.2,
  };

  const topGames = [
    {
      id: 1,
      name: "Space Adventure",
      plays: 4521,
      likes: 1245,
      category: "Action",
    },
    {
      id: 2,
      name: "Puzzle Master",
      plays: 3892,
      likes: 987,
      category: "Puzzle",
    },
    {
      id: 3,
      name: "Racing Fever",
      plays: 3654,
      likes: 876,
      category: "Racing",
    },
    {
      id: 4,
      name: "Zombie Survival",
      plays: 2987,
      likes: 765,
      category: "Survival",
    },
    {
      id: 5,
      name: "Farm Simulator",
      plays: 2543,
      likes: 654,
      category: "Simulation",
    },
  ];

  const recentActivity = [
    { id: 1, type: "user_registered", user: "John Doe", time: "2 minutes ago" },
    {
      id: 2,
      type: "game_added",
      game: "Ninja Warriors",
      admin: "Admin",
      time: "1 hour ago",
    },
    {
      id: 3,
      type: "game_played",
      game: "Space Adventure",
      user: "Sarah Smith",
      time: "3 hours ago",
    },
    {
      id: 4,
      type: "user_registered",
      user: "Mike Johnson",
      time: "5 hours ago",
    },
    {
      id: 5,
      type: "game_updated",
      game: "Racing Fever",
      admin: "Admin",
      time: "1 day ago",
    },
  ];

  const systemStatus = [
    { id: 1, name: "Database", status: "operational", uptime: "99.9%" },
    { id: 2, name: "API", status: "operational", uptime: "99.8%" },
    { id: 3, name: "Storage", status: "operational", uptime: "100%" },
    { id: 4, name: "Authentication", status: "operational", uptime: "99.9%" },
    { id: 5, name: "Game Servers", status: "degraded", uptime: "98.2%" },
  ];

  return (
    <div className="space-y-6 relative z-0">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative z-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Dashboard
          </h2>
          <p className="text-slate-400">
            Welcome back, Admin. Here's an overview of your game portal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-[#16213e] border-slate-800"
          >
            <Clock className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button
            size="sm"
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#16213e] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalUsers.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-slate-400">
              {stats.userGrowth > 0 ? (
                <>
                  <ArrowUp className="mr-1 h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">{stats.userGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="mr-1 h-3 w-3 text-rose-500" />
                  <span className="text-rose-500">
                    {Math.abs(stats.userGrowth)}%
                  </span>
                </>
              )}
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#16213e] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Games
            </CardTitle>
            <GamepadIcon className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalGames}
            </div>
            <div className="flex items-center text-xs text-slate-400">
              {stats.gameGrowth > 0 ? (
                <>
                  <ArrowUp className="mr-1 h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">{stats.gameGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="mr-1 h-3 w-3 text-rose-500" />
                  <span className="text-rose-500">
                    {Math.abs(stats.gameGrowth)}%
                  </span>
                </>
              )}
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#16213e] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Plays
            </CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalPlays.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-slate-400">
              {stats.playsGrowth > 0 ? (
                <>
                  <ArrowUp className="mr-1 h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">{stats.playsGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="mr-1 h-3 w-3 text-rose-500" />
                  <span className="text-rose-500">
                    {Math.abs(stats.playsGrowth)}%
                  </span>
                </>
              )}
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#16213e] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Active Users
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.activeUsers}
            </div>
            <div className="flex items-center text-xs text-slate-400">
              {stats.activeGrowth > 0 ? (
                <>
                  <ArrowUp className="mr-1 h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">
                    {stats.activeGrowth}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDown className="mr-1 h-3 w-3 text-rose-500" />
                  <span className="text-rose-500">
                    {Math.abs(stats.activeGrowth)}%
                  </span>
                </>
              )}
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Left Column - 4 spans */}
        <div className="col-span-full lg:col-span-4 space-y-4">
          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-[#16213e] border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Manage Games</CardTitle>
                <CardDescription className="text-slate-400">
                  Add, edit or remove games
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center justify-between text-sm text-white">
                  <div>Total Games</div>
                  <div className="font-medium">{stats.totalGames}</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
                >
                  <Link href="/dashboard/games">
                    Go to Games
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            <Card className="bg-[#16213e] border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Manage Users</CardTitle>
                <CardDescription className="text-slate-400">
                  View and manage user accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center justify-between text-sm text-white">
                  <div>Total Users</div>
                  <div className="font-medium">
                    {stats.totalUsers.toLocaleString()}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
                >
                  <Link href="/dashboard/users">
                    Go to Users
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-[#16213e] border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-slate-400">
                Latest actions on your game portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="rounded-full p-2 bg-slate-800">
                      {activity.type === "user_registered" && (
                        <Users className="h-4 w-4 text-blue-400" />
                      )}
                      {activity.type === "game_added" && (
                        <GamepadIcon className="h-4 w-4 text-green-400" />
                      )}
                      {activity.type === "game_played" && (
                        <Activity className="h-4 w-4 text-purple-400" />
                      )}
                      {activity.type === "game_updated" && (
                        <Settings className="h-4 w-4 text-amber-400" />
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium text-white">
                        {activity.type === "user_registered" &&
                          `New user registered: ${activity.user}`}
                        {activity.type === "game_added" &&
                          `New game added: ${activity.game}`}
                        {activity.type === "game_played" &&
                          `${activity.user} played ${activity.game}`}
                        {activity.type === "game_updated" &&
                          `Game updated: ${activity.game}`}
                      </p>
                      <p className="text-xs text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-slate-700 bg-[#16213e] text-white"
              >
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column - 3 spans */}
        <div className="col-span-full lg:col-span-3 space-y-4">
          {/* Top Games */}
          <Card className="bg-[#16213e] border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Top Games</CardTitle>
              <CardDescription className="text-slate-400">
                Most popular games by plays
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topGames.map((game, index) => {
                  const maxPlays = Math.max(...topGames.map((g) => g.plays));
                  const percentage = (game.plays / maxPlays) * 100;

                  return (
                    <div key={game.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm w-5 text-white">
                            {index + 1}.
                          </span>
                          <span className="font-medium text-sm text-white">
                            {game.name}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {game.plays.toLocaleString()} plays
                        </span>
                      </div>
                      <Progress
                        value={percentage}
                        className="h-2 bg-slate-800"
                      />
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{game.category}</span>
                        <span>{game.likes.toLocaleString()} likes</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-slate-700 bg-[#16213e] text-white"
              >
                View All Games
              </Button>
            </CardFooter>
          </Card>

          {/* System Status */}
          <Card className="bg-[#16213e] border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">System Status</CardTitle>
              <CardDescription className="text-slate-400">
                Current status of your services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {systemStatus.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {service.status === "operational" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="text-sm text-white">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          service.status === "operational"
                            ? "outline"
                            : "secondary"
                        }
                        className={`text-xs ${
                          service.status === "operational"
                            ? "border-slate-700 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {service.status === "operational"
                          ? "Operational"
                          : "Degraded"}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {service.uptime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-center justify-between">
                <span className="text-xs text-slate-400">
                  Last updated: 2 minutes ago
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-slate-800"
                >
                  Refresh
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Link({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
