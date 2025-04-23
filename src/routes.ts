import { Router } from 'express';
import storeRouter from './modules/store/infra/http/Routes';
import userRouter from './modules/user/infra/http/Routes';
import sessionRouter from './modules/session/infra/http/Routes';

const routes = Router();

routes.use('/', storeRouter);
routes.use('/', userRouter);
routes.use('/', sessionRouter);

export default routes;
