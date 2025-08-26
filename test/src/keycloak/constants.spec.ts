import { ISSUER_CLIENT } from 'src/keycloak/constants';

describe('Constants', () => {
  it('should export ISSUER_CLIENT as a Symbol', () => {
    expect(typeof ISSUER_CLIENT).toBe('symbol');
    expect(ISSUER_CLIENT.toString()).toBe('Symbol(issuer_client)');
  });

  it('should have the correct Symbol value', () => {
    expect(ISSUER_CLIENT.description).toBe('issuer_client');
  });

  it('should be unique', () => {
    const anotherSymbol = Symbol('issuer_client');
    expect(ISSUER_CLIENT).not.toBe(anotherSymbol);
  });
});
