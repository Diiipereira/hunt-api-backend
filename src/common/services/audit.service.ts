import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { AuditAction } from 'generated/prisma/client';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(
    action: AuditAction,
    userId?: string,
    ip?: string,
    userAgent?: string,
    metadata?: Record<string, any>,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          userId,
          ip,
          userAgent,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });
      this.logger.log(`Audit: ${action} by user ${userId || 'anonymous'}`);
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`);
    }
  }

  async getUserAuditLogs(userId: string, limit: number = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getRecentLogs(limit: number = 100) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            email: true,
          },
        },
      },
    });
  }
}
