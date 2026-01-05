export {};

import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest, ctx?: { params?: Promise<any> }) {
	return NextResponse.json({ success: false, error: "Not implemented" }, { status: 501 });
}

