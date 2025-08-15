"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Users } from "lucide-react"

const VENUE_CATEGORIES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Cafe" },
  { value: "bar", label: "Bar" },
  { value: "bakery", label: "Bakery" },
  { value: "movie_theater", label: "Movie Theater" },
  { value: "museum", label: "Museum" },
  { value: "art_gallery", label: "Art Gallery" },
  { value: "park", label: "Park" },
  { value: "shopping_mall", label: "Shopping Mall" },
  { value: "gym", label: "Gym" },
  { value: "library", label: "Library" },
  { value: "tourist_attraction", label: "Tourist Attraction" },
]

const TRANSPORT_MODES = [
  { value: "DRIVE", label: "Driving" },
  { value: "WALK", label: "Walking" },
  { value: "TRANSIT", label: "Public Transit" },
  { value: "BICYCLE", label: "Bicycle" },
]

export function CreateSessionForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    creatorName: "",
    categories: ["restaurant"],
    transportMode: "DRIVE",
    limit: 10,
    autoRefresh: true,
    requireAllParticipants: false,
  })

  const updateCategories = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...formData.categories, category]
      : formData.categories.filter((c) => c !== category)

    setFormData({ ...formData, categories: newCategories })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.creatorName.trim() || formData.categories.length === 0) {
      setError("Please fill in all required fields and select at least one venue category.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          creator_name: formData.creatorName,
          settings: {
            categories: formData.categories,
            transport_mode: formData.transportMode,
            limit: formData.limit,
            auto_refresh: formData.autoRefresh,
            require_all_participants: formData.requireAllParticipants,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create session")
      }

      const data = await response.json()
      router.push(`/sessions/${data.session_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="sessionName">Session Name *</Label>
          <Input
            id="sessionName"
            type="text"
            placeholder="e.g., Friday Team Dinner"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="creatorName">Your Name *</Label>
          <Input
            id="creatorName"
            type="text"
            placeholder="e.g., John Doe"
            value={formData.creatorName}
            onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Venue Categories */}
      <div>
        <Label className="text-base font-medium mb-3 block">Venue Types *</Label>
        <div className="grid grid-cols-2 gap-3">
          {VENUE_CATEGORIES.map((category) => (
            <div key={category.value} className="flex items-center space-x-2">
              <Checkbox
                id={`create-${category.value}`}
                checked={formData.categories.includes(category.value)}
                onCheckedChange={(checked) => updateCategories(category.value, checked as boolean)}
              />
              <Label htmlFor={`create-${category.value}`} className="text-sm font-normal">
                {category.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Transport Mode */}
      <div>
        <Label className="text-base font-medium mb-3 block">Transport Mode</Label>
        <Select
          value={formData.transportMode}
          onValueChange={(value) => setFormData({ ...formData, transportMode: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRANSPORT_MODES.map((mode) => (
              <SelectItem key={mode.value} value={mode.value}>
                {mode.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Settings */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="limit" className="text-base font-medium mb-3 block">
            Number of Recommendations
          </Label>
          <Input
            id="limit"
            type="number"
            min="1"
            max="20"
            value={formData.limit}
            onChange={(e) => setFormData({ ...formData, limit: Number.parseInt(e.target.value) || 10 })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="autoRefresh">Auto-generate recommendations</Label>
            <p className="text-sm text-gray-500">Automatically generate recommendations when participants join</p>
          </div>
          <Switch
            id="autoRefresh"
            checked={formData.autoRefresh}
            onCheckedChange={(checked) => setFormData({ ...formData, autoRefresh: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="requireAll">Require all participants</Label>
            <p className="text-sm text-gray-500">Wait for all participants to set their location before generating</p>
          </div>
          <Switch
            id="requireAll"
            checked={formData.requireAllParticipants}
            onCheckedChange={(checked) => setFormData({ ...formData, requireAllParticipants: checked })}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <Button type="submit" disabled={isLoading} size="lg" className="w-full bg-primary hover:bg-primary/90">
        <Users className="h-5 w-5 mr-2" />
        {isLoading ? "Creating Session..." : "Create Session"}
      </Button>
    </form>
  )
}
