import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { KeycloakSettings } from 'src/keycloak/keycloak-settings';

describe('KeycloakSettings', () => {
  let service: KeycloakSettings;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeycloakSettings,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<KeycloakSettings>(KeycloakSettings);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should configure all ConfigService properties', () => {
    const mockValues = {
      KC_AUTH_SERVER_URL: 'http://localhost:8080/auth',
      KC_REALM: 'template-name',
      KC_ADMIN: 'admin',
      KC_ADMIN_PASSWORD: 'admin123',
      KC_CLIENT_ID: 'api-client',
      KC_SECRET: 'client-secret',
      KC_REQUEST_TIMEOUT: 5000,
    };

    jest
      .spyOn(configService, 'get')
      .mockImplementation((key: string) => mockValues[key]);

    const newService = new KeycloakSettings(configService);

    expect(newService.url).toBe('http://localhost:8080/auth');
    expect(newService.realm).toBe('template-name');
    expect(newService.adminUser).toBe('admin');
    expect(newService.adminPassword).toBe('admin123');
    expect(newService.clientID).toBe('api-client');
    expect(newService.clientSecret).toBe('client-secret');
    expect(newService.requestTimeout).toBe(5000);
  });

  it('should call ConfigService.get for each property', () => {
    const expectedCalls = [
      'KC_AUTH_SERVER_URL',
      'KC_REALM',
      'KC_ADMIN',
      'KC_ADMIN_PASSWORD',
      'KC_CLIENT_ID',
      'KC_SECRET',
      'KC_REQUEST_TIMEOUT',
    ];

    jest.spyOn(configService, 'get').mockReturnValue('test-value');

    new KeycloakSettings(configService);

    expectedCalls.forEach((key) => {
      expect(configService.get).toHaveBeenCalledWith(key);
    });
  });

  it('should handle undefined values from ConfigService', () => {
    jest.spyOn(configService, 'get').mockReturnValue(undefined);

    const newService = new KeycloakSettings(configService);

    expect(newService.url).toBeUndefined();
    expect(newService.realm).toBeUndefined();
    expect(newService.adminUser).toBeUndefined();
    expect(newService.adminPassword).toBeUndefined();
    expect(newService.clientID).toBeUndefined();
    expect(newService.clientSecret).toBeUndefined();
    expect(newService.requestTimeout).toBeUndefined();
  });

  it('should handle mixed values from ConfigService', () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      const values: Record<string, any> = {
        KC_AUTH_SERVER_URL: 'http://keycloak:8080/auth',
        KC_REALM: 'test-realm',
        KC_ADMIN: undefined,
        KC_ADMIN_PASSWORD: 'password123',
        KC_CLIENT_ID: 'test-client',
        KC_SECRET: undefined,
        KC_REQUEST_TIMEOUT: 3000,
      };
      return values[key];
    });

    const newService = new KeycloakSettings(configService);

    expect(newService.url).toBe('http://keycloak:8080/auth');
    expect(newService.realm).toBe('test-realm');
    expect(newService.adminUser).toBeUndefined();
    expect(newService.adminPassword).toBe('password123');
    expect(newService.clientID).toBe('test-client');
    expect(newService.clientSecret).toBeUndefined();
    expect(newService.requestTimeout).toBe(3000);
  });

  it('should handle numeric values from ConfigService', () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      const values: Record<string, any> = {
        KC_AUTH_SERVER_URL: 'http://localhost:8080/auth',
        KC_REALM: 'template-name',
        KC_ADMIN: 'admin',
        KC_ADMIN_PASSWORD: 'admin123',
        KC_CLIENT_ID: 'api-client',
        KC_SECRET: 'client-secret',
        KC_REQUEST_TIMEOUT: 10000,
      };
      return values[key];
    });

    const newService = new KeycloakSettings(configService);

    expect(newService.requestTimeout).toBe(10000);
    expect(typeof newService.requestTimeout).toBe('number');
  });

  it('should handle string values from ConfigService', () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      const values: Record<string, any> = {
        KC_AUTH_SERVER_URL: 'https://keycloak.example.com/auth',
        KC_REALM: 'production-realm',
        KC_ADMIN: 'super-admin',
        KC_ADMIN_PASSWORD: 'super-secure-password',
        KC_CLIENT_ID: 'production-client',
        KC_SECRET: 'production-secret',
        KC_REQUEST_TIMEOUT: 5000,
      };
      return values[key];
    });

    const newService = new KeycloakSettings(configService);

    expect(newService.url).toBe('https://keycloak.example.com/auth');
    expect(newService.realm).toBe('production-realm');
    expect(newService.adminUser).toBe('super-admin');
    expect(newService.adminPassword).toBe('super-secure-password');
    expect(newService.clientID).toBe('production-client');
    expect(newService.clientSecret).toBe('production-secret');
  });
});
