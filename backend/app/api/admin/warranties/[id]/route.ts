export {};

import { NextResponse, NextRequest } from "next/server";
import { requireAuthWithRole } from '../../../../lib/requireAuth'

export async function GET(req: NextRequest, ctx?: { params?: Promise<any> }) {
	const params = ctx && ctx.params ? await ctx.params : undefined;
	await requireAuthWithRole(req, 'admin')

		return NextResponse.json({ success: false, error: "Not implemented" }, { status: 501 });
}

