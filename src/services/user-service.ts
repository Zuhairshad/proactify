// User service is deprecated - Clerk handles authentication
// This file is kept for backwards compatibility

import type { UserProfile, Badge } from '@/lib/types';

// Mock functions for backwards compatibility
export async function getUsers(): Promise<UserProfile[]> {
    return [];
}

export async function getUser(userId: string): Promise<UserProfile | undefined> {
    return undefined;
}

export async function getCurrentUser(): Promise<UserProfile | undefined> {
    return undefined;
}
