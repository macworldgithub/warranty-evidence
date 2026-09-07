import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  port: parseInt(process.env['PORT'] ?? '4000', 10),
  frontendAdminUrl: process.env['FRONTEND_ADMIN_URL'] ?? 'http://localhost:3000',
  frontendOperationsUrl: process.env['FRONTEND_OPERATIONS_URL'] ?? 'http://localhost:3001',
}));
