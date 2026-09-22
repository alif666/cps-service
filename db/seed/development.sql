-- DEVELOPMENT ONLY. Never run this file in production.
-- Intended for local Docker/Postman testing after Flyway migrations.
-- Password for the development admin is: ChangeMe123!

INSERT INTO companies (code, name) VALUES ('DEV-ABC', 'ABC Group Development') ON CONFLICT (code) DO NOTHING;
INSERT INTO roles (code, name, description) VALUES ('ADMIN', 'Development Administrator', 'Development-only administrator role') ON CONFLICT (code) DO NOTHING;
INSERT INTO permissions (code, name, description) VALUES
  ('organization.manage', 'Manage organizations', 'Development permission for organization configuration'),
  ('access.manage', 'Manage access configuration', 'Development permission for access configuration'),
  ('doa.manage', 'Manage DOA rules', 'Development permission for DOA configuration')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'ADMIN' AND p.code IN ('organization.manage', 'access.manage', 'doa.manage')
ON CONFLICT DO NOTHING;

INSERT INTO users (employee_code, full_name, email, password_hash)
VALUES ('DEV-ADMIN', 'Development Administrator', 'admin@cps.local', '$2a$10$DfNUubktXzkFjBTLyk6VFuBhhl3PLI0g3ABdLPJZOe9iLzmqxDtMm')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_assignments (user_id, company_id, role_id)
SELECT u.id, c.id, r.id FROM users u CROSS JOIN companies c CROSS JOIN roles r
WHERE u.email = 'admin@cps.local' AND c.code = 'DEV-ABC' AND r.code = 'ADMIN'
ON CONFLICT DO NOTHING;
