import { Menu, Smartphone, Zap, Users, Edit3, BarChart3 } from 'lucide-react'

export default function ProblemSolution() {
    return (
        <section className="py-24 md:py-32 px-4 md:px-8 relative z-10">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-24 space-y-6">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 bg-clip-text text-transparent leading-tight">
                        Paper Menus Hold You Back
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Rigid printing cycles, customer frustration, zero insights.
                        Menu+ makes menu management effortless and instant.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    <div className="group relative">
                        <div className="bg-gradient-to-br from-gray-50 to-indigo-50/50 rounded-3xl p-12 lg:p-16 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-indigo-100/50 backdrop-blur-sm hover:scale-105">
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-indigo-500/90 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
                                BEFORE: Paper Nightmare
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center p-3 mt-1">
                                        <Menu className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl text-gray-900 mb-2">Rigid & Wasteful</h4>
                                        <p className="text-gray-600 text-lg">Print daily, menus tear, can't change specials instantly.</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-gray-500/20 rounded-2xl flex items-center justify-center p-3 mt-1">
                                        <Users className="w-6 h-6 text-gray-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl text-gray-900 mb-2">Customers Wait</h4>
                                        <p className="text-gray-600 text-lg">No quick access. Frustrated guests leave without ordering.</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center p-3 mt-1">
                                        <Zap className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl text-gray-900 mb-2">Zero Insights</h4>
                                        <p className="text-gray-600 text-lg">No data on what customers view or want more of.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="group relative">
                        <div className="bg-gradient-to-br from-emerald-50 to-indigo-50 rounded-3xl p-12 lg:p-16 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-emerald-100/50 backdrop-blur-sm hover:scale-105">
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg">
                                AFTER: Menu+ Solution
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center p-3 mt-1">
                                        <Edit3 className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl text-gray-900 mb-2">Instant Updates</h4>
                                        <p className="text-gray-600 text-lg">Add, remove, edit items anytime — live across all QR codes.</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center p-3 mt-1">
                                        <Smartphone className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl text-gray-900 mb-2">Seamless QR Ordering</h4>
                                        <p className="text-gray-600 text-lg">One scan → beautiful menu → faster orders, happier guests.</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center p-3 mt-1">
                                        <BarChart3 className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl text-gray-900 mb-2">Built-in Analytics</h4>
                                        <p className="text-gray-600 text-lg">See what customers view most. Optimize menu, boost sales.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
