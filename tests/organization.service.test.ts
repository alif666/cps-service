import { OrganizationService } from '../src/modules/organization/service';
import { OrganizationRepository } from '../src/modules/organization/types';

const organization = {
  id: 'org-1', code: 'ABC', name: 'ABC Group', isActive: true,
  createdAt: '2026-09-22T00:00:00.000Z', updatedAt: '2026-09-22T00:00:00.000Z',
};

describe('OrganizationService', () => {
  const repository: jest.Mocked<OrganizationRepository> = {
    list: jest.fn(), create: jest.fn(), update: jest.fn(), setActive: jest.fn(),
  };
  const service = new OrganizationService(repository);

  beforeEach(() => jest.clearAllMocks());

  it('creates an organization after validating code and name', async () => {
    repository.create.mockResolvedValue(organization);
    await expect(service.create({ code: 'ABC', name: 'ABC Group' })).resolves.toEqual(organization);
    expect(repository.create).toHaveBeenCalledWith({ code: 'ABC', name: 'ABC Group' });
  });

  it('rejects an invalid organization code before persistence', async () => {
    await expect(service.create({ code: 'ABC GROUP', name: 'ABC Group' })).rejects.toThrow();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('fails clearly when activating an unknown organization', async () => {
    repository.setActive.mockResolvedValue(null);
    await expect(service.setActive('missing', true)).rejects.toThrow('Organization not found');
  });

  it('updates an organization with validated fields', async () => {
    repository.update.mockResolvedValue({ ...organization, name: 'ABC Group Updated' });
    await expect(service.update('org-1', { name: 'ABC Group Updated' })).resolves.toMatchObject({ name: 'ABC Group Updated' });
    expect(repository.update).toHaveBeenCalledWith('org-1', { name: 'ABC Group Updated' });
  });
});
