import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    AuthModule,
    CommentsModule,
    NotificationsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
