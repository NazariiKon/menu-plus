import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Quote, Users, Zap, ShoppingBag } from 'lucide-react'

const testimonials = [
  {
    name: "Maria K.",
    cafe: "Cozy Corner Cafe",
    text: "Menu+ saved us hours every week. Customers love scanning QR codes and our orders went up 35% instantly!",
    rating: 5,
    avatar: "/avatars/maria.jpg"
  },
  {
    name: "Ahmed R.",
    cafe: "Spice Route Bistro",
    text: "Perfect for small restaurants. Easy to update daily specials and the analytics show exactly what sells.",
    rating: 5,
    avatar: "/avatars/ahmed.jpg"
  },
  {
    name: "Sophie L.",
    cafe: "Green Leaf Coffee",
    text: "Beautiful designs, works on every phone. No more printing menus — total game changer for busy mornings.",
    rating: 5,
    avatar: "/avatars/sophie.jpg"
  },
  {
    name: "Carlos M.",
    cafe: "Taco Haven",
    text: "Free tier is generous, setup in 2 minutes. Customers order faster and we see what they love most.",
    rating: 5,
    avatar: "/avatars/carlos.jpg"
  }
]

export default function Testimonials() {
  return (
    <section className="py-32 px-4 md:px-8 relative z-10 bg-gradient-to-br from-emerald-50/50 via-white to-indigo-50/50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24 space-y-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 via-emerald-900 to-gray-900 bg-clip-text text-transparent leading-tight">
            Trusted by Venue Owners Worldwide
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join 5,000+ small businesses boosting orders with Menu+
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 text-center">
          <div className="space-y-3 p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
            <Users className="w-16 h-16 text-emerald-500 mx-auto" />
            <div className="text-4xl font-black text-gray-900">5K+</div>
            <div className="text-lg font-semibold text-gray-600">Venues Using</div>
          </div>
          <div className="space-y-3 p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
            <Zap className="w-16 h-16 text-indigo-500 mx-auto" />
            <div className="text-4xl font-black text-gray-900">2 min</div>
            <div className="text-lg font-semibold text-gray-600">Avg Setup</div>
          </div>
          <div className="space-y-3 p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
            <Star className="w-16 h-16 text-yellow-500 mx-auto" />
            <div className="text-4xl font-black text-gray-900">4.9/5</div>
            <div className="text-lg font-semibold text-gray-600">Rating</div>
          </div>
          <div className="space-y-3 p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
            <ShoppingBag className="w-16 h-16 text-purple-500 mx-auto" />
            <div className="text-4xl font-black text-gray-900">35%</div>
            <div className="text-lg font-semibold text-gray-600">Order Boost</div>
          </div>
        </div>

        {/* Testimonials Grid/Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group bg-white/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl hover:-translate-y-3 transition-all duration-500 border-0 hover:border-emerald-200 overflow-hidden relative min-h-[420px] flex flex-col"  // ✅ min-h + flex-col
            >
              <CardHeader className="pb-6 pt-16 flex-grow relative flex-shrink-0">
                {/* Quote Icon */}
                <Quote className="absolute top-4 right-4 w-12 h-12 text-emerald-200 group-hover:text-emerald-400 transition-colors" />

                {/* Avatar */}
                <div className="flex items-center justify-center mb-6">
                  <Avatar className="w-20 h-20 ring-4 ring-white/50 group-hover:ring-emerald-200 transition-all">
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-indigo-500 text-white text-2xl font-bold">
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>

              <CardContent className="pb-8 flex-grow space-y-4">
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                <p className="text-lg text-gray-700 leading-relaxed text-center italic group-hover:text-gray-900 transition-colors flex-1 min-h-[80px] flex items-center justify-center px-2">
                  "{testimonial.text}"
                </p>
              </CardContent>

              <div className="border-t border-emerald-100/50 pt-1 px-6 pb-6 bg-gradient-to-t from-emerald-50/50 to-transparent flex-shrink-0">
                <div className="space-y-2 text-center">
                  <div className="font-black text-xl lg:text-2xl text-gray-900 group-hover:text-emerald-600 transition-colors truncate max-w-[200px] mx-auto leading-tight">
                    {testimonial.name}
                  </div>
                  <div className="text-emerald-600 font-semibold text-base truncate max-w-[220px] mx-auto">
                    {testimonial.cafe}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>


      </div>
    </section>
  )
}
