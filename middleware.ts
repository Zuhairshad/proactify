import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
    // Routes that can be accessed while signed out
    publicRoutes: [
        "/",
        "/welcome",
        "/sign-in(.*)",
        "/sign-up(.*)",
        "/api/webhook(.*)",
    ],
    // Routes that can always be accessed, and have
    // no authentication information
    ignoredRoutes: ["/api/webhook(.*)"],
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
