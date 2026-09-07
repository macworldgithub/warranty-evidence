import type { MongooseModuleOptions } from '@nestjs/mongoose';

export function getDatabaseConfig(uri: string): MongooseModuleOptions {
  return {
    uri,
    autoIndex: true,
    autoCreate: true,
  };
}
