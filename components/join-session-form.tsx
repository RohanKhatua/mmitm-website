"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn } from "lucide-react"

export function JoinSessionForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    joinCode: "",
    participantName: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.joinCode.trim() || !formData.participantName.trim()) {
      setError("Please fill in all required fields.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/sessions/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          join_code: formData.joinCode.toUpperCase(),
          participant_name: formData.participantName,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to join session")
      }

      const data = await response.json()
      router.push(`/sessions/${data.session.id}?userId=${data.user_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="joinCode">Session Code *</Label>
        <Input
          id="joinCode"
          type="text"
          placeholder="e.g., ABC123"
          value={formData.joinCode}
          onChange={(e) => setFormData({ ...formData, joinCode: e.target.value.toUpperCase() })}
          className="uppercase"
          maxLength={6}
          required
        />
        <p className="text-sm text-gray-500 mt-1">Enter the 6-character code shared by the session creator</p>
      </div>

      <div>
        <Label htmlFor="participantName">Your Name *</Label>
        <Input
          id="participantName"
          type="text"
          placeholder="e.g., Jane Smith"
          value={formData.participantName}
          onChange={(e) => setFormData({ ...formData, participantName: e.target.value })}
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <Button type="submit" disabled={isLoading} size="lg" className="w-full bg-accent hover:bg-accent/90">
        <LogIn className="h-5 w-5 mr-2" />
        {isLoading ? "Joining Session..." : "Join Session"}
      </Button>
    </form>
  )
}
