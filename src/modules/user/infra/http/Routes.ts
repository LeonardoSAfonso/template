import { User } from '@prisma/client';
import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import { keys } from 'ts-transformer-keys';
import Admin from '../../../../shared/middleware/Admin';
import UserController from './Controller';
import Auth from '../../../../shared/middleware/Auth';

const userRouter = Router();

const userController = new UserController();

/* 
  Melhorar fluxo de criação de usuário
    criação admin e standalone
      envio de definição de senha
*/
userRouter.post(
  '/user',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string()
        .email({
          minDomainSegments: 2,
        })
        .required(),
      password: Joi.string().required(),
      storeId: Joi.number().integer().required(),
    },
  }),
  userController.create,
);

userRouter.get(
  '/users',
  celebrate({
    [Segments.QUERY]: {
      limit: Joi.number().integer().allow('', null),
      offset: Joi.number().integer().allow('', null),
      ordenation: Joi.string().allow('asc', 'desc', '', null),
      orderBy: Joi.string().allow(...keys<User>(), '', null),
      searchBy: Joi.string().allow('', null),
      searchFor: Joi.string().allow('', null),
    },
  }),
  Auth,
  userController.find,
);

userRouter.get(
  '/user/:id',
  celebrate({ [Segments.PARAMS]: { id: Joi.number().integer().required() } }),
  Auth,
  userController.findOne,
);

userRouter.put(
  '/user',
  celebrate({
    [Segments.BODY]: {
      id: Joi.string().required(),
      name: Joi.string().allow('', null),
      email: Joi.string()
        .email({
          minDomainSegments: 2,
        })
        .allow('', null),
      password: Joi.string().allow('', null),
      storeId: Joi.number().integer().allow('', null),
    },
  }),
  Auth,
  userController.update,
);

userRouter.delete(
  '/user/:id',
  celebrate({ [Segments.PARAMS]: { id: Joi.number().integer().required() } }),
  Admin,
  userController.delete,
);

export default userRouter;
