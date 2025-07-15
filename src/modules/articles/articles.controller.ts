// src/modules/articles/articles.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { ArticleEntity } from './entities/article.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { UserEntity } from '../users/entities/user.entity';

@ApiTags('文章管理')
@Controller('articles')
@UseGuards(RolesGuard)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: '创建文章' })
  @ApiResponse({
    status: 201,
    description: '文章创建成功',
    type: ArticleEntity,
  })
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser('id') authorId: string,
  ): Promise<ArticleEntity> {
    return this.articlesService.create(createArticleDto, authorId);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: '获取文章列表' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ArticleEntity' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          },
        },
      },
    },
  })
  async findAll(@Query() queryDto: QueryArticleDto) {
    return this.articlesService.findAll(queryDto);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: '根据 slug 获取文章详情' })
  @ApiParam({ name: 'slug', description: '文章 slug' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: ArticleEntity,
  })
  @ApiResponse({ status: 404, description: '文章不存在' })
  async findBySlug(@Param('slug') slug: string): Promise<ArticleEntity> {
    const article = await this.articlesService.findBySlug(slug);
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    return article;
  }

  @Public()
  @Get('stats')
  @ApiOperation({ summary: '获取文章统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStats(@Query('authorId') authorId?: string) {
    return this.articlesService.getArticleStats(authorId);
  }

  @ApiBearerAuth()
  @Get('my')
  @ApiOperation({ summary: '获取当前用户的文章列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMyArticles(
    @CurrentUser('id') authorId: string,
    @Query() queryDto: QueryArticleDto,
  ) {
    return this.articlesService.findAll({ ...queryDto, authorId });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '根据ID获取文章详情' })
  @ApiParam({ name: 'id', description: '文章ID', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: ArticleEntity,
  })
  @ApiResponse({ status: 404, description: '文章不存在' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ArticleEntity> {
    const article = await this.articlesService.findById(id);
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    return article;
  }

  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: '更新文章' })
  @ApiParam({ name: 'id', description: '文章ID', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: ArticleEntity,
  })
  @ApiResponse({ status: 404, description: '文章不存在' })
  @ApiResponse({ status: 403, description: '无权编辑此文章' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<ArticleEntity> {
    return this.articlesService.update(id, updateArticleDto, currentUser);
  }

  @ApiBearerAuth()
  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '点赞文章' })
  @ApiParam({ name: 'id', description: '文章ID', format: 'uuid' })
  @ApiResponse({ status: 200, description: '点赞成功' })
  @ApiResponse({ status: 404, description: '文章不存在' })
  async toggleLike(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.toggleLike(id);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除文章' })
  @ApiParam({ name: 'id', description: '文章ID', format: 'uuid' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '文章不存在' })
  @ApiResponse({ status: 403, description: '无权删除此文章' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<void> {
    return this.articlesService.remove(id, currentUser);
  }
}
