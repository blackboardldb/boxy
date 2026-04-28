// Enhanced base service class with DataProvider integration
// Provides common service operations that work with any provider

import {
  DataProvider,
  Repository,
  FindManyParams,
  PaginatedResult,
} from "../data-layer/types";
import { getDataProvider } from "../data-layer/provider-factory";
import {
  ApiResponse,
  PaginatedApiResponse,
  createSuccessResponse,
  createPaginatedResponse,
  createErrorResponse,
} from "../api/types";
import { ErrorHandler, withErrorHandling } from "../errors/handler";
import { AppError, ValidationError, NotFoundError } from "../errors/types";

// Base service class that all services should extend
export abstract class BaseService<T extends import("../data-layer/types").BaseEntity, TInput = Partial<T>> {
  protected dataProvider: DataProvider;
  protected abstract repositoryName: keyof DataProvider;

  constructor() {
    this.dataProvider = getDataProvider();
  }

  // Get the repository for this service
  protected get repository(): Repository<T> {
    return this.dataProvider[this.repositoryName] as unknown as Repository<T>;
  }

  // Find many records with standardized response
  async findMany(params?: FindManyParams): Promise<PaginatedApiResponse<T>> {
    return withErrorHandling(
      async () => {
        const result = await this.repository.findMany(params);

        return createPaginatedResponse(result.items, result.pagination, {
          processingTime: this.getProcessingTime(),
        });
      },
      {
        operation: "findMany",
        resource: this.repositoryName as string,
      }
    );
  }

  // Find a single record by ID
  async findById(id: string): Promise<ApiResponse<T | null>> {
    return withErrorHandling(
      async () => {
        const record = await this.repository.findUnique({ where: { id } });

        return createSuccessResponse(record, {
          processingTime: this.getProcessingTime(),
        });
      },
      {
        operation: "findById",
        resource: this.repositoryName as string,
        metadata: { id },
      }
    );
  }

  // Find a single record with custom criteria
  async findUnique(params: {
    where: Record<string, any>;
  }): Promise<ApiResponse<T | null>> {
    return withErrorHandling(
      async () => {
        const record = await this.repository.findUnique(params);

        return createSuccessResponse(record, {
          processingTime: this.getProcessingTime(),
        });
      },
      {
        operation: "findUnique",
        resource: this.repositoryName as string,
        metadata: params.where,
      }
    );
  }

  // Create a new record
  async create(data: TInput): Promise<ApiResponse<T>> {
    return withErrorHandling(
      async () => {
        // Validate data before creation
        await this.validateCreateData(data);

        const record = await this.repository.create(
          data as unknown as import("../data-layer/types").CreateData<T>
        );

        // Post-creation hook
        await this.afterCreate(record);

        return createSuccessResponse(record, {
          processingTime: this.getProcessingTime(),
        });
      },
      {
        operation: "create",
        resource: this.repositoryName as string,
      }
    );
  }

  // Update an existing record
  async update(id: string, data: TInput): Promise<ApiResponse<T>> {
    return withErrorHandling(
      async () => {
        // Check if record exists
        const existingRecord = await this.repository.findUnique({
          where: { id },
        });
        if (!existingRecord) {
          throw new NotFoundError(this.repositoryName as string, id);
        }

        // Validate update data
        await this.validateUpdateData(id, data, existingRecord);

        const updatedRecord = await this.repository.update(
          id,
          data as unknown as import("../data-layer/types").UpdateData<T>
        );

        // Post-update hook
        await this.afterUpdate(updatedRecord, existingRecord);

        return createSuccessResponse(updatedRecord, {
          processingTime: this.getProcessingTime(),
        });
      },
      {
        operation: "update",
        resource: this.repositoryName as string,
        metadata: { id },
      }
    );
  }

  // Delete a record
  async delete(id: string): Promise<ApiResponse<T>> {
    return withErrorHandling(
      async () => {
        // Check if record exists
        const existingRecord = await this.repository.findUnique({
          where: { id },
        });
        if (!existingRecord) {
          throw new NotFoundError(this.repositoryName as string, id);
        }

        // Validate deletion
        await this.validateDelete(id, existingRecord);

        const deletedRecord = await this.repository.delete(id);

        // Post-deletion hook
        await this.afterDelete(deletedRecord);

        return createSuccessResponse(deletedRecord, {
          processingTime: this.getProcessingTime(),
        });
      },
      {
        operation: "delete",
        resource: this.repositoryName as string,
        metadata: { id },
      }
    );
  }

