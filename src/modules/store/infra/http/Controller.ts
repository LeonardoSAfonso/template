import { Request, Response } from 'express';
import { Store } from '@prisma/client';
import MailerProvider from '../../../../shared/providers/Mailer';
import MailTemplateProvider from '../../../../shared/providers/MailTemplate';
import RequestSupportService from '../../../RequestSupport';
import CreateStoreService from '../../services/Create';
import DeleteStoreservice from '../../services/Delete';
import FindOneStoreService from '../../services/FindOne';
import UpdateStoreService from '../../services/Update';
import StoreRepository from '../Repository';
import PaginationParams from '../../../../types/pagination.type';
import FindStoresService from '../../services/Find';

export default class StoreController {
  public async create(req: Request, res: Response): Promise<Response> {
    const storeRepository = new StoreRepository();

    const createStore = new CreateStoreService(storeRepository);

    const store = await createStore.execute({ ...req.body });

    return res.json(store);
  }

  public async find(req: Request, res: Response): Promise<Response> {
    const storeRepository = new StoreRepository();

    const { ordenation, limit, offset, orderBy, searchBy, searchFor } =
      req.query;

    const findStores = new FindStoresService(storeRepository);

    const stores = await findStores.execute(
      new PaginationParams<Store>(
        Number(offset),
        Number(limit),
        String(ordenation),
        String(orderBy) as keyof Store,
        String(searchBy),
        String(searchFor),
      ),
    );

    return res.json(stores);
  }

  public async findOne(req: Request, res: Response): Promise<Response> {
    const storeRepository = new StoreRepository();

    const findOneStore = new FindOneStoreService(storeRepository);

    const store = await findOneStore.execute(Number(req.params.id));

    return res.json(store);
  }

  public async support(req: Request, res: Response): Promise<Response> {
    const mailTemplateProvider = new MailTemplateProvider();
    const mailProvider = new MailerProvider(mailTemplateProvider);

    const { name, email, cellphone, details } = req.body;

    const requestSupport = new RequestSupportService(mailProvider);

    const store = await requestSupport.execute(name, email, cellphone, details);

    return res.json(store);
  }

  public async update(req: Request, res: Response): Promise<Response> {
    const { id, ...data } = req.body;

    const repo = new StoreRepository();
    const updateStore = new UpdateStoreService(repo);

    const store = await updateStore.execute(id, {
      ...data,
    });

    return res.json(store);
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const storeRepository = new StoreRepository();

    const deleteStore = new DeleteStoreservice(storeRepository);

    const store = await deleteStore.execute(Number(req.params.id));

    return res.json(store);
  }
}
