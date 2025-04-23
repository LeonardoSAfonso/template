import nodemailer, { Transporter } from 'nodemailer';

import emailConfig from '../../config/Email';
import ISendMailDTO from './dtos/ISendMail';
import MailTemplateProvider from './MailTemplate';

export default class MailerProvider {
  private client: Transporter;

  private mailTemplateProvider: MailTemplateProvider;

  constructor(mailTemplateProvider: MailTemplateProvider) {
    this.mailTemplateProvider = mailTemplateProvider;

    const transporter = nodemailer.createTransport(emailConfig);

    this.client = transporter;
  }

  public async sendMail({
    to,
    from,
    subject,
    templateData,
    pdfFile,
  }: ISendMailDTO): Promise<void> {
    await this.client.sendMail({
      from: {
        name: from?.name || 'Default',
        address: from?.email || 'Default',
      },
      to: { name: to.name, address: to.email },
      subject,
      html: await this.mailTemplateProvider.parse(templateData),
      attachments: pdfFile,
    });
  }
}
