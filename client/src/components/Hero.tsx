import { Button } from "@/components/ui/button"
import { Smartphone, Zap, DollarSign, BarChart3 } from 'lucide-react'
import { Link } from "react-router-dom"

export default function Hero() {
    return (
        <section className="py-20 md:py-32 px-4 flex items-center justify-center overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                <div className="space-y-8 text-center lg:text-left">
                    <h1 className="text-5xl md:text-7xl lg:text-7xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                        QR Menu in <span className="text-6xl md:text-8xl">2</span> Minutes
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                        Ditch paper menus. Create beautiful digital QR menus for your restaurant, cafe or bar.
                        Edit online, track what customers view, boost orders instantly.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                        <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300">
                            <Zap className="w-10 h-10 text-indigo-500" />
                            <span className="text-sm font-semibold text-gray-900">Lightning Fast</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300">
                            <DollarSign className="w-10 h-10 text-green-500" />
                            <span className="text-sm font-semibold text-gray-900">Free Forever</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300">
                            <Smartphone className="w-10 h-10 text-blue-500" />
                            <span className="text-sm font-semibold text-gray-900">Mobile Ready</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300">
                            <BarChart3 className="w-10 h-10 text-orange-500" />
                            <span className="text-sm font-semibold text-gray-900">View Analytics</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-8">
                        <Link to={"/signup"}>
                            <Button size="lg" className="text-xl px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all duration-300 font-semibold">
                                Create Free Menu Now
                            </Button>
                        </Link>
                        <Link to={"/"}>
                            <Button variant="outline" size="lg" className="text-xl px-8 py-6 border-2 border-gray-200 hover:bg-gray-50 shadow-lg font-semibold">
                                Watch Examples
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="relative flex justify-center lg:justify-end">
                    <div className="relative w-80 h-96 md:w-96 md:h-[500px] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center border border-white/50 hover:scale-105 transition-all duration-500">
                        <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl shadow-inner flex flex-col items-center justify-center p-8 relative overflow-hidden">
                            <div className="w-48 h-48 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl mb-6 animate-pulse">
                                <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Scan & Order</h3>
                            <p className="text-gray-600 text-sm text-center">Your menu looks perfect on every phone</p>
                            <div className="absolute inset-0">
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-2 h-2 bg-indigo-400 rounded-full animate-bounce opacity-60"
                                        style={{
                                            left: `${20 + i * 15}%`,
                                            top: `${10 + i * 10}%`,
                                            animationDelay: `${i * 0.2}s`,
                                            animationDuration: `${1.5 + i * 0.2}s`
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute top-1/4 left-10 w-72 h-72 bg-indigo-300/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </section>
    )
}