  // Count records
  async count(params?: {
    where?: Record<string, unknown>;
  }): Promise<ApiResponse<number>> {
    return withErrorHandling(
      async () => {
        const count = await this.repository.count(params);

        return createSuccessResponse(count, {
          processingTime: this.getProcessingTime(),
        });
      },
      {
        operation: "count",
        resource: this.repositoryName as string,
      }
    );
  }

  // Check if record exists
  async exists(id: string): Promise<ApiResponse<boolean>> {
    return withErrorHandling(
      async () => {
        const record = await this.repository.findUnique({ where: { id } });

        return createSuccessResponse(record !== null, {
          processingTime: this.getProcessingTime(),
        });
      },
      {
        operation: "exists",
        resource: this.repositoryName as string,
        metadata: { id },
      }
    );
  }

  // Bulk operations

  // Create multiple records
  async createMany(dataArray: TInput[]): Promise<ApiResponse<T[]>> {
    return withErrorHandling(
      async () => {
        // Validate all data
        for (const data of dataArray) {
          await this.validateCreateData(data);
        }

        const results: T[] = [];

        // Create records one by one (can be optimized with bulk operations)
        for (const data of dataArray) {
          const record = await this.repository.create(
            data as unknown as import("../data-layer/types").CreateData<T>
          );
          results.push(record);
          await this.afterCreate(record);
        }

        return createSuccessResponse(results, {
          processingTime: this.getProcessingTime(),
          count: results.length,
        });
      },
      {
        operation: "createMany",
        resource: this.repositoryName as string,
        metadata: { count: dataArray.length },
      }
    );
  }

  // Update multiple records
  async updateMany(
    criteria: Record<string, unknown>,
    data: TInput
  ): Promise<ApiResponse<T[]>> {
    return withErrorHandling(
      async () => {
        // Find matching records first
        const matchingRecords = await this.repository.findMany({
          where: criteria,
        });

        if (matchingRecords.items.length === 0) {
          return createSuccessResponse([], {
            processingTime: this.getProcessingTime(),
            count: 0,
          });
        }

        const results: T[] = [];

        // Update records one by one
        for (const record of matchingRecords.items) {
          await this.validateUpdateData(record.id, data, record);
          const updatedRecord = await this.repository.update(
            record.id,
            data as unknown as import("../data-layer/types").UpdateData<T>
          );
          results.push(updatedRecord);
          await this.afterUpdate(updatedRecord, record);
        }

        return createSuccessResponse(results, {
          processingTime: this.getProcessingTime(),
          count: results.length,
        });
      },
      {
        operation: "updateMany",
        resource: this.repositoryName as string,
        metadata: { criteria },
      }
    );
  }

  // Delete multiple records
  async deleteMany(criteria: Record<string, unknown>): Promise<ApiResponse<T[]>> {
    return withErrorHandling(
      async () => {
        // Find matching records first
        const matchingRecords = await this.repository.findMany({
          where: criteria,
        });

        if (matchingRecords.items.length === 0) {
          return createSuccessResponse([], {
            processingTime: this.getProcessingTime(),
            count: 0,
          });
        }

        const results: T[] = [];

        // Delete records one by one
        for (const record of matchingRecords.items) {
          await this.validateDelete(record.id, record);
          const deletedRecord = await this.repository.delete(
            record.id
          );
          results.push(deletedRecord);
          await this.afterDelete(deletedRecord);
        }

        return createSuccessResponse(results, {
          processingTime: this.getProcessingTime(),
          count: results.length,
        });
      },
      {
        operation: "deleteMany",
        resource: this.repositoryName as string,
        metadata: { criteria },
      }
    );
  }

  // Search functionality
  async search(
    query: string,
    fields: string[] = []
  ): Promise<PaginatedApiResponse<T>> {
    return withErrorHandling(
      async () => {
        const searchCriteria = this.buildSearchCriteria(query, fields);
        const result = await this.repository.findMany({
          where: searchCriteria,
        });

        return createPaginatedResponse(result.items, result.pagination, {
          processingTime: this.getProcessingTime(),
          searchQuery: query,
          searchFields: fields,
        });
      },
      {
        operation: "search",
        resource: this.repositoryName as string,
        metadata: { query, fields },
      }
    );
  }

  // Validation hooks (to be overridden by subclasses)

  // Validate data before creation
  protected async validateCreateData(data: TInput): Promise<void> {
    // Override in subclasses for specific validation
  }

