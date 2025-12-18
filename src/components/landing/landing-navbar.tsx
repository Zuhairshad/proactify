"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export function LandingNavbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/5 border-b border-white/10">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo & Brand */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative">
                            <Shield className="h-8 w-8 text-indigo-400 transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl group-hover:bg-indigo-500/30 transition-all" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                            Proactify+
                        </span>
                    </Link>

                    {/* Login Button */}
                    <Link href="/sign-in">
                        <Button
                            variant="outline"
                            className="border-white/20 bg-black text-white"
                        >
                            Login
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
