export type AuthUser = { id: string; email: string; fullName: string; passwordHash: string; permissions: string[]; isActive: boolean };
export type AuthClaims = { sub: string; email: string; permissions: string[] };
export interface AuthRepository { findByEmail(email: string): Promise<AuthUser | null>; }
