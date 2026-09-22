import {z} from 'zod';
import {CreateOrganizationInput, Organization, OrganizationRepository} from './types';

export const createOrganizationSchema = z.object({
    code: z.string().trim().min(1).max(50).regex(/^[A-Za-z0-9_-]+$/),
    name: z.string().trim().min(2).max(200),
});

export class OrganizationService {
    constructor(private readonly repository: OrganizationRepository) {
    }

    list(): Promise<Organization[]> {
        return this.repository.list();
    }

    async create(input: CreateOrganizationInput): Promise<Organization> {
        return this.repository.create(createOrganizationSchema.parse(input));
    }

    async setActive(id: string, isActive: boolean): Promise<Organization> {
        const organization = await this.repository.setActive(id, isActive);
        if (!organization) throw new Error('Organization not found');
        return organization;
    }
}
