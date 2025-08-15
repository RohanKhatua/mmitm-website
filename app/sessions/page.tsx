"use client"
import { Navigation } from "@/components/navigation"
import { CreateSessionForm } from "@/components/create-session-form"
import { JoinSessionForm } from "@/components/join-session-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Plus } from "lucide-react"

export default function SessionsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Collaborative Sessions</h1>
          <p className="text-xl text-gray-600">
            Create a session for your team to collaborate on finding the perfect meeting spot, or join an existing
            session.
          </p>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Session</span>
            </TabsTrigger>
            <TabsTrigger value="join" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Join Session</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Session</CardTitle>
              </CardHeader>
              <CardContent>
                <CreateSessionForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="join" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Join Existing Session</CardTitle>
              </CardHeader>
              <CardContent>
                <JoinSessionForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
