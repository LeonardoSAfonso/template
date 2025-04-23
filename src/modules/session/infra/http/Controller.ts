import { Request, Response } from 'express';
import HashProvider from '../../../../shared/providers/Hash';
import MailerProvider from '../../../../shared/providers/Mailer';
import MailTemplateProvider from '../../../../shared/providers/MailTemplate';
import AuthenticateUserService from '../../services/AuthenticateUser';
import ChangePasswordUserService from '../../services/ChangeUserPassword';
import CheckUserEmailService from '../../services/CheckUserEmail';
import CreateUserPasswordService from '../../services/CreateUserPassword';
import RequestResetUserPasswordService from '../../services/RequestResetUserPassword';
import ResetUserPasswordService from '../../services/ResetUserPassword';
import UserRepository from '../../../user/infra/Repository';

export default class SessionController {
  public async create(req: Request, res: Response): Promise<Response> {
    const { email, password, storeId } = req.body;

    const userRepository = new UserRepository();
    const hashProvider = new HashProvider();
    const authenticateUser = new AuthenticateUserService(
      userRepository,
      hashProvider,
    );
    const auth = await authenticateUser.execute(
      {
        email,
        password,
      },
      storeId,
    );
    return res.json(auth);
  }

  public async change(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();
    const hashProvider = new HashProvider();

    const { oldPassword, newPassword } = req.body;

    const changePassword = new ChangePasswordUserService(
      userRepository,
      hashProvider,
    );

    const user = await changePassword.execute(
      oldPassword,
      newPassword,
      Number(req.user.id),
    );

    return res.json(user);
  }

  public async checkEmail(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();

    const { email } = req.query;

    const resetPassword = new CheckUserEmailService(userRepository);

    const user = await resetPassword.execute(String(email));

    return res.json(user);
  }

  public async createPassword(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();
    const hashRepository = new HashProvider();

    const { email, password, storeId } = req.body;

    const createPassword = new CreateUserPasswordService(
      userRepository,
      hashRepository,
    );

    const user = await createPassword.execute(email, password, storeId);

    return res.json(user);
  }

  public async reset(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();
    const hashProvider = new HashProvider();

    const { password } = req.body;

    const { token } = req.query;

    const resetPassword = new ResetUserPasswordService(
      userRepository,
      hashProvider,
    );

    const user = await resetPassword.execute(String(token), password);

    return res.json(user);
  }

  public async requestReset(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();
    const template = new MailTemplateProvider();
    const mailProvider = new MailerProvider(template);

    const { email, link, storeId } = req.body;

    const requestReset = new RequestResetUserPasswordService(
      userRepository,
      mailProvider,
    );

    const user = await requestReset.execute(email, storeId, link);

    return res.json(user);
  }
}
