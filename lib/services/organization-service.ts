import { BaseService } from "./base-service";
import { Organization } from "../types";
import { DataProvider } from "../data-layer/types";
import { ApiResponse, createSuccessResponse } from "../api/types";
import { withErrorHandling } from "../errors/handler";

export class OrganizationService extends BaseService<Organization> {
  protected repositoryName: keyof DataProvider = "organizations";

  constructor() {
    super();
  }

  async getOrganization(): Promise<ApiResponse<Organization | null>> {
    return withErrorHandling(
      async () => {
        const result = await this.repository.findMany({ limit: 1 });
        const org = result.items.length > 0 ? result.items[0] : null;

        return createSuccessResponse(org, {
          processingTime: this.getProcessingTime(),
        });
      },
      {
        operation: "getOrganization",
        resource: this.repositoryName as string,
      }
    );
  }
}
