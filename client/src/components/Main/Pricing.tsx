import { Check, Zap, Sparkles, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Pricing() {
    const plans = [
        {
            name: "Starter",
            price: "0",
            description: "Perfect for small food trucks and pop-up cafes.",
            features: [
                "1 Venue",
                "Up to 20 Menu Items",
                "Digital QR Code",
                "Basic Analytics",
                "WhatsApp Order Button",
            ],
            cta: "Get Started",
            highlight: false,
            icon: Zap,
        },
        {
            name: "Professional",
            price: "9",
            description: "Best for growing restaurants and busy bars.",
            features: [
                "1 Venue",
                "Unlimited Menu Items",
                "Advanced Analytics",
                "Priority Support",
                "Custom Branding",
                "Seasonal Menu Scheduling",
            ],
            cta: "Start Free Trial",
            highlight: true,
            icon: Sparkles,
        },
        {
            name: "Enterprise",
            price: "19",
            description: "For restaurant chains and large venues.",
            features: [
                "Unlimited Venues",
                "Unlimited Items",
                "Multi-user Admin Access",
                "Dedicated Account Manager",
                "API Access",
                "Custom Domain Support",
            ],
            cta: "Contact Sales",
            highlight: false,
            icon: Building2,
        }
    ];

    return (
        <section className="py-24 px-4 bg-white" id="pricing-section">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Choose the plan that fits your business. No hidden fees, cancel anytime.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col p-8 rounded-3xl transition-all duration-300 ${plan.highlight
                                ? 'bg-slate-900 text-white shadow-2xl scale-105 z-10 border-4 border-blue-500'
                                : 'bg-slate-50 text-gray-900 border border-slate-200 hover:shadow-xl'
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase">
                                    Most Popular
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-8">
                                <plan.icon className={`w-10 h-10 ${plan.highlight ? 'text-blue-400' : 'text-blue-600'}`} />
                                <div className="text-right">
                                    <span className="text-4xl font-black">${plan.price}</span>
                                    <span className={`text-sm ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>/mo</span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                            <p className={`text-sm mb-8 ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                                {plan.description}
                            </p>

                            <ul className="space-y-4 mb-10 flex-grow">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm">
                                        <Check className={`w-5 h-5 shrink-0 ${plan.highlight ? 'text-blue-400' : 'text-blue-600'}`} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full py-6 text-lg font-bold rounded-2xl transition-all ${plan.highlight
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-white text-gray-900 border-2 border-slate-200 hover:bg-slate-100'
                                    }`}
                            >
                                {plan.cta}
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-slate-500 text-sm">
                        All plans include a 14-day free trial. Need a custom setup?
                        <span className="text-blue-600 font-semibold cursor-pointer hover:underline ml-1">Talk to us.</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
