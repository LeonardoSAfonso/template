import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import SessionController from '../controllers/SessionController';
import Auth from '../../../../../shared/middleware/Auth';

const sessionsRouter = Router();

const sessionsController = new SessionController();

sessionsRouter.post(
  '/authenticate',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  }),
  sessionsController.create,
);

sessionsRouter.post(
  '/create-password',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().required(),
      password: Joi.string().required(),
    },
  }),
  sessionsController.createPassword,
);

sessionsRouter.post(
  '/change-password',
  celebrate({
    [Segments.BODY]: {
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
    },
  }),
  Auth,
  sessionsController.change,
);

sessionsRouter.post(
  '/check-email',
  celebrate({
    [Segments.QUERY]: {
      email: Joi.string().required(),
    },
  }),
  sessionsController.checkEmail,
);

sessionsRouter.post(
  '/reset-password',
  celebrate({
    [Segments.BODY]: {
      password: Joi.string().required(),
    },
    [Segments.QUERY]: {
      token: Joi.string().required(),
    },
  }),
  sessionsController.reset,
);

sessionsRouter.post(
  '/request-reset-password',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().required(),
      link: Joi.string().required(),
    },
  }),
  sessionsController.requestReset,
);

export default sessionsRouter;
