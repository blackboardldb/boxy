import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/user-service";
import { ErrorHandler } from "@/lib/errors/handler";

// Initialize services
const userService = new UserService();

export async function GET(request: NextRequest) {
  try {
    // Use UserService to get user stats
    const response = await userService.getUserStats();

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
