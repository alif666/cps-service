import { z } from 'zod';
import { AccessRepository, CreateAssignmentInput, CreateDepartmentInput, CreatePermissionInput, CreateRoleInput, CreateScopedEntityInput, CreateUserInput } from './types';

const code = z.string().trim().min(1).max(80).regex(/^[A-Za-z0-9_-]+$/);
const name = z.string().trim().min(2).max(200);
const scopedSchema = z.object({ companyId: z.string().uuid(), businessUnitId: z.string().uuid().optional(), code: code.max(50), name, location: z.string().trim().max(300).optional() });
const departmentSchema = z.object({ businessUnitId: z.string().uuid(), code: code.max(50), name });
const roleSchema = z.object({ code, name: z.string().trim().min(2).max(120), description: z.string().trim().max(500).optional() });
const permissionSchema = roleSchema;
const userSchema = z.object({ employeeCode: code, fullName: name, email: z.string().email().max(320), password: z.string().min(12).max(200) });
const assignmentSchema = z.object({ userId: z.string().uuid(), companyId: z.string().uuid(), businessUnitId: z.string().uuid().optional(), departmentId: z.string().uuid().optional(), roleId: z.string().uuid(), effectiveFrom: z.string().date().optional(), effectiveTo: z.string().date().optional() });

export class AccessService {
  constructor(private readonly repository: AccessRepository) {}
  listBusinessUnits(companyId: string) { return this.repository.listBusinessUnits(z.string().uuid().parse(companyId)); }
  async createBusinessUnit(input: CreateScopedEntityInput) { return this.repository.createBusinessUnit(scopedSchema.omit({ businessUnitId: true, location: true }).parse(input)); }
  listDepartments(businessUnitId: string) { return this.repository.listDepartments(z.string().uuid().parse(businessUnitId)); }
  async createDepartment(input: CreateDepartmentInput) { return this.repository.createDepartment(departmentSchema.parse(input)); }
  listStores(companyId: string) { return this.repository.listStores(z.string().uuid().parse(companyId)); }
  async createStore(input: CreateScopedEntityInput) { return this.repository.createStore(scopedSchema.parse(input)); }
  listRoles() { return this.repository.listRoles(); }
  async createRole(input: CreateRoleInput) { return this.repository.createRole(roleSchema.parse(input)); }
  async assignRolePermissions(roleId: string, permissionIds: string[]) { return this.repository.assignRolePermissions(z.string().uuid().parse(roleId), z.array(z.string().uuid()).parse(permissionIds)); }
  listPermissions() { return this.repository.listPermissions(); }
  async createPermission(input: CreatePermissionInput) { return this.repository.createPermission(permissionSchema.parse(input)); }
  listUsers() { return this.repository.listUsers(); }
  async createUser(input: CreateUserInput) { return this.repository.createUser(userSchema.parse(input)); }
  async createAssignment(input: CreateAssignmentInput) { return this.repository.createAssignment(assignmentSchema.parse(input)); }
}
