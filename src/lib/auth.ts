// Temporarily disabled - Clerk is not installed
// import { currentUser } from '@clerk/nextjs/server';

export async function requireAuth() {
    // Temporarily return a mock user ID until auth is properly configured
    // const user = await currentUser();
    // if (!user) {
    //     throw new Error('UNAUTHORIZED: You must be signed in to use AI features.');
    // }
    // return user.id;
    return 'mock-user-id'; // Temporary for development
}

