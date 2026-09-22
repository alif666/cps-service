import { Pool } from 'pg';
import { AuthRepository, AuthUser } from './types';

export class PostgresAuthRepository implements AuthRepository {
  constructor(private readonly db: Pool) {}
  async findByEmail(email: string): Promise<AuthUser | null> {
    const result = await this.db.query(`SELECT u.id, u.email, u.full_name, u.password_hash, u.is_active,
      COALESCE(array_agg(DISTINCT p.code) FILTER (WHERE p.code IS NOT NULL), '{}') AS permissions
      FROM users u
      LEFT JOIN user_assignments ua ON ua.user_id = u.id AND CURRENT_DATE BETWEEN ua.effective_from AND COALESCE(ua.effective_to, CURRENT_DATE)
      LEFT JOIN roles r ON r.id = ua.role_id AND r.is_active = TRUE
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions p ON p.id = rp.permission_id
      WHERE LOWER(u.email) = LOWER($1)
      GROUP BY u.id`, [email]);
    if (!result.rows[0]) return null;
    const row = result.rows[0];
    return { id: String(row.id), email: String(row.email), fullName: String(row.full_name), passwordHash: String(row.password_hash ?? ''), permissions: row.permissions ?? [], isActive: Boolean(row.is_active) };
  }
}
