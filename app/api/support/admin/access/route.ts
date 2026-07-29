import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { isSupportAdmin } from "@/lib/support/admin-auth";

export async function GET() {
  try {
    const { userId } = await auth();

    const isAdmin =
      userId
        ? await isSupportAdmin(userId)
        : false;

    return NextResponse.json({
      success: true,
      isAdmin,
    });
  } catch (error) {
    console.error(
      "Support admin access check failed:",
      error
    );

    return NextResponse.json({
      success: true,
      isAdmin: false,
    });
  }
}