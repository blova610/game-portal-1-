"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { getSupabaseBrowser } from "@/lib/supabase"
import type { Game } from "@/types/supabase"
import { fetchGamesFromApi } from "@/lib/game-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

interface ImportGamesDialogProps {
  onGamesImported: (games: Game[]) => void
}

export default function ImportGamesDialog({ onGamesImported }: ImportGamesDialogProps) {
  const [open, setOpen] = useState(false)
  const [apiUrl, setApiUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [games, setGames] = useState<any[]>([])
  const [selectedGames, setSelectedGames] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const supabase = getSupabaseBrowser()

  const handleFetchGames = async () => {
    if (!apiUrl) {
      toast({
        title: "Error",
        description: "Please enter an API URL.",
        variant: "destructive",
      })
      return
    }

    setIsFetching(true)

    try {
      const fetchedGames = await fetchGamesFromApi(apiUrl)
      setGames(fetchedGames)

      // Initialize all games as selected
      const initialSelected: Record<string, boolean> = {}
      fetchedGames.forEach((game: any, index: number) => {
        initialSelected[index] = true
      })
      setSelectedGames(initialSelected)
    } catch (error) {
      console.error("Error fetching games:", error)
      toast({
        title: "Error",
        description: "Failed to fetch games from API.",
        variant: "destructive",
      })
    } finally {
      setIsFetching(false)
    }
  }

  const handleToggleSelect = (index: number) => {
    setSelectedGames((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const handleToggleSelectAll = () => {
    const allSelected = Object.values(selectedGames).every(Boolean)
    const newSelectedState = !allSelected

    const newSelectedGames: Record<string, boolean> = {}
    games.forEach((_, index) => {
      newSelectedGames[index] = newSelectedState
    })

    setSelectedGames(newSelectedGames)
  }

  const handleImportGames = async () => {
    const gamesToImport = games.filter((_, index) => selectedGames[index])

    if (gamesToImport.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one game to import.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.from("games").insert(gamesToImport).select()

      if (error) {
        throw error
      }

      onGamesImported(data)
      setOpen(false)
      resetForm()

      toast({
        title: "Success",
        description: `${data.length} games imported successfully.`,
      })
    } catch (error: any) {
      console.error("Error importing games:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to import games.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setApiUrl("")
    setGames([])
    setSelectedGames({})
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Import Games
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Games from API</DialogTitle>
          <DialogDescription>Enter the API URL to fetch games and select which ones to import.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="api-url">API URL</Label>
              <Input
                id="api-url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://example.com/api/games"
              />
            </div>
            <Button type="button" onClick={handleFetchGames} disabled={isFetching}>
              {isFetching ? "Fetching..." : "Fetch Games"}
            </Button>
          </div>

          {games.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={Object.values(selectedGames).length > 0 && Object.values(selectedGames).every(Boolean)}
                        onCheckedChange={handleToggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Thumbnail</TableHead>
                    <TableHead>Game URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {games.map((game, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Checkbox
                          checked={selectedGames[index] || false}
                          onCheckedChange={() => handleToggleSelect(index)}
                        />
                      </TableCell>
                      <TableCell>{game.title}</TableCell>
                      <TableCell className="truncate max-w-[200px]">{game.thumbnail}</TableCell>
                      <TableCell className="truncate max-w-[200px]">{game.game_url}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleImportGames} disabled={isLoading || games.length === 0}>
            {isLoading ? "Importing..." : `Import ${Object.values(selectedGames).filter(Boolean).length} Games`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
