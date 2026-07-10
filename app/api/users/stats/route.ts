import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { requireAdmin } from "@/lib/supabase/auth-guard";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { organizationId } = auth;

    const response = await userService.getUserStats(organizationId);
    return NextResponse.json(response);
  } catch (error) {
    return ErrorHandler.createResponse(error, {
      operation: "getUserStats",
      resource: "users",
    });
  }
}
