import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import SessionController from './Controller';
import Auth from '../../../../shared/middleware/Auth';

const sessionRouter = Router();

const sessionsController = new SessionController();

sessionRouter.post(
  '/authenticate',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string()
        .email({
          minDomainSegments: 2,
        })
        .required(),
      password: Joi.string().required(),
      storeId: Joi.number().integer().required(),
    },
  }),
  sessionsController.create,
);

sessionRouter.post(
  '/create-password',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string()
        .email({
          minDomainSegments: 2,
        })
        .required(),
      password: Joi.string().required(),
      storeId: Joi.number().integer().required(),
    },
  }),
  sessionsController.createPassword,
);

sessionRouter.post(
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

sessionRouter.post(
  '/check-email',
  celebrate({
    [Segments.QUERY]: {
      email: Joi.string()
        .email({
          minDomainSegments: 2,
        })
        .required(),
    },
  }),
  sessionsController.checkEmail,
);

sessionRouter.post(
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

sessionRouter.post(
  '/request-reset-password',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string()
        .email({
          minDomainSegments: 2,
        })
        .required(),
      link: Joi.string().required(),
      storeId: Joi.number().integer().required(),
    },
  }),
  sessionsController.requestReset,
);

export default sessionRouter;
