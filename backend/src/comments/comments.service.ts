import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtPayload } from '../auth/jwt.strategy';
import { Comment } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(content: string, user: JwtPayload, parentId?: string): Promise<Comment> {
    const newComment = await this.prisma.comment.create({
      data: {
        content,
        authorId: user.userId,
        parentId,
      },
    });

    if (parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (parent && parent.authorId !== user.userId) {
        await this.notificationsService.createNotification(
          parent.authorId,
          newComment.id,
        );
      }
    }

    return newComment;
  }

  async findAll(): Promise<any[]> {
    const comments = await this.prisma.comment.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const commentMap = new Map<string, any>();

    // Map each comment by ID and add empty replies array
    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    const roots: any[] = [];

    // nested replies
    commentMap.forEach((comment) => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        roots.push(comment);
      }
    });

    return roots;
  }

  async update(id: string, content: string, user: JwtPayload): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) throw new NotFoundException();
    if (comment.authorId !== user.userId) throw new ForbiddenException();

    const now = new Date();
    const isWithinEditTime =
      now.getTime() <= comment.createdAt.getTime() + 15 * 60 * 1000;

    if (!isWithinEditTime) {
      throw new ForbiddenException('Edit time expired');
    }

    return this.prisma.comment.update({
      where: { id },
      data: { content },
    });
  }

  async delete(id: string, user: JwtPayload): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) throw new NotFoundException();
    if (comment.authorId !== user.userId) throw new ForbiddenException();

    return this.prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string, user: JwtPayload): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment || !comment.deletedAt) throw new NotFoundException();
    if (comment.authorId !== user.userId) throw new ForbiddenException();

    const now = new Date();
    const isWithinRestoreTime =
      now.getTime() <= comment.deletedAt.getTime() + 15 * 60 * 1000;

    if (!isWithinRestoreTime) {
      throw new BadRequestException('Restore time expired');
    }

    return this.prisma.comment.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
