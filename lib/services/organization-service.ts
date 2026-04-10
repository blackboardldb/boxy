import { BaseService } from "./base-service";
import { Organization } from "../types";
import { DataProvider, OrganizationRepository } from "../data-layer/types";
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
        const org = await (this.repository as unknown as OrganizationRepository).findFirst();

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

export const organizationService = new OrganizationService();
