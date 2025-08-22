import { Button } from "@/components/ui/button"
import { MapPin, Users, Clock, Zap } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Hero Content */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find the Perfect Meeting Spot, <span className="text-primary">Effortlessly</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Collaborate seamlessly with instant recommendations tailored to your team&apos;s needs. Smart location-based
            planning that saves time and brings people together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/instant">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg">
                <Zap className="mr-2 h-5 w-5" />
                Get Instant Recommendations
              </Button>
            </Link>
            <Link href="/sessions">
              <Button
                size="lg"
                variant="outline"
                className="border-accent text-accent hover:bg-accent hover:text-white px-8 py-4 text-lg bg-transparent"
              >
                <Users className="mr-2 h-5 w-5" />
                Start Collaborative Session
              </Button>
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Location Analysis</h3>
              <p className="text-gray-600">
                Our algorithm finds venues that minimize travel time for everyone in your group
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-accent/10 p-4 rounded-full mb-4">
                <Clock className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Collaboration</h3>
              <p className="text-gray-600">Team members can join sessions and add their locations dynamically</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Results</h3>
              <p className="text-gray-600">
                Get venue recommendations with ratings, reviews, and direct Google Maps links
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  )
}
