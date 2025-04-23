interface ITemplateVariables {
  [key: string]: string | number | number[];
}

export default interface IParserMailTemplateDTO {
  file: string;
  variables: ITemplateVariables;
}
