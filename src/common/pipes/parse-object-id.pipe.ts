// src/common/pipes/parse-object-id.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isString } from 'class-validator';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value) {
      throw new BadRequestException('ID不能为空');
    }

    if (!isString(value)) {
      throw new BadRequestException('无效的ID格式');
    }

    return value;
  }
}
