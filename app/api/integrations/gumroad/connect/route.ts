// app/api/integrations/gumroad/connect/route.ts

import { NextResponse } from "next/server";
import { getGumroadAuthUrl } from "@/lib/gumroad";

const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export async function GET() {
	console.log('baseURL: ', baseUrl)
	const redirectUri = `${baseUrl}/api/integrations/gumroad/callback`;
	const authUrl = getGumroadAuthUrl(redirectUri);

	return NextResponse.redirect(authUrl);
}
