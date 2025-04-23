import fs from 'fs';
import handlebars from 'handlebars';
import IParserMailTemplateDTO from './dtos/IParserMailTemplate';

export default class MailTemplateProvider {
  public async parse({
    file,
    variables,
  }: IParserMailTemplateDTO): Promise<string> {
    const templateFileContent = await fs.promises.readFile(file, {
      encoding: 'utf-8',
    });

    const parseTemplate = handlebars.compile(templateFileContent);

    return parseTemplate(variables);
  }
}
