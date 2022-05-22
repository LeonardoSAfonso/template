const user = process.env.SMPT_USER;
const pass = process.env.SMPT_PASSWORD;

const emailConfig = {
  host: 'smtp-mail.outlook.com',
  service: 'outlook',
  port: 587,
  secure: false,
  tls: {
    ciphers: 'SSLv3',
  },
  auth: {
    user,
    pass,
  },
};

export default emailConfig;
