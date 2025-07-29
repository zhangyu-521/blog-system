// src/common/decorators/transform.decorator.ts
import { Transform } from 'class-transformer';

// 转换为数字
export const ToNumber = () =>
  Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? value : num;
  });

// 转换为布尔值
export const ToBoolean = () =>
  Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  });

// 转换为日期
export const ToDate = () =>
  Transform(({ value }) => {
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date;
    }
    return value;
  });

// 去除字符串两端空格
export const Trim = () =>
  Transform(({ value }) => {
    return typeof value === 'string' ? value.trim() : value;
  });

// 转换为小写
export const ToLowerCase = () =>
  Transform(({ value }) => {
    return typeof value === 'string' ? value.toLowerCase() : value;
  });

// 转换为大写
export const ToUpperCase = () =>
  Transform(({ value }) => {
    return typeof value === 'string' ? value.toUpperCase() : value;
  });
