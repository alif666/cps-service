import { AccessRepository } from '../src/modules/access/types';
import { AccessService } from '../src/modules/access/service';

describe('AccessService', () => {
  const repository: jest.Mocked<AccessRepository> = {
    listBusinessUnits: jest.fn(), createBusinessUnit: jest.fn(), listDepartments: jest.fn(), createDepartment: jest.fn(),
    listStores: jest.fn(), createStore: jest.fn(), listRoles: jest.fn(), createRole: jest.fn(), assignRolePermissions: jest.fn(), listPermissions: jest.fn(),
    createPermission: jest.fn(), listUsers: jest.fn(), createUser: jest.fn(), createAssignment: jest.fn(),
  };
  const service = new AccessService(repository);

  beforeEach(() => jest.clearAllMocks());

  it('rejects a business unit with an invalid company id before persistence', async () => {
    await expect(service.createBusinessUnit({ companyId: 'not-a-uuid', code: 'UNIT-1', name: 'Unit 1' })).rejects.toThrow();
    expect(repository.createBusinessUnit).not.toHaveBeenCalled();
  });

  it('validates and delegates role creation', async () => {
    const role = { id: 'role-1', code: 'UNIT_HEAD', name: 'Unit Head', permissionIds: [], isActive: true, createdAt: '', updatedAt: '' };
    repository.createRole.mockResolvedValue(role);
    await expect(service.createRole({ code: 'UNIT_HEAD', name: 'Unit Head' })).resolves.toEqual(role);
    expect(repository.createRole).toHaveBeenCalledWith({ code: 'UNIT_HEAD', name: 'Unit Head' });
  });

  it('rejects an invalid user email before persistence', async () => {
    await expect(service.createUser({ employeeCode: 'E-1', fullName: 'Test User', email: 'invalid', password: 'ChangeMe123!' })).rejects.toThrow();
    expect(repository.createUser).not.toHaveBeenCalled();
  });
});
