import { Request, Response } from 'express';
import BCryptHashProvider from '../../../../../shared/providers/hashProvider/implementations/BCryptHashProvider';
import MailerProvider from '../../../../../shared/providers/MailProvider/implementations/MailerProvider';
import HandlebarseMailTemplateProvider from '../../../../../shared/providers/MailTemplateProvider/implementations/HandlebarseMailTemplateProvider';
import DiskStorageProvider from '../../../../../shared/providers/storageProvider/implementations/DiskStorageProvider';
import CreateUserService from '../../../services/CreateUserService';
import DeleteUserservice from '../../../services/DeleteUserService';
import FindAllUsersService from '../../../services/FindAllUsersService';
import FindOneUserService from '../../../services/FindOneUserService';
import FindUsersService from '../../../services/FindUsersService';
import RequestSupportService from '../../../services/RequestSupportService';
import UpdateUserService from '../../../services/UpdateUserService';
import UserRepository from '../../database/repositories/UserRepository';

export default class UserController {
  public async create(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();
    const mailTemplateProvider = new HandlebarseMailTemplateProvider();
    const mailProvider = new MailerProvider(mailTemplateProvider);
    const hashProvider = new BCryptHashProvider();

    const { name, email, password, access_level, appName, link } = req.body;

    const createUser = new CreateUserService(
      userRepository,
      hashProvider,
      mailProvider,
    );

    const user = await createUser.execute(
      {
        name,
        email,
        password,
        access_level,
      },
      appName,
      link,
    );

    return res.json(user);
  }

  public async findAll(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();

    const { offset, limit, search } = req.query;

    if (search) {
      const findUsers = new FindUsersService(userRepository);
      const users = await findUsers.execute(
        req.user.access_level,
        String(search),
        Number(offset),
        Number(limit),
      );

      return res.json(users);
    }

    const findAllUsers = new FindAllUsersService(userRepository);

    const users = await findAllUsers.execute(
      req.user.access_level,
      Number(offset),
      Number(limit),
    );

    return res.json(users);
  }

  public async findOne(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();

    const { id } = req.user;

    const findOneUser = new FindOneUserService(userRepository);

    const user = await findOneUser.execute(Number(id), req.user.access_level);

    return res.json(user);
  }

  public async support(req: Request, res: Response): Promise<Response> {
    const mailTemplateProvider = new HandlebarseMailTemplateProvider();
    const mailProvider = new MailerProvider(mailTemplateProvider);

    const { name, email, cellphone, details } = req.body;

    const requestSupport = new RequestSupportService(mailProvider);

    const user = await requestSupport.execute(name, email, cellphone, details);

    return res.json(user);
  }

  public async update(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();

    const { name, email, access_level } = req.body;

    const updateUser = new UpdateUserService(userRepository);

    const user = await updateUser.execute(
      req.user.id,
      {
        name,
        email,
        access_level,
      },
      req.user.access_level,
    );

    return res.json(user);
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();
    const storageProvider = new DiskStorageProvider();

    const { id } = req.params;

    const deleteUser = new DeleteUserservice(userRepository, storageProvider);

    const user = await deleteUser.execute(Number(id), req.user.access_level);

    return res.json(user);
  }
}
