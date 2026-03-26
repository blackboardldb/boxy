import { NextRequest, NextResponse } from "next/server";
import { generateClassesFromSchedules } from "@/lib/utils/class-generator";

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields: startDate, endDate" },
        { status: 400 }
      );
    }

    const generatedClasses = await generateClassesFromSchedules(startDate, endDate);

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

