import Features from "@/components/Features";
import FinalCTA from "@/components/FinalCTA";
import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemAndSolution";
import Testimonials from "@/components/Testimonial";

export default function Home() {
    return (
        <>
            <main className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen overflow-hidden relative">
                <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-500" />
                <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl animate-pulse" />

                <Hero />
                <ProblemSolution />
                <Features />
                <Testimonials />

                <FinalCTA />
            </main>

        </>
    )
}
