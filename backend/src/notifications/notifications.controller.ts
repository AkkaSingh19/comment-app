import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  async getNotifications(@Req() req: Request): Promise<any[]> {
    const user = req.user as any;
    return this.service.getUserNotifications(user.userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.service.markNotificationAsRead(id);
  }

  @Patch(':id/unread')
  async markAsUnread(@Param('id') id: string) {
    return this.service.markNotificationAsUnread(id);
  }
}
