import { NextResponse } from "next/server";
import { runPartnerScout } from "@/lib/ascend-work/partner-scout";
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET; const authorization = request.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json({ success: true, run: await runPartnerScout("cron") }); }
  catch (error) { console.error("ASCEND Partner Scout cron error:", error); return NextResponse.json({ error: "Scout run failed." }, { status: 500 }); }
}
