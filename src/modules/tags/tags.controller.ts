import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { QueryTagDto } from './dto/query-tag.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Tag } from './entities/tag.entity';

@ApiTags('标签管理')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: '创建标签' })
  @ApiResponse({ status: 201, type: Tag })
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: '获取标签列表' })
  @ApiResponse({ status: 200, type: [Tag] })
  findAll(@Query() query: QueryTagDto) {
    return this.tagsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取标签详情' })
  @ApiResponse({ status: 200, type: Tag })
  findOne(@Param('id') id: string) {
    return this.tagsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新标签' })
  @ApiResponse({ status: 200, type: Tag })
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除标签' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
