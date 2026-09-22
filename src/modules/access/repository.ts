import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { AccessEntity, AccessRepository, Assignment, CreateAssignmentInput, CreateDepartmentInput, CreatePermissionInput, CreateRoleInput, CreateScopedEntityInput, CreateUserInput, Permission, Role, User } from './types';

const dates = (row: Record<string, unknown>) => ({
  createdAt: new Date(String(row.created_at)).toISOString(),
  updatedAt: new Date(String(row.updated_at)).toISOString(),
});
const entity = (row: Record<string, unknown>): AccessEntity => ({ id: String(row.id), code: String(row.code), name: String(row.name), isActive: Boolean(row.is_active), ...dates(row) });
const role = (row: Record<string, unknown>): Role => ({ id: String(row.id), code: String(row.code), name: String(row.name), description: row.description ? String(row.description) : undefined, isActive: Boolean(row.is_active), ...dates(row) });
const permission = (row: Record<string, unknown>): Permission => ({ id: String(row.id), code: String(row.code), name: String(row.name), description: row.description ? String(row.description) : undefined, createdAt: new Date(String(row.created_at)).toISOString() });
const user = (row: Record<string, unknown>): User => ({ id: String(row.id), employeeCode: String(row.employee_code), fullName: String(row.full_name), email: String(row.email), isActive: Boolean(row.is_active), ...dates(row) });

export class PostgresAccessRepository implements AccessRepository {
  constructor(private readonly db: Pool) {}
  async listBusinessUnits(companyId: string) { const r = await this.db.query('SELECT * FROM business_units WHERE company_id = $1 ORDER BY name', [companyId]); return r.rows.map(entity); }
  async createBusinessUnit(i: CreateScopedEntityInput) { const r = await this.db.query('INSERT INTO business_units (company_id, code, name) SELECT id, $2, $3 FROM companies WHERE id = $1 AND is_active = TRUE RETURNING *', [i.companyId, i.code, i.name]); if (!r.rows[0]) throw new Error('Company not found or inactive'); return entity(r.rows[0]); }
  async listDepartments(businessUnitId: string) { const r = await this.db.query('SELECT * FROM departments WHERE business_unit_id = $1 ORDER BY name', [businessUnitId]); return r.rows.map(entity); }
  async createDepartment(i: CreateDepartmentInput) { const r = await this.db.query('INSERT INTO departments (business_unit_id, code, name) SELECT id, $2, $3 FROM business_units WHERE id = $1 AND is_active = TRUE RETURNING *', [i.businessUnitId, i.code, i.name]); if (!r.rows[0]) throw new Error('Business unit not found or inactive'); return entity(r.rows[0]); }
  async listStores(companyId: string) { const r = await this.db.query('SELECT * FROM stores WHERE company_id = $1 ORDER BY name', [companyId]); return r.rows.map(entity); }
  async createStore(i: CreateScopedEntityInput) { const r = await this.db.query(`INSERT INTO stores (company_id, business_unit_id, code, name, location) SELECT c.id, bu.id, $3, $4, $5 FROM companies c LEFT JOIN business_units bu ON bu.id = $2 AND bu.company_id = c.id AND bu.is_active = TRUE WHERE c.id = $1 AND c.is_active = TRUE RETURNING stores.*`, [i.companyId, i.businessUnitId ?? null, i.code, i.name, i.location ?? null]); if (!r.rows[0]) throw new Error('Company or business unit not found or inactive'); return entity(r.rows[0]); }
  async listRoles() { const r = await this.db.query('SELECT * FROM roles ORDER BY name'); return r.rows.map(role); }
  async createRole(i: CreateRoleInput) { const r = await this.db.query('INSERT INTO roles (code, name, description) VALUES ($1, $2, $3) RETURNING *', [i.code, i.name, i.description ?? null]); return role(r.rows[0]); }
  async listPermissions() { const r = await this.db.query('SELECT * FROM permissions ORDER BY code'); return r.rows.map(permission); }
  async createPermission(i: CreatePermissionInput) { const r = await this.db.query('INSERT INTO permissions (code, name, description) VALUES ($1, $2, $3) RETURNING *', [i.code, i.name, i.description ?? null]); return permission(r.rows[0]); }
  async listUsers() { const r = await this.db.query('SELECT * FROM users ORDER BY full_name'); return r.rows.map(user); }
  async createUser(i: CreateUserInput) { const r = await this.db.query('INSERT INTO users (employee_code, full_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *', [i.employeeCode, i.fullName, i.email, await bcrypt.hash(i.password, 12)]); return user(r.rows[0]); }
  async createAssignment(i: CreateAssignmentInput) {
    const r = await this.db.query(`INSERT INTO user_assignments (user_id, company_id, business_unit_id, department_id, role_id, effective_from, effective_to)
      SELECT u.id, c.id, bu.id, d.id, r.id, COALESCE($6::date, CURRENT_DATE), $7 FROM users u CROSS JOIN companies c CROSS JOIN roles r
      LEFT JOIN business_units bu ON bu.id = $3 AND bu.company_id = c.id AND bu.is_active = TRUE
      LEFT JOIN departments d ON d.id = $4 AND d.business_unit_id = bu.id AND d.is_active = TRUE
      WHERE u.id = $1 AND u.is_active = TRUE AND c.id = $2 AND c.is_active = TRUE AND r.id = $5 AND r.is_active = TRUE RETURNING user_assignments.*`, [i.userId, i.companyId, i.businessUnitId ?? null, i.departmentId ?? null, i.roleId, i.effectiveFrom ?? null, i.effectiveTo ?? null]);
    if (!r.rows[0]) throw new Error('User, company, role, or scope is not active');
    const row = r.rows[0];
    return { userId: String(row.user_id), companyId: String(row.company_id), businessUnitId: row.business_unit_id ? String(row.business_unit_id) : undefined, departmentId: row.department_id ? String(row.department_id) : undefined, roleId: String(row.role_id), effectiveFrom: String(row.effective_from), effectiveTo: row.effective_to ? String(row.effective_to) : undefined } as Assignment;
  }
}
