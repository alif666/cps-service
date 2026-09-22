import express, {ErrorRequestHandler} from 'express';
import {pool} from './db/pool';
import {PostgresOrganizationRepository} from './modules/organization/repository';
import {organizationRouter} from './modules/organization/routes';
import {OrganizationService} from './modules/organization/service';
import {PostgresAccessRepository} from './modules/access/repository';
import {accessRouter} from './modules/access/routes';
import {AccessService} from './modules/access/service';
import {PostgresAuthRepository} from './auth/repository';
import {AuthService} from './auth/service';
import {authRouter} from './auth/routes';
import {authenticate, requirePermission} from './middleware/auth';
import {PostgresDoaRepository} from './modules/doa/repository';
import {DoaService} from './modules/doa/service';
import {doaRouter} from './modules/doa/routes';

export const createApp = () => {
    const app = express();
    app.use(express.json());
    app.get('/health', (_req, res) => res.json({status: 'ok'}));
    app.use('/api/v1/auth', authRouter(new AuthService(new PostgresAuthRepository(pool))));

    const organizationService = new OrganizationService(new PostgresOrganizationRepository(pool));
    app.use('/api/v1/organizations', authenticate, requirePermission('organization.manage'), organizationRouter(organizationService));
    app.use('/api/v1/access', authenticate, requirePermission('access.manage'), accessRouter(new AccessService(new PostgresAccessRepository(pool))));
    app.use('/api/v1/doa-rules', authenticate, requirePermission('doa.manage'), doaRouter(new DoaService(new PostgresDoaRepository(pool))));

    const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
        if (error?.name === 'ZodError') return res.status(400).json({
            error: 'Validation failed',
            details: error.issues
        });
        if (error?.code === '23505') return res.status(409).json({error: 'A record with the same unique value already exists'});
        if (error?.statusCode) return res.status(error.statusCode).json({error: error.message});
        if (error?.message === 'Organization not found') return res.status(404).json({error: error.message});
        console.error(error);
        return res.status(500).json({error: 'Internal server error'});
    };
    app.use(errorHandler);
    return app;
};
