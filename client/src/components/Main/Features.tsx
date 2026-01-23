import { Zap, Edit3, Smartphone, BarChart3 } from 'lucide-react'

export default function Features() {
    return (
        <section className="py-32 px-4 md:px-8 relative z-10">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-24 space-y-6">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 bg-clip-text text-transparent leading-tight">
                        Everything You Need, Nothing You Don't
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Simple, powerful tools built for small hospitality businesses. No complexity, just results.
                    </p>
                </div>

                {/* 2x2 Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-12">
                    {/* Lightning Fast */}
                    <div className="group relative bg-white/70 backdrop-blur-sm rounded-3xl p-10 lg:p-12 shadow-xl hover:shadow-3xl hover:-translate-y-4 transition-all duration-500 border border-white/50 hover:border-indigo-200">
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-indigo-500 text-white p-4 rounded-2xl shadow-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                            <Zap className="w-8 h-8" />
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6 text-center group-hover:text-indigo-600 transition-colors">
                            Lightning Fast
                        </h3>
                        <p className="text-xl text-gray-600 leading-relaxed text-center max-w-lg mx-auto">
                            Create your first menu in <strong>2 minutes</strong>. Changes go live instantly —
                            no waiting, no hassle.
                        </p>
                    </div>

                    {/* Instant Updates */}
                    <div className="group relative bg-white/70 backdrop-blur-sm rounded-3xl p-10 lg:p-12 shadow-xl hover:shadow-3xl hover:-translate-y-4 transition-all duration-500 border border-white/50 hover:border-emerald-200">
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white p-4 rounded-2xl shadow-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                            <Edit3 className="w-8 h-8" />
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6 text-center group-hover:text-emerald-600 transition-colors">
                            Instant Updates
                        </h3>
                        <p className="text-xl text-gray-600 leading-relaxed text-center max-w-lg mx-auto">
                            Add, remove, edit dishes <strong>anytime</strong> from your phone.
                            All QR codes update automatically across your restaurant.
                        </p>
                    </div>

                    {/* Mobile-First */}
                    <div className="group relative bg-white/70 backdrop-blur-sm rounded-3xl p-10 lg:p-12 shadow-xl hover:shadow-3xl hover:-translate-y-4 transition-all duration-500 border border-white/50 hover:border-blue-200">
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white p-4 rounded-2xl shadow-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                            <Smartphone className="w-8 h-8" />
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6 text-center group-hover:text-blue-600 transition-colors">
                            Mobile-First
                        </h3>
                        <p className="text-xl text-gray-600 leading-relaxed text-center max-w-lg mx-auto">
                            Beautiful menus on <strong>every phone</strong>. No apps to download,
                            works perfectly on iPhone, Android, anything.
                        </p>
                    </div>

                    {/* Smart Analytics */}
                    <div className="group relative bg-white/70 backdrop-blur-sm rounded-3xl p-10 lg:p-12 shadow-xl hover:shadow-3xl hover:-translate-y-4 transition-all duration-500 border border-white/50 hover:border-purple-200">
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white p-4 rounded-2xl shadow-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                            <BarChart3 className="w-8 h-8" />
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6 text-center group-hover:text-purple-600 transition-colors">
                            Smart Analytics
                        </h3>
                        <p className="text-xl text-gray-600 leading-relaxed text-center max-w-lg mx-auto">
                            See exactly what customers view most. <strong>Optimize your menu </strong>
                            based on real data, boost profits automatically.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
