import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(userId: string, commentId: string) {
    return this.prisma.notification.create({
      data: { userId, commentId }
    });
  }

  async getUserNotifications(userId: string) {
  return this.prisma.notification.findMany({
    where: { userId },
    include: {
      comment: {
        include: {
          author: true, 
        },
      },
    },
    orderBy: { createdAt: 'desc' }
  });
}


 async markNotificationAsRead(id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markNotificationAsUnread(id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: false },
    });
  }
}
