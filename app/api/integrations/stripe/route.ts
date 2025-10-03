// app/api/integrations/stripe/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(req: Request) {
	// Use STRIPE_SECRET_KEY for local testing
	const stripeKey = process.env.STRIPE_SECRET_KEY;
	if (!stripeKey) {
		return NextResponse.json(
			{ error: "STRIPE_SECRET_KEY not set" },
			{ status: 400 }
		);
	}

	const stripe = new Stripe(stripeKey, { apiVersion: "2025-09-30.clover" });

	try {
		// fetch charges (page small for demo)
		const charges = await stripe.charges.list({ limit: 100 });

		// Map into daily totals
		const dailyMap: Record<string, number> = {};
		for (const c of charges.data) {
			if (!c.paid || c.refunded) continue;
			const d = new Date((c.created || 0) * 1000);
			const key = d.toISOString().slice(0, 10);
			dailyMap[key] = (dailyMap[key] || 0) + (c.amount || 0) / 100; // cents -> dollars
		}

        // Sort map by date
		const data = Object.entries(dailyMap)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([date, amount]) => ({ date, amount }));

		// optional: fetch balance
		const balance = await stripe.balance.retrieve();

		return NextResponse.json({ data, balance });
	} catch (err: any) {
		console.error("Stripe fetch error:", err);
		return NextResponse.json(
			{ error: err.message || "Stripe error" },
			{ status: 500 }
		);
	}
}
