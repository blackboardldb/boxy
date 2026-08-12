import { NextRequest, NextResponse } from "next/server";
import { generateClassesFromSchedules } from "@/lib/utils/class-generator";
import { requireAdminFast } from "@/lib/supabase/auth-guard";
import { z } from "zod";

const generateAutoSchema = z.object({
  startDate: z.string().min(1, "startDate es requerido"),
  endDate:   z.string().min(1, "endDate es requerido"),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const activeOrgId = auth.organizationId;

    const parsed = generateAutoSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { startDate, endDate } = parsed.data;

    const generatedClasses = await generateClassesFromSchedules(activeOrgId, startDate, endDate);

    return NextResponse.json(
      {
        message: `Successfully generated ${generatedClasses.length} classes automatically from discipline schedules`,
        classes: generatedClasses,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating classes automatically:", error);
    return NextResponse.json(
      { error: "Failed to generate classes automatically" },
      { status: 500 }
    );
  }
}

