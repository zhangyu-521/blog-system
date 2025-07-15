import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Patch,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CommentStatus, UserRole } from '@prisma/client';
import { UserEntity } from '../users/entities/user.entity';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('评论')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentService: CommentsService) {}

  @ApiOperation({ summary: '创建评论' })
  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ) {
    console.log(req.user);
    const user = req.user as { id: string };
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.commentService.create(
      createCommentDto,
      user.id,
      ipAddress,
      userAgent,
    );
  }

  @ApiOperation({ summary: '获取文章评论' })
  @Get('article/:articleId')
  async findByArticle(
    @Param('articleId') articleId: string,
    @Query() query: QueryCommentDto,
  ) {
    return this.commentService.findByArticle(articleId, query);
  }

  @ApiOperation({ summary: '更新评论状态' })
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    return this.commentService.updateStatus(id, status as CommentStatus, user);
  }

  @ApiOperation({ summary: '删除评论' })
  @Delete(':id')
  @ApiBearerAuth()
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as UserEntity;
    return this.commentService.remove(id, user);
  }
}
