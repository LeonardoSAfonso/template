import { Request, Response } from 'express';
import { User } from '@prisma/client';
import MailerProvider from '../../../../shared/providers/Mailer';
import MailTemplateProvider from '../../../../shared/providers/MailTemplate';
import RequestSupportService from '../../../RequestSupport';
import CreateUserService from '../../services/Create';
import DeleteUserservice from '../../services/Delete';
import FindOneUserService from '../../services/FindOne';
import UpdateUserService from '../../services/Update';
import UserRepository from '../Repository';
import PaginationParams from '../../../../types/pagination.type';
import FindUsersService from '../../services/Find';
import HashProvider from '../../../../shared/providers/Hash';

export default class UserController {
  public async create(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();
    const mailTemplateProvider = new MailTemplateProvider();
    const mailProvider = new MailerProvider(mailTemplateProvider);
    const hashProvider = new HashProvider();

    const createUser = new CreateUserService(
      userRepository,
      hashProvider,
      mailProvider,
    );

    const user = await createUser.execute({ ...req.body }, req.user);

    return res.json(user);
  }

  public async find(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();

    const { ordenation, limit, offset, orderBy, searchBy, searchFor } =
      req.query;

    const findUsers = new FindUsersService(userRepository);

    const users = await findUsers.execute(
      new PaginationParams<User>(
        Number(offset),
        Number(limit),
        String(ordenation),
        String(orderBy) as keyof User,
        String(searchBy),
        String(searchFor),
      ),
      req.user,
    );

    return res.json(users);
  }

  public async findOne(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();

    const findOneUser = new FindOneUserService(userRepository);

    const user = await findOneUser.execute(Number(req.params.id));

    return res.json(user);
  }

  public async support(req: Request, res: Response): Promise<Response> {
    const mailTemplateProvider = new MailTemplateProvider();
    const mailProvider = new MailerProvider(mailTemplateProvider);

    const { name, email, cellphone, details } = req.body;

    const requestSupport = new RequestSupportService(mailProvider);

    const user = await requestSupport.execute(name, email, cellphone, details);

    return res.json(user);
  }

  public async update(req: Request, res: Response): Promise<Response> {
    const { id, ...data } = req.body;

    const repo = new UserRepository();
    const updateUser = new UpdateUserService(repo);

    const user = await updateUser.execute(
      id,
      {
        ...data,
      },
      req.user,
    );

    return res.json(user);
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();

    const deleteUser = new DeleteUserservice(userRepository);

    const user = await deleteUser.execute(Number(req.params.id), req.user);

    return res.json(user);
  }
}
