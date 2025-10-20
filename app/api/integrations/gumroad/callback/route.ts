// app/api/integrations/gumroad/callback/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { exchangeGumroadCode } from "@/lib/gumroad";

const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const code = searchParams.get("code");
	const error = searchParams.get("error");

	// Handle OAuth errors
	if (error) {
		console.error("Gumroad OAuth error:", error);
		return NextResponse.redirect(`${baseUrl}/dashboard?error=gumroad`);
	}

	if (!code) {
		console.error("No code in Gumroad callback URL");
		return NextResponse.redirect(`${baseUrl}/dashboard?error=gumroad`);
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
		console.log("Attempting to exchange Gumroad code for token");

		const redirectUri = `${baseUrl}/api/integrations/gumroad/callback`;
		const gumroadData = await exchangeGumroadCode(code, redirectUri);

		console.log("Gumroad OAuth success");

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
			provider: "gumroad",
			access_token: gumroadData.access_token,
			refresh_token: gumroadData.refresh_token || null,
		});

		if (dbError) {
			console.error("Supabase DB error:", dbError);
			throw dbError;
		}

		console.log("Stored Gumroad integration in Supabase, redirecting to dashboard");
		return NextResponse.redirect(`${baseUrl}/dashboard`);
	} catch (err) {
		console.error("Gumroad OAuth error:", err);
		return NextResponse.redirect(`${baseUrl}/dashboard?error=gumroad`);
	}
}
