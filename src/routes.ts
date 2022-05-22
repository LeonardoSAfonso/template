import { Router } from 'express';
import userRouter from './modules/user/infra/http/routes/User.routes';

const routes = Router();

routes.use('/', userRouter);

export default routes;
