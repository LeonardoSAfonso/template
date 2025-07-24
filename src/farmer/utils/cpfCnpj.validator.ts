// validators/is-cpf-or-cnpj.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { cpf, cnpj } from 'cpf-cnpj-validator';

export function IsCPFOrCNPJ(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCPFOrCNPJ',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return cpf.isValid(value) || cnpj.isValid(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} precisa ser um CPF/CNPJ valido`;
        },
      },
    });
  };
}
