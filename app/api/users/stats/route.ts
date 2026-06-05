import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user-service";
import { ErrorHandler } from "@/lib/errors/handler";


export async function GET(request: NextRequest) {
  try {
    // Use UserService to get user stats
    const organizationId = request.headers.get("x-organization-id");
    const response = await userService.getUserStats(organizationId || undefined);

    // Return standardized response
    return NextResponse.json(response);
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "getUserStats",
      resource: "users",
    });
  }
}
