import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import UserController from '../controllers/UserController';
import Auth from '../../../../../shared/middleware/Auth';
import Admin from '../../../../../shared/middleware/Admin';

const userRouter = Router();

const userController = new UserController();

userRouter.post(
  '/user',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ['com', 'net', 'br'] },
        })
        .required(),
      password: Joi.string().allow(''),
      access_level: Joi.number().integer(),
      appName: Joi.string().allow(''),
      link: Joi.string().allow(''),
    },
  }),
  Auth,
  Admin,
  userController.create,
);

userRouter.get(
  '/users',
  celebrate({
    [Segments.QUERY]: {
      search: Joi.string().allow(),
      offset: Joi.number().integer().required(),
      limit: Joi.number().integer().required(),
    },
  }),
  Auth,
  Admin,
  userController.findAll,
);

userRouter.get('/user', Auth, userController.findOne);

userRouter.post(
  '/support',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string().required(),
      cellphone: Joi.string().allow(''),
      details: Joi.string().required(),
    },
  }),
  Auth,
  userController.support,
);

userRouter.put(
  '/user',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().allow(''),
      email: Joi.string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ['com', 'net', 'br'] },
        })
        .allow(''),
      access_level: Joi.number().integer().allow(''),
    },
  }),
  Auth,
  userController.update,
);

userRouter.delete(
  '/user/:id',
  celebrate({ [Segments.PARAMS]: { id: Joi.number().integer().required() } }),
  Auth,
  Admin,
  userController.delete,
);

export default userRouter;
