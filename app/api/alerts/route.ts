import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const alerts = await prisma.inAppAlert.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching active alerts:", error);
    return NextResponse.json({ error: "Failed to fetch active alerts" }, { status: 500 });
  }
}
