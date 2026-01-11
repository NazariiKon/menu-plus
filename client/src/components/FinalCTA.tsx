import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function FinalCTA() {
    return (
        <section className="py-32 px-4 md:px-8 bg-gradient-to-t from-indigo-900/95 to-purple-900/95 text-white relative z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-transparent to-indigo-500/20 blur-3xl animate-pulse" />

            <div className="max-w-4xl mx-auto text-center relative z-20">
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-white via-emerald-50 to-white bg-clip-text text-transparent mb-8 leading-tight">
                    Ready to Ditch Paper Menus?
                </h2>
                <p className="text-2xl md:text-3xl text-indigo-100/90 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Join 5K+ venues. Create your first QR menu in 2 minutes — completely free.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                    <Link to="/signup" className="w-full sm:w-auto flex-shrink-0">  {/* ✅ w-full mobile, auto desktop */}
                        <Button
                            size="lg"
                            className="w-full sm:w-auto text-xl sm:text-2xl px-8 sm:px-12 py-6 sm:py-8 bg-white text-indigo-900 hover:bg-emerald-50 font-bold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 min-h-[56px] sm:min-h-[64px]"
                        >
                            🚀 Create Free Menu Now
                        </Button>
                    </Link>
                </div>

            </div>
        </section>
    )
}
