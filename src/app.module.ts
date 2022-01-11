import { Module } from '@nestjs/common';
import { DeptsModule } from './departments/depts.module';

@Module({
  imports: [DeptsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
