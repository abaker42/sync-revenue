// app/api/integrations/status/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
	// Create Supabase client
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

	// Get authenticated user
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
	}

	try {
		// Fetch all integrations for the user
		const { data: integrations, error: dbError } = await supabase
			.from("integrations")
			.select("provider, stripe_user_id")
			.eq("user_id", user.id);

		if (dbError) {
			console.error("Database error:", dbError);
			throw dbError;
		}

		// Format the response
		const status = {
			stripe: null as { connected: boolean; userId?: string } | null,
			gumroad: null as { connected: boolean; userId?: string } | null,
			paypal: null as { connected: boolean; userId?: string } | null,
			lemonsqueezy: null as { connected: boolean; userId?: string } | null,
		};

		integrations?.forEach((integration) => {
			switch (integration.provider) {
				case "stripe":
					status.stripe = {
						connected: true,
						userId: integration.stripe_user_id,
					};
					break;
				case "gumroad":
					status.gumroad = {
						connected: true,
					};
					break;
				case "paypal":
					status.paypal = {
						connected: true,
					};
					break;
				case "lemonsqueezy":
					status.lemonsqueezy = {
						connected: true,
					};
					break;
			}
		});

		return NextResponse.json(status);
	} catch (error) {
		console.error("Error fetching integration status:", error);
		return NextResponse.json(
			{ error: "Failed to fetch integration status" },
			{ status: 500 }
		);
	}
}
