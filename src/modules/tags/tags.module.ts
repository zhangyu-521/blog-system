import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';

@Module({
  imports: [PrismaModule],
  providers: [TagsService],
  controllers: [TagsController],
  exports: [TagsService],
})
export class TagsModule {}
