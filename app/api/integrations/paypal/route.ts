// app/api/integrations/paypal/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { fetchPayPalTransactions, aggregateTransactionsByDay } from "@/lib/paypal";

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
		// Get PayPal integration from database
		const { data: integration, error: dbError } = await supabase
			.from("integrations")
			.select("access_token")
			.eq("user_id", user.id)
			.eq("provider", "paypal")
			.single();

		if (dbError || !integration) {
			return NextResponse.json(
				{ error: "PayPal not connected" },
				{ status: 404 }
			);
		}

		// Fetch transactions from PayPal API
		const transactionData = await fetchPayPalTransactions(integration.access_token);

		// Aggregate transactions by day
		const dailyRevenue = aggregateTransactionsByDay(
			transactionData.transaction_details || []
		);

		// Calculate total revenue
		const totalRevenue = dailyRevenue.reduce(
			(sum, day) => sum + day.amount,
			0
		);

		return NextResponse.json({
			success: true,
			totalRevenue: parseFloat(totalRevenue.toFixed(2)),
			dailyRevenue,
			transactionCount: transactionData.transaction_details?.length || 0,
		});
	} catch (error) {
		console.error("PayPal API error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch PayPal data" },
			{ status: 500 }
		);
	}
}
