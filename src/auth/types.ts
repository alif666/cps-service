export type AuthRole = { code: string; companyId?: string; businessUnitId?: string };
export type AuthUser = { id: string; email: string; fullName: string; passwordHash: string; roles: AuthRole[]; permissions: string[]; isActive: boolean };
export type AuthClaims = { sub: string; email: string; roles: AuthRole[]; permissions: string[] };
export interface AuthRepository { findByEmail(email: string): Promise<AuthUser | null>; }
