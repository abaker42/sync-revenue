import { NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Type definition for the daily revenue record.
 */
interface DailyRevenue {
	date: string;
	amount: number;
}

/**
 * GET handler: Fetch recent Stripe charges and aggregate daily revenue.
 */
export async function GET(_req: Request): Promise<NextResponse> {
	const stripeKey = process.env.STRIPE_SECRET_KEY;
	if (!stripeKey) {
		return NextResponse.json(
			{ error: "STRIPE_SECRET_KEY not set" },
			{ status: 400 }
		);
	}

	// ✅ Use the latest stable API version supported by your SDK
	const stripe = new Stripe(stripeKey, {
		apiVersion: "2025-09-30.clover", // Adjust if Stripe updates SDK version
	});

	try {
		// Fetch recent paid, non-refunded charges
		const charges = await stripe.charges.list({ limit: 100 });

		const dailyMap = new Map<string, number>();

		for (const charge of charges.data) {
			if (!charge.paid || charge.refunded) continue;

			const timestamp = charge.created ? charge.created * 1000 : Date.now();
			const dateKey = new Date(timestamp).toISOString().slice(0, 10);

			const prevAmount = dailyMap.get(dateKey) ?? 0;
			const total = prevAmount + (charge.amount ?? 0) / 100; // convert cents → dollars

			dailyMap.set(dateKey, total);
		}

		// Convert map → sorted array
		const data: DailyRevenue[] = Array.from(dailyMap.entries())
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([date, amount]) => ({ date, amount }));

		// Fetch balance (optional)
		const balance = await stripe.balance.retrieve();

		return NextResponse.json({ data, balance });
	} catch (error) {
		if (error instanceof Error) {
			console.error("Stripe fetch error:", error.message);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		console.error("Unexpected Stripe error:", error);
		return NextResponse.json(
			{ error: "Unknown Stripe error" },
			{ status: 500 }
		);
	}
}
