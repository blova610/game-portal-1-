import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export const metadata = {
  title: "Settings - Dashboard",
  description: "Manage your site settings and preferences.",
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">Manage your site settings and preferences.</p>
      </div>
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your site's general settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input id="site-name" defaultValue="GamePortal" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input id="contact-email" type="email" defaultValue="contact@gameportal.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="maintenance-mode" />
                  <Label htmlFor="maintenance-mode">Enable maintenance mode</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize your site's appearance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <select id="theme" className="w-full rounded-md border border-input bg-background px-3 py-2">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input id="primary-color" type="color" defaultValue="#7c3aed" className="w-12 h-10 p-1" />
                  <Input defaultValue="#7c3aed" className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="featured-games">Featured Games Display</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="featured-games" defaultChecked />
                  <Label htmlFor="featured-games">Show featured games on homepage</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage your notification preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="email-notifications" defaultChecked />
                  <Label htmlFor="email-notifications">Receive email notifications</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-game-notifications">New Game Notifications</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="new-game-notifications" defaultChecked />
                  <Label htmlFor="new-game-notifications">Notify when new games are added</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-notifications">User Notifications</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="user-notifications" defaultChecked />
                  <Label htmlFor="user-notifications">Notify about new user registrations</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced settings for your site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cache-duration">Cache Duration (minutes)</Label>
                <Input id="cache-duration" type="number" defaultValue="60" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex space-x-2">
                  <Input id="api-key" defaultValue="sk_live_51NXxXXXXXXXXXXXXXXXXXXXX" type="password" />
                  <Button variant="outline">Regenerate</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="debug-mode">Debug Mode</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="debug-mode" />
                  <Label htmlFor="debug-mode">Enable debug mode</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
