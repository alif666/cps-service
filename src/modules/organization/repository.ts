import {Pool} from 'pg';
import {CreateOrganizationInput, Organization, OrganizationRepository} from './types';

const mapRow = (row: Record<string, unknown>): Organization => ({
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    isActive: Boolean(row.is_active),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
});

export class PostgresOrganizationRepository implements OrganizationRepository {
    constructor(private readonly db: Pool) {
    }

    async list(): Promise<Organization[]> {
        const result = await this.db.query('SELECT * FROM companies ORDER BY name');
        return result.rows.map(mapRow);
    }

    async create(input: CreateOrganizationInput): Promise<Organization> {
        const result = await this.db.query(
            `INSERT INTO companies (code, name)
             VALUES ($1, $2) RETURNING *`,
            [input.code, input.name],
        );
        return mapRow(result.rows[0]);
    }

    async setActive(id: string, isActive: boolean): Promise<Organization | null> {
        const result = await this.db.query(
            `UPDATE companies
             SET is_active = $2,
                 updated_at = NOW()
             WHERE id = $1 RETURNING *`,
            [id, isActive],
        );
        return result.rows[0] ? mapRow(result.rows[0]) : null;
    }
}
