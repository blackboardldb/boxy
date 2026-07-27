// Health Check System
// Provides comprehensive health monitoring for the Prisma-backed system

import { prisma } from "../prisma";
import { logger, LogContext } from "./logger";
import { performanceMonitor } from "./performance-monitor";

export interface HealthCheckResult {
  name: string;
  status: "healthy" | "unhealthy" | "degraded";
  message: string;
  duration: number;
  timestamp: string;
  details?: Record<string, any>;
}

export interface SystemHealthReport {
  overall: "healthy" | "unhealthy" | "degraded";
  provider: "prisma"; // ÚNICO provider real desde siempre — provider-factory eliminado en Bloque 1
  checks: HealthCheckResult[];
  summary: {
    healthy: number;
    unhealthy: number;
    degraded: number;
    total: number;
  };
  generatedAt: string;
  uptime: number;
}

export class HealthChecker {
  private static instance: HealthChecker;
  private startTime: number;
  private lastHealthCheck: SystemHealthReport | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startTime = Date.now();
    this.startPeriodicHealthChecks();
  }

  static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker();
    }
    return HealthChecker.instance;
  }

  async performHealthCheck(): Promise<SystemHealthReport> {
    const startTime = Date.now();
    const checks: HealthCheckResult[] = [];

    logger.info("Starting system health check");

    try {
      checks.push(await this.checkDatabaseConnectivity());
      checks.push(await this.checkCoreQueries());
      checks.push(await this.checkPerformanceMetrics());
      checks.push(await this.checkMemoryUsage());
      checks.push(await this.checkCacheFunctionality());
    } catch (error) {
      logger.error(
        "Health check failed",
        { operation: "healthCheck" },
        error as Error
      );

      checks.push({
        name: "health_check_system",
        status: "unhealthy",
        message: `Health check system failed: ${(error as Error).message}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
    }

    const summary = this.calculateHealthSummary(checks);
    const overall = this.determineOverallHealth(summary);

    const report: SystemHealthReport = {
      overall,
      provider: "prisma",
      checks,
      summary,
      generatedAt: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
    };

    this.lastHealthCheck = report;

    logger.info("Health check completed", {
      operation: "healthCheck",
      overall,
      duration: Date.now() - startTime,
      checksCount: checks.length,
    });

    return report;
  }

  // Chequeo de conectividad directa a la base de datos
  private async checkDatabaseConnectivity(): Promise<HealthCheckResult> {
    const start = Date.now();

    try {
      const userCount = await prisma.user.count();

      return {
        name: "database_connectivity",
        status: "healthy",
        message: "Database connectivity is working",
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
        details: {
          userCount,
          connectionTest: "passed",
        },
      };
    } catch (error) {
      return {
        name: "database_connectivity",
        status: "unhealthy",
        message: `Database connectivity failed: ${(error as Error).message}`,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // FIX: antes pasaba por DataProviderFactory.create() para probar users/classes/disciplines.
  // Ahora consulta Prisma directo — mismo propósito (validar que las tablas core responden),
  // sin depender de la capa de abstracción eliminada.
  private async checkCoreQueries(): Promise<HealthCheckResult> {
    const start = Date.now();

    try {
      const [userResult, classResult, disciplineResult] = await Promise.all([
        prisma.user.findMany({ take: 1 }),
        prisma.classSession.findMany({ take: 1 }),
        prisma.discipline.findMany({ take: 1 }),
      ]);

      const allOperationsSuccessful =
        !!userResult && !!classResult && !!disciplineResult;

      return {
        name: "repository_operations",
        status: allOperationsSuccessful ? "healthy" : "degraded",
        message: allOperationsSuccessful
          ? "All core table queries are working"
          : "Some core table queries may be failing",
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
        details: {
          userQueryWorking: !!userResult,
          classQueryWorking: !!classResult,
          disciplineQueryWorking: !!disciplineResult,
        },
      };
    } catch (error) {
      return {
        name: "repository_operations",
        status: "unhealthy",
        message: `Core table queries failed: ${(error as Error).message}`,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async checkPerformanceMetrics(): Promise<HealthCheckResult> {
    const start = Date.now();

    try {
      const performanceSummary = performanceMonitor.getPerformanceSummary();

      const avgDurationThreshold = 500;
      const successRateThreshold = 95;
      const slowOperationsThreshold = 10;

      const isHealthy =
        performanceSummary.averageDuration < avgDurationThreshold &&
        performanceSummary.successRate > successRateThreshold &&
        performanceSummary.slowOperations < slowOperationsThreshold;

      const isDegraded =
        performanceSummary.averageDuration < avgDurationThreshold * 2 &&
        performanceSummary.successRate > successRateThreshold - 10;

      const status = isHealthy
        ? "healthy"
        : isDegraded
        ? "degraded"
        : "unhealthy";

      return {
        name: "performance_metrics",
        status,
        message: `Performance metrics: ${performanceSummary.averageDuration.toFixed(
          1
        )}ms avg, ${performanceSummary.successRate.toFixed(1)}% success rate`,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
        details: {
          averageDuration: performanceSummary.averageDuration,
          successRate: performanceSummary.successRate,
          slowOperations: performanceSummary.slowOperations,
          totalOperations: performanceSummary.totalOperations,
          cacheHitRate: performanceSummary.cacheHitRate,
        },
      };
    } catch (error) {
      return {
        name: "performance_metrics",
        status: "unhealthy",
        message: `Performance metrics check failed: ${
          (error as Error).message
        }`,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async checkMemoryUsage(): Promise<HealthCheckResult> {
    const start = Date.now();

    try {
      const memoryUsage = process.memoryUsage();
      const memoryUsageMB = {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      };

      const heapUsedThreshold = 512;
      const heapUsedCriticalThreshold = 1024;

      const isHealthy = memoryUsageMB.heapUsed < heapUsedThreshold;
      const isDegraded = memoryUsageMB.heapUsed < heapUsedCriticalThreshold;

      const status = isHealthy
        ? "healthy"
        : isDegraded
        ? "degraded"
        : "unhealthy";

      return {
        name: "memory_usage",
        status,
        message: `Memory usage: ${memoryUsageMB.heapUsed}MB heap used`,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
        details: memoryUsageMB,
      };
    } catch (error) {
      return {
        name: "memory_usage",
        status: "unhealthy",
        message: `Memory usage check failed: ${(error as Error).message}`,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Sin cambios de fondo: ya usaba DisciplineService directo (no provider-factory),
  // y ya está scopeada con "health-check-tenant" desde el cierre de discipline-service.
  private async checkCacheFunctionality(): Promise<HealthCheckResult> {
    const start = Date.now();

    try {
      const { DisciplineService } = await import(
        "../services/discipline-service"
      );
      const disciplineService = new DisciplineService();

      const start1 = Date.now();
      await disciplineService.getActiveDisciplines("health-check-tenant");
      const firstCallDuration = Date.now() - start1;

      const start2 = Date.now();
      await disciplineService.getActiveDisciplines("health-check-tenant");
      const secondCallDuration = Date.now() - start2;

      const cacheWorking = secondCallDuration < firstCallDuration * 0.5;

      return {
        name: "cache_functionality",
        status: cacheWorking ? "healthy" : "degraded",
        message: cacheWorking
          ? "Cache is working properly"
          : "Cache may not be working optimally",
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
        details: {
          firstCallDuration,
          secondCallDuration,
          cacheEffective: cacheWorking,
        },
      };
    } catch (error) {
      return {
        name: "cache_functionality",
        status: "unhealthy",
        message: `Cache functionality check failed: ${
          (error as Error).message
        }`,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private calculateHealthSummary(
    checks: HealthCheckResult[]
  ): SystemHealthReport["summary"] {
    const summary = {
      healthy: 0,
      unhealthy: 0,
      degraded: 0,
      total: checks.length,
    };

    checks.forEach((check) => {
      summary[check.status]++;
    });

    return summary;
  }

  private determineOverallHealth(
    summary: SystemHealthReport["summary"]
  ): "healthy" | "unhealthy" | "degraded" {
    if (summary.unhealthy > 0) {
      return "unhealthy";
    }
    if (summary.degraded > 0) {
      return "degraded";
    }
    return "healthy";
  }

  private startPeriodicHealthChecks(): void {
    const intervalMs = parseInt(
      process.env.HEALTH_CHECK_INTERVAL_MS || "300000"
    );

    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        logger.error(
          "Periodic health check failed",
          { operation: "periodicHealthCheck" },
          error as Error
        );
      }
    }, intervalMs);

    logger.info("Periodic health checks started", {
      operation: "startPeriodicHealthChecks",
      intervalMs,
    });
  }

  stopPeriodicHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      logger.info("Periodic health checks stopped");
    }
  }

  getLastHealthCheck(): SystemHealthReport | null {
    return this.lastHealthCheck;
  }

  getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  async quickHealthCheck(): Promise<{
    status: "healthy" | "unhealthy";
    message: string;
  }> {
    try {
      await prisma.user.count();

      return {
        status: "healthy",
        message: "System is operational",
      };
    } catch (error) {
      return {
        status: "unhealthy",
        message: `System is experiencing issues: ${(error as Error).message}`,
      };
    }
  }
}

export const healthChecker = HealthChecker.getInstance();

export async function getSystemHealth(): Promise<SystemHealthReport> {
  return healthChecker.performHealthCheck();
}

export async function getQuickHealth(): Promise<{
  status: "healthy" | "unhealthy";
  message: string;
}> {
  return healthChecker.quickHealthCheck();
}
