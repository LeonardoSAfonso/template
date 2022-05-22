import { Request, Response } from 'express';
import BCryptHashProvider from '../../../../../shared/providers/hashProvider/implementations/BCryptHashProvider';
import MailerProvider from '../../../../../shared/providers/MailProvider/implementations/MailerProvider';
import HandlebarseMailTemplateProvider from '../../../../../shared/providers/MailTemplateProvider/implementations/HandlebarseMailTemplateProvider';
import ChangePasswordUserService from '../../../services/ChangeUserPassword';
import CheckUserEmailService from '../../../services/CheckUserEmailService';
import CreateUserPasswordService from '../../../services/CreateUserPasswordService';
import RequestResetUserPasswordService from '../../../services/RequestResetUserPasswordService';
import ResetUserPasswordService from '../../../services/ResetUserPasswordService';
import SessionUserService from '../../../services/SessionUserService';
import UserRepository from '../../database/repositories/UserRepository';

class SessionsController {
  public async create(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    const userRepository = new UserRepository();
    const hashProvider = new BCryptHashProvider();
    const authenticateUser = new SessionUserService(
      userRepository,
      hashProvider,
    );
    const auth = await authenticateUser.execute({
      email,
      password,
    });
    return res.json(auth);
  }

  public async change(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();
    const hashProvider = new BCryptHashProvider();

    const { oldPassword, newPassword } = req.body;
    const userId = Number(req.user.id);

    const changePassword = new ChangePasswordUserService(
      userRepository,
      hashProvider,
    );

    const user = await changePassword.execute(
      req.user.access_level,
      oldPassword,
      newPassword,
      userId,
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
    const hashRepository = new BCryptHashProvider();

    const { email, password } = req.body;

    const createPassword = new CreateUserPasswordService(
      userRepository,
      hashRepository,
    );

    const user = await createPassword.execute(email, password);

    return res.json(user);
  }

  public async reset(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();
    const hashProvider = new BCryptHashProvider();

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
    const template = new HandlebarseMailTemplateProvider();
    const mailProvider = new MailerProvider(template);

    const { email, link } = req.body;

    const requestReset = new RequestResetUserPasswordService(
      userRepository,
      mailProvider,
    );

    const user = await requestReset.execute(email, link);

    return res.json(user);
  }
}
export default SessionsController;
