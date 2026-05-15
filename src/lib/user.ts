// src/lib/user.ts

// Generate a stable userId once and persist it forever.
const userId = localStorage.getItem('secy_user_id') ?? crypto.randomUUID();
localStorage.setItem('secy_user_id', userId);

/**
 * Retrieves the persisted user ID from localStorage.
 * @returns The user ID.
 */
export const getUserId = () => localStorage.getItem('secy_user_id')!;
