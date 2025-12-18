import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="h-screen w-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <SignIn
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "shadow-2xl border border-white/10",
                        formButtonPrimary: "bg-primary hover:bg-primary/90",
                    },
                }}
            />
        </div>
    );
}
