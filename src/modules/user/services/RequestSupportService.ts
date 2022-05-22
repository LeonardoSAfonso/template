import path from 'path';
import AppError from '../../../shared/errors/AppError';
import IMailProvider from '../../../shared/providers/MailProvider/model/IMailProvider';

export default class RequestSupportService {
  private mailProvider: IMailProvider;

  constructor(mailprovider: IMailProvider) {
    this.mailProvider = mailprovider;
  }

  public async execute(
    clientName: string,
    storeEmail: string,
    storePhone: string,
    emailBody: string,
  ): Promise<string> {
    const requestResetsTemplate = path.resolve(
      __dirname,
      '..',
      'templates',
      'request_support.hbs',
    );

    await this.mailProvider
      .sendMail({
        to: {
          name: 'XMLiser',
          email: 'suporte@xmliser.com.br',
        },
        subject: 'Solicitação de Suporte',
        templateData: {
          variables: {
            clientName,
            storeEmail,
            storePhone,
            emailBody,
          },
          file: requestResetsTemplate,
        },
      })
      .catch(err => {
        throw new AppError(err, 409);
      });

    return 'Solicitação de suport enviada com sucesso';
  }
}
