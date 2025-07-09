// src/comments/comments.controller.ts
import { Controller, Post, Body, UseGuards, Req, Get, Patch, Param, Delete } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('comments')
@UseGuards(AuthGuard('jwt'))
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() body: { content: string; parentId?: string }, @Req() req: Request) {
    return this.commentsService.create(body.content, req.user, body.parentId);
  }

  @Get()
  findAll() {
    return this.commentsService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('content') content: string, @Req() req: Request) {
    return this.commentsService.update(id, content, req.user);
  }

@Delete(':id')
delete(@Param('id') id: string, @Req() req) {
  return this.commentsService.delete(id, req.user);
}

@Patch(':id/restore')
restore(@Param('id') id: string, @Req() req) {
  return this.commentsService.restore(id, req.user);
}
}
