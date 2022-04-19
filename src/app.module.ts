import { PlansModule } from './plans/plans.module';
import { KpiTemplatesModule } from './kpiTemplates/kpiTemplates.module';
import { KpiCategoriesModule } from './kpiCategories/kpiCategories.module';
import { DatabaseModule } from './database/database.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { DeptsModule } from './departments/depts.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { AuthenticationModule } from './authentication/authentication.module';
import { UsersModule } from './users/users.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { ChartsModule } from './charts/charts.module';
import { NotifsModule } from './notifications/notifs.module';
import LogsMiddleware from './utils/logs.middleware';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    DeptsModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_PUBLIC_BUCKET_NAME: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    AuthenticationModule,
    UsersModule,
    KpiCategoriesModule,
    KpiTemplatesModule,
    PlansModule,
    DashboardsModule,
    ChartsModule,
    NotifsModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*');
  }
}
