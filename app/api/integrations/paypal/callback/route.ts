// app/api/integrations/paypal/callback/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { exchangePayPalCode } from "@/lib/paypal";

const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const code = searchParams.get("code");
	const error = searchParams.get("error");

	// Handle OAuth errors
	if (error) {
		console.error("PayPal OAuth error:", error);
		return NextResponse.redirect(`${baseUrl}/dashboard?error=paypal`);
	}

	if (!code) {
		console.error("No code in PayPal callback URL");
		return NextResponse.redirect(`${baseUrl}/dashboard?error=paypal`);
	}

	// Create Supabase client with SSR pattern
	const cookieStore = await cookies();
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options)
						);
					} catch (error) {
						console.warn("cookies.setAll not supported:", error);
					}
				},
			},
		}
	);

	try {
		console.log("Attempting to exchange PayPal code for token");

		const paypalData = await exchangePayPalCode(code);

		console.log("PayPal OAuth success");

		// Get authenticated user
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError) {
			console.error("Supabase user error:", userError);
		}

		if (!user) {
			console.error("No user found — redirecting to login");
			return NextResponse.redirect(`${baseUrl}/auth/login?error=no_user`);
		}

		// Store integration in Supabase
		const { error: dbError } = await supabase.from("integrations").upsert({
			user_id: user.id,
			provider: "paypal",
			access_token: paypalData.access_token,
			refresh_token: paypalData.refresh_token || null,
		});

		if (dbError) {
			console.error("Supabase DB error:", dbError);
			throw dbError;
		}

		console.log("Stored PayPal integration in Supabase, redirecting to dashboard");
		return NextResponse.redirect(`${baseUrl}/dashboard`);
	} catch (err) {
		console.error("PayPal OAuth error:", err);
		return NextResponse.redirect(`${baseUrl}/dashboard?error=paypal`);
	}
}
