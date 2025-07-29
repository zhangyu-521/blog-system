// src/common/utils/pagination.util.ts
export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage?: number;
  prevPage?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export class PaginationUtil {
  /**
   * 计算跳过的记录数
   */
  static getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * 创建分页元数据
   */
  static createMeta(
    total: number,
    page: number,
    limit: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : undefined,
      prevPage: hasPrevPage ? page - 1 : undefined,
    };
  }

  /**
   * 创建分页结果
   */
  static createResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResult<T> {
    return {
      data,
      meta: this.createMeta(total, page, limit),
    };
  }

  /**
   * 验证分页参数
   */
  static validatePagination(page: number, limit: number): void {
    if (page < 1) {
      throw new Error('页码必须大于0');
    }
    if (limit < 1) {
      throw new Error('每页数量必须大于0');
    }
    if (limit > 100) {
      throw new Error('每页数量不能超过100');
    }
  }
}
