import { Module, Logger, type DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './database.config.js';

const logger = new Logger('DatabaseModule');

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const mongodbUri = process.env['MONGODB_URI'];

    if (!mongodbUri) {
      logger.warn(
        '⚠️  MONGODB_URI is not configured. Database features will not be available. ' +
        'Set MONGODB_URI in your .env file to connect to MongoDB.',
      );

      return {
        module: DatabaseModule,
        imports: [],
      };
    }

    return {
      module: DatabaseModule,
      imports: [
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => {
            const uri = configService.get<string>('MONGODB_URI', '');
            logger.log('📦 Connecting to MongoDB...');
            return getDatabaseConfig(uri);
          },
          inject: [ConfigService],
        }),
      ],
    };
  }
}
