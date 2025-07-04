// src/config/configuration.ts
export default () => ({
  // 应用配置
  app: {
    name: process.env.APP_NAME || 'Blog System',
    port: parseInt(process.env.PORT, 10) || 3000,
    environment: process.env.NODE_ENV || 'development',
  },

  // 数据库配置
  database: {
    url: process.env.DATABASE_URL,
  },

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // 限流配置
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10,
  },

  // 缓存配置
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 300,
    max: parseInt(process.env.CACHE_MAX, 10) || 100,
  },

  // CORS 配置
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Swagger 配置
  swagger: {
    title: process.env.SWAGGER_TITLE || 'API Documentation',
    description: process.env.SWAGGER_DESCRIPTION || 'API Documentation',
    version: process.env.SWAGGER_VERSION || '1.0',
    path: process.env.SWAGGER_PATH || 'api-docs',
  },

  // 文件上传配置
  upload: {
    maxFileSize:
      parseInt(process.env.UPLOAD_MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,
    allowedMimeTypes: process.env.UPLOAD_ALLOWED_MIME_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    destination: process.env.UPLOAD_DEST || './uploads',
  },

  // 邮件配置
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
  },
});
