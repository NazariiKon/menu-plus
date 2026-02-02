import Features from "@/components/Main/Features"
import FinalCTA from "@/components/Main/FinalCTA"
import Hero from "@/components/Main/Hero"
import ProblemSolution from "@/components/Main/ProblemAndSolution"
import Testimonials from "@/components/Main/Testimonial"

export default function Home() {
    return (
        <div className="relative overflow-x-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl animate-pulse -z-10 pointer-events-none" />
            <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-500 -z-10 pointer-events-none" />
            <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl animate-pulse delay-1000 -z-10 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl animate-pulse -z-10 pointer-events-none" />

            <Hero />
            <ProblemSolution />
            <div id="features-section">
                <Features />
            </div>
            <Testimonials />
            <FinalCTA />
        </div>
    )
}
