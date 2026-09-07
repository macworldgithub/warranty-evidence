import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      success: true,
      message: 'Booran API is running',
      timestamp: new Date().toISOString(),
    };
  }
}
