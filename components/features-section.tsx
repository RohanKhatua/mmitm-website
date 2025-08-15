import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Users, Settings, Star, Navigation, Clock } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: MapPin,
      title: "Multiple Transport Modes",
      description: "Support for driving, walking, transit, and bicycle routing to find the best options for everyone.",
    },
    {
      icon: Users,
      title: "Collaborative Planning",
      description: "Create sessions where team members can join and contribute their locations in real-time.",
    },
    {
      icon: Settings,
      title: "Customizable Preferences",
      description: "Filter by venue types, price levels, and other preferences to match your group's needs.",
    },
    {
      icon: Star,
      title: "Quality Recommendations",
      description: "Get venues with ratings, reviews, and detailed information powered by Google Places API.",
    },
    {
      icon: Navigation,
      title: "Direct Navigation",
      description: "One-click access to Google Maps directions from each participant's location.",
    },
    {
      icon: Clock,
      title: "Fairness Algorithm",
      description: "Smart ranking that minimizes travel time imbalances to ensure fairness for all participants.",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need for Perfect Meetups</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make group planning effortless and fair for everyone involved.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
