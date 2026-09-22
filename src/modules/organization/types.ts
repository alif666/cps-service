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
export type UpdateOrganizationInput = Partial<CreateOrganizationInput>;

export interface OrganizationRepository {
    list(): Promise<Organization[]>;

    create(input: CreateOrganizationInput): Promise<Organization>;

    update(id: string, input: UpdateOrganizationInput): Promise<Organization | null>;

    setActive(id: string, isActive: boolean): Promise<Organization | null>;
}
