// Gumroad OAuth and API utilities

export const GUMROAD_OAUTH_URL = "https://gumroad.com/oauth/authorize";
export const GUMROAD_TOKEN_URL = "https://gumroad.com/oauth/token";
export const GUMROAD_API_BASE = "https://api.gumroad.com/v2";

/**
 * Generate the Gumroad OAuth authorization URL
 */
export function getGumroadAuthUrl(redirectUri: string): string {
	const params = new URLSearchParams({
		client_id: process.env.NEXT_PUBLIC_GUMROAD_CLIENT_ID!,
		redirect_uri: redirectUri,
		response_type: "code",
		scope: "view_sales",
	});

	return `${GUMROAD_OAUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeGumroadCode(code: string, redirectUri: string) {
	const params = new URLSearchParams({
		code,
		client_id: process.env.NEXT_PUBLIC_GUMROAD_CLIENT_ID!,
		client_secret: process.env.GUMROAD_CLIENT_SECRET!,
		redirect_uri: redirectUri,
		grant_type: "authorization_code",
	});

	const response = await fetch(GUMROAD_TOKEN_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: params.toString(),
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Gumroad token exchange failed: ${text}`);
	}

	return response.json();
}

/**
 * Fetch sales data from Gumroad API
 */
export async function fetchGumroadSales(accessToken: string) {
	const url = `${GUMROAD_API_BASE}/sales`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Gumroad API error: ${text}`);
	}

	return response.json();
}

/**
 * Aggregate Gumroad sales by day
 */
export function aggregateSalesByDay(sales: any[]) {
	const dailyRevenue = new Map<string, number>();

	sales.forEach((sale) => {
		// Gumroad provides created_at timestamp
		const date = new Date(sale.created_at).toISOString().split("T")[0];
		const amount = parseFloat(sale.price) / 100; // Convert cents to dollars

		const existing = dailyRevenue.get(date) || 0;
		dailyRevenue.set(date, existing + amount);
	});

	// Convert to array and sort by date
	return Array.from(dailyRevenue.entries())
		.map(([date, amount]) => ({
			date,
			amount: parseFloat(amount.toFixed(2)),
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
}
