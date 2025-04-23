import IParserMailTemplateDTO from './IParserMailTemplate';

interface IMailContact {
  name: string;
  email: string;
}

export default interface ISendMailDTO {
  to: IMailContact;
  from?: IMailContact;
  subject: string;
  templateData: IParserMailTemplateDTO;
  pdfFile?: [
    {
      filename: string;
      content: string;
      encoding: string;
    },
  ];
}
