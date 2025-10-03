// app/api/integrations/stripe/callback/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	const url = new URL(req.url);
	const code = url.searchParams.get("code");
	const error = url.searchParams.get("error");

	if (error) {
		return NextResponse.redirect(
			new URL("/dashboard?connect_error=1", process.env.NEXT_PUBLIC_BASE_URL)
		);
	}
	if (!code) {
		return NextResponse.redirect(
			new URL("/dashboard?connect_error=1", process.env.NEXT_PUBLIC_BASE_URL)
		);
	}

	// Exchange code for tokens
	const params = new URLSearchParams();
	params.append("client_secret", process.env.STRIPE_SECRET!);
	params.append("code", code);
	params.append("grant_type", "authorization_code");

	const res = await fetch("https://connect.stripe.com/oauth/token", {
		method: "POST",
		body: params,
	});
	const json = await res.json();

	if (json.error) {
		console.error("Stripe OAuth error", json);
		return NextResponse.redirect(
			new URL("/dashboard?connect_error=1", process.env.NEXT_PUBLIC_BASE_URL)
		);
	}

	// json contains access_token, refresh_token, stripe_user_id (acct_...)
	// Save to Supabase integrations table for the current user.
	// For demo: return json (in prod: store in DB tied to session user).
	return NextResponse.json(json);
}
