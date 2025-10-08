// app/api/integrations/stripe/callback/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2025-09-30.clover",
});

const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const code = searchParams.get("code");

	if (!code) {
		return NextResponse.redirect(`${baseUrl}/dashboard?error=stripe`);
	}

	// Setup Supabase client
	const cookieStore = await cookies();
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
				set(name: string, value: string, options: any) {
					cookieStore.set({ name, value, ...options });
				},
				remove(name: string, options: any) {
					cookieStore.set({ name, value: "", ...options });
				},
			},
		}
	);

	try {
        console.log('attempting to exchange code for token')
		// Exchange code for Stripe access token
		// const response = await stripe.oauth.token({
		// 	grant_type: "authorization_code",
		// 	code,
		// });
        const tokenResponse = await fetch(
			"https://connect.stripe.com/oauth/token",
			{
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: new URLSearchParams({
					grant_type: "authorization_code",
					code,
					client_secret: process.env.STRIPE_SECRET_KEY!,
				}),
			});

        if (!tokenResponse.ok) {
				const text = await tokenResponse.text();
				console.error("Stripe token exchange failed:", text);
				throw new Error(text);
			}

            const stripeData = await tokenResponse.json();
			console.log("Stripe OAuth success:", stripeData);

		// Get current user
		const {data: { user }, } = await supabase.auth.getUser();

		if (!user) {
            console.error("No user found — redirecting to login");
			return NextResponse.redirect(`${baseUrl}/auth/login`);
		}

		// Store integration in Supabase
		await supabase.from("integrations").upsert({
			user_id: user.id,
			provider: "stripe",
			access_token: stripeData.access_token,
			refresh_token: stripeData.refresh_token,
			stripe_user_id: stripeData.stripe_user_id,
		});
        console.log('stored integration in supabase')
		return NextResponse.redirect(`${baseUrl}/dashboard?connected=stripe`);
	} catch (err) {
		console.error("Stripe OAuth error:", err);
		return NextResponse.redirect(`${baseUrl}/dashboard?error=stripe`);
	}
}


//******* USE BELOW FOR DEMO PURPOSES ONLY ******** */
// import { NextResponse } from "next/server";

// export async function GET(req: Request) {
//   const url = new URL(req.url);
//   const code = url.searchParams.get("code");
//   const error = url.searchParams.get("error");

//   if (error) {
//     return NextResponse.redirect(new URL("/dashboard?connect_error=1", process.env.NEXT_PUBLIC_BASE_URL));
//   }
//   if (!code) {
//     return NextResponse.redirect(new URL("/dashboard?connect_error=1", process.env.NEXT_PUBLIC_BASE_URL));
//   }

//   // Exchange code for tokens
//   const params = new URLSearchParams();
//   params.append("client_secret", process.env.STRIPE_SECRET!);
//   params.append("code", code);
//   params.append("grant_type", "authorization_code");

//   const res = await fetch("https://connect.stripe.com/oauth/token", {
//     method: "POST",
//     body: params,
//   });
//   const json = await res.json();

//   if (json.error) {
//     console.error("Stripe OAuth error", json);
//     return NextResponse.redirect(new URL("/dashboard?connect_error=1", process.env.NEXT_PUBLIC_BASE_URL));
//   }

//   // json contains access_token, refresh_token, stripe_user_id (acct_...)
//   // Save to Supabase integrations table for the current user.
//   // For demo: return json (in prod: store in DB tied to session user).
//   return NextResponse.json(json);
// }
