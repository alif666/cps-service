export type AccessEntity = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateScopedEntityInput = { companyId: string; code: string; name: string; businessUnitId?: string; location?: string };
export type CreateDepartmentInput = { businessUnitId: string; code: string; name: string };
export type CreateRoleInput = { code: string; name: string; description?: string };
export type CreatePermissionInput = { code: string; name: string; description?: string };
export type CreateUserInput = { employeeCode: string; fullName: string; email: string };
export type CreateAssignmentInput = { userId: string; companyId: string; businessUnitId?: string; departmentId?: string; roleId: string; effectiveFrom?: string; effectiveTo?: string };

export type User = { id: string; employeeCode: string; fullName: string; email: string; isActive: boolean; createdAt: string; updatedAt: string };
export type Role = { id: string; code: string; name: string; description?: string; isActive: boolean; createdAt: string; updatedAt: string };
export type Permission = { id: string; code: string; name: string; description?: string; createdAt: string };
export type Assignment = CreateAssignmentInput & { effectiveFrom: string; effectiveTo?: string };

export interface AccessRepository {
  listBusinessUnits(companyId: string): Promise<AccessEntity[]>;
  createBusinessUnit(input: CreateScopedEntityInput): Promise<AccessEntity>;
  listDepartments(businessUnitId: string): Promise<AccessEntity[]>;
  createDepartment(input: CreateDepartmentInput): Promise<AccessEntity>;
  listStores(companyId: string): Promise<AccessEntity[]>;
  createStore(input: CreateScopedEntityInput): Promise<AccessEntity>;
  listRoles(): Promise<Role[]>;
  createRole(input: CreateRoleInput): Promise<Role>;
  listPermissions(): Promise<Permission[]>;
  createPermission(input: CreatePermissionInput): Promise<Permission>;
  listUsers(): Promise<User[]>;
  createUser(input: CreateUserInput): Promise<User>;
  createAssignment(input: CreateAssignmentInput): Promise<Assignment>;
}
