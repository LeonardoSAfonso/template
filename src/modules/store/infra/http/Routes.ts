import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import Admin from '../../../../shared/middleware/Admin';
import StoreController from './Controller';

const storeRouter = Router();

const storeController = new StoreController();

storeRouter.post(
  '/store',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string()
        .email({
          minDomainSegments: 2,
        })
        .required(),
      identification: Joi.string().min(11).max(18).required(),
      external_id: Joi.string().allow(''),
    },
  }),
  Admin,
  storeController.create,
);

storeRouter.get(
  '/stores',
  celebrate({
    [Segments.QUERY]: {
      limit: Joi.number().integer().allow('', null),
      offset: Joi.number().integer().allow('', null),
      ordenation: Joi.string().allow('asc', 'desc', '', null),
      orderBy: Joi.string().allow('name', 'email', '', null),
      searchBy: Joi.string().allow('name', 'email', 'identification', '', null),
      searchFor: Joi.string().allow('', null),
    },
  }),
  Admin,
  storeController.find,
);

storeRouter.get(
  '/store/:id',
  celebrate({ [Segments.PARAMS]: { id: Joi.number().integer().required() } }),
  Admin,
  storeController.findOne,
);

storeRouter.post(
  '/support',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string().required(),
      cellphone: Joi.string().allow(''),
      details: Joi.string().required(),
    },
  }),
  storeController.support,
);

storeRouter.put(
  '/store',
  celebrate({
    [Segments.BODY]: {
      id: Joi.number().integer().required(),
      name: Joi.string().allow('', null),
      email: Joi.string()
        .email({
          minDomainSegments: 2,
        })
        .allow('', null),
      identification: Joi.string().min(11).max(18).allow('', null),
      external_id: Joi.string().allow('', null),
    },
  }),
  Admin,
  storeController.update,
);

storeRouter.delete(
  '/store/:id',
  celebrate({ [Segments.PARAMS]: { id: Joi.number().integer().required() } }),
  Admin,
  storeController.delete,
);

export default storeRouter;
