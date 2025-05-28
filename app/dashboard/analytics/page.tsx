import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { BarChart, LineChart, PieChart } from "lucide-react"

export default async function AnalyticsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Fetch category distribution
  const { data: categoryData } = await supabase.from("games").select("category")

  // Count games by category
  const categoryCount: Record<string, number> = {}
  categoryData?.forEach((game) => {
    const category = game.category || "Uncategorized"
    categoryCount[category] = (categoryCount[category] || 0) + 1
  })

  // Get top categories
  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">View insights and statistics about your platform.</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Category Distribution</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.map(([category, count]) => (
                    <div key={category} className="flex items-center">
                      <div className="w-[30%] text-sm">{category}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-[#7c3aed]"
                              style={{ width: `${(count / Math.max(...Object.values(categoryCount))) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Growth</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Chart will be implemented soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Game Engagement</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Chart will be implemented soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Game Analytics</CardTitle>
              <CardDescription>Detailed statistics about game performance.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Game analytics will be implemented soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Detailed statistics about user behavior.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">User analytics will be implemented soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