  // Validate data before update
  protected async validateUpdateData(
    id: string,
    data: TInput,
    existingRecord: T
  ): Promise<void> {
    // Override in subclasses for specific validation
  }

  // Validate before deletion
  protected async validateDelete(id: string, existingRecord: T): Promise<void> {
    // Override in subclasses for specific validation
  }

  // Lifecycle hooks (to be overridden by subclasses)

  // Called after successful creation
  protected async afterCreate(record: T): Promise<void> {
    // Override in subclasses for post-creation logic
  }

  // Called after successful update
  protected async afterUpdate(
    updatedRecord: T,
    previousRecord: T
  ): Promise<void> {
    // Override in subclasses for post-update logic
  }

  // Called after successful deletion
  protected async afterDelete(deletedRecord: T): Promise<void> {
    // Override in subclasses for post-deletion logic
  }

  // Utility methods

  // Build search criteria for text search
  protected buildSearchCriteria(
    query: string,
    fields: string[]
  ): Record<string, unknown> {
    if (!query.trim() || fields.length === 0) {
      return {};
    }

    const searchConditions = fields.map((field) => ({
      [field]: {
        contains: query,
        mode: "insensitive",
      },
    }));

    return {
      OR: searchConditions,
    };
  }

  // Get processing time (for performance monitoring)
  protected getProcessingTime(): number {
    return 0; // Timing real implementado vía Sentry — ver HAL-13
  }

  // Get service statistics
  async getServiceStats(): Promise<
    ApiResponse<{
      totalRecords: number;
      serviceName: string;
      providerType: string;
      lastAccessed: string;
    }>
  > {
    return withErrorHandling(
      async () => {
        const totalRecords = await this.repository.count();

        const stats = {
          totalRecords,
          serviceName: this.repositoryName as string,
          providerType: this.dataProvider.constructor.name,
          lastAccessed: new Date().toISOString(),
        };

        return createSuccessResponse(stats, {
          processingTime: this.getProcessingTime(),
        });
      },
      {
        operation: "getServiceStats",
        resource: this.repositoryName as string,
      }
    );
  }

  // Health check for the service
  async healthCheck(): Promise<
    ApiResponse<{
      status: "healthy" | "unhealthy";
      details: Record<string, any>;
    }>
  > {
    try {
      // Test basic operations
      await this.repository.count();

      const health = {
        status: "healthy" as const,
        details: {
          serviceName: this.repositoryName as string,
          providerType: this.dataProvider.constructor.name,
          timestamp: new Date().toISOString(),
        },
      };

      return createSuccessResponse(health, {
        processingTime: this.getProcessingTime(),
      });
    } catch (error) {
      const health = {
        status: "unhealthy" as const,
        details: {
          serviceName: this.repositoryName as string,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      };

      return createSuccessResponse(health, {
        processingTime: this.getProcessingTime(),
      });
    }
  }

  // Refresh data provider (useful for testing or provider switching)
  protected refreshDataProvider(): void {
    this.dataProvider = getDataProvider();
  }

  // Get current data provider
  protected getDataProvider(): DataProvider {
    return this.dataProvider;
  }

  // Transaction support (if provider supports it)
  protected async withTransaction<R>(
    operation: (provider: DataProvider) => Promise<R>
  ): Promise<R> {
    const providerWithTransaction = this.dataProvider as DataProvider & { $transaction?: (op: (provider: DataProvider) => Promise<R>) => Promise<R> };
    if (typeof providerWithTransaction.$transaction === "function") {
      return await providerWithTransaction.$transaction(operation);
    } else {
      // Fallback to regular operation if transactions not supported
      return await operation(this.dataProvider);
    }
  }

  // Caching support (basic implementation)
  // NOTA: Las keys de caché no incluyen organizationId.
  // En single-tenant (actual) esto es seguro. Con múltiples tenants,
  // agregar organizationId a cada key antes de activar el segundo tenant.
  private cache = new Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  >();

  protected async withCache<R>(
    key: string,
    operation: () => Promise<R>,
    ttlMs: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<R> {
    const cached = this.cache.get(key);
    const now = Date.now();

    // Return cached data if valid
    if (cached && now - cached.timestamp < cached.ttl) {
      return cached.data as R;
    }

    // Execute operation and cache result
    const result = await operation();
    this.cache.set(key, {
      data: result,
      timestamp: now,
      ttl: ttlMs,
    });

    return result;
  }

  // Clear cache
  protected clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}
