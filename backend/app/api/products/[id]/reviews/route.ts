export {};

import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest, ctx?: { params?: Promise<any> }) {
  const params = ctx && ctx.params ? await ctx.params : undefined;

	return NextResponse.json({ success: false, error: "Not implemented" }, { status: 501 });
}

