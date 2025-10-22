// app/api/integrations/paypal/connect/route.ts

import { NextResponse } from "next/server";
import { getPayPalAuthUrl } from "@/lib/paypal";

const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export async function GET() {
	const redirectUri = `${baseUrl}/api/integrations/paypal/callback`;
	const authUrl = getPayPalAuthUrl(redirectUri);

	return NextResponse.redirect(authUrl);
}
