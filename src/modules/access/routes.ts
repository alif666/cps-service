import { Router } from 'express';
import { AccessService } from './service';

const asyncRoute = (handler: (req: any, res: any) => Promise<unknown>) => async (req: any, res: any, next: any) => { try { res.json({ data: await handler(req, res) }); } catch (error) { next(error); } };

export const accessRouter = (service: AccessService): Router => {
  const router = Router();
  router.get('/business-units', asyncRoute((req) => service.listBusinessUnits(req.query.companyId)));
  router.post('/business-units', asyncRoute((req) => service.createBusinessUnit(req.body)));
  router.get('/departments', asyncRoute((req) => service.listDepartments(req.query.businessUnitId)));
  router.post('/departments', asyncRoute((req) => service.createDepartment(req.body)));
  router.get('/stores', asyncRoute((req) => service.listStores(req.query.companyId)));
  router.post('/stores', asyncRoute((req) => service.createStore(req.body)));
  router.get('/roles', asyncRoute((_,) => service.listRoles()));
  router.post('/roles', asyncRoute((req) => service.createRole(req.body)));
  router.get('/permissions', asyncRoute((_,) => service.listPermissions()));
  router.post('/permissions', asyncRoute((req) => service.createPermission(req.body)));
  router.get('/users', asyncRoute((_,) => service.listUsers()));
  router.post('/users', asyncRoute((req) => service.createUser(req.body)));
  router.post('/user-assignments', asyncRoute((req) => service.createAssignment(req.body)));
  return router;
};
