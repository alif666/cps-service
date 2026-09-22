export type Organization = {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CreateOrganizationInput = {
    code: string;
    name: string;
};

export interface OrganizationRepository {
    list(): Promise<Organization[]>;

    create(input: CreateOrganizationInput): Promise<Organization>;

    setActive(id: string, isActive: boolean): Promise<Organization | null>;
}
