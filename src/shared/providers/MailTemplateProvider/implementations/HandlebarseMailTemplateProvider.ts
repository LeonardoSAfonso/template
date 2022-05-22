import fs from 'fs';
import handlebars from 'handlebars';

import IParserMailTemplateDTO from '../dtos/IParserMailTemplateDTO';
import IMailTemplateProvider from '../models/IMailTemplateProvider';

class HandlebarseMailTemplateProvider implements IMailTemplateProvider {
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
export default HandlebarseMailTemplateProvider;
