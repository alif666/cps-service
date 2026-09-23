import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: '.env.bootstrap.local' });

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const databaseUrl = required('DATABASE_URL_UNPOOLED');
const email = required('BOOTSTRAP_ADMIN_EMAIL').toLowerCase();
const fullName = required('BOOTSTRAP_ADMIN_FULL_NAME');
const employeeCode = required('BOOTSTRAP_ADMIN_EMPLOYEE_CODE');
const companyCode = required('BOOTSTRAP_COMPANY_CODE');
const companyName = required('BOOTSTRAP_COMPANY_NAME');
const promptForPassword = async () => {
  if (process.env.BOOTSTRAP_ADMIN_PASSWORD) return process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const readline = await import('node:readline/promises');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const password = await rl.question('Enter production admin password: ');
  rl.close();
  return password.trim();
};

async function main() {
  const password = await promptForPassword();
  if (!password) throw new Error('A production admin password is required');
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const company = await client.query(
      `INSERT INTO companies (code, name) VALUES ($1, $2)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [companyCode, companyName],
    );
    const companyId = company.rows[0].id;

    const role = await client.query(
      `INSERT INTO roles (code, name, description) VALUES ('ADMIN', 'System Administrator', 'Production system administrator')
       ON CONFLICT (code) DO UPDATE SET is_active = TRUE
       RETURNING id`,
    );
    const roleId = role.rows[0].id;

    await client.query(
      `INSERT INTO permissions (code, name, description) VALUES
       ('organization.manage', 'Manage organizations', 'Manage organization configuration'),
       ('access.manage', 'Manage access configuration', 'Manage users, roles, permissions, and organization structure'),
       ('doa.manage', 'Manage DOA rules', 'Manage delegation of authority rules')
       ON CONFLICT (code) DO NOTHING`,
    );
    await client.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT $1, id FROM permissions WHERE code IN ('organization.manage', 'access.manage', 'doa.manage')
       ON CONFLICT DO NOTHING`,
      [roleId],
    );

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await client.query(
      `INSERT INTO users (employee_code, full_name, email, password_hash, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT (email) DO UPDATE SET employee_code = EXCLUDED.employee_code,
         full_name = EXCLUDED.full_name, password_hash = EXCLUDED.password_hash, is_active = TRUE
       RETURNING id`,
      [employeeCode, fullName, email, passwordHash],
    );

    await client.query(
      `INSERT INTO user_assignments (user_id, company_id, role_id)
       VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [user.rows[0].id, companyId, roleId],
    );
    await client.query('COMMIT');
    console.log(`Production administrator provisioned for ${email}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
