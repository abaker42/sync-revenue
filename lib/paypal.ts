// PayPal OAuth and API utilities

export const PAYPAL_OAUTH_URL = "https://www.paypal.com/signin/authorize";
export const PAYPAL_TOKEN_URL = "https://api-m.paypal.com/v1/oauth2/token";
export const PAYPAL_API_BASE = "https://api-m.paypal.com/v1";

// For sandbox testing, use these URLs instead:
// export const PAYPAL_OAUTH_URL = "https://www.sandbox.paypal.com/signin/authorize";
// export const PAYPAL_TOKEN_URL = "https://api-m.sandbox.paypal.com/v1/oauth2/token";
// export const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com/v1";

/**
 * Generate the PayPal OAuth authorization URL
 */
export function getPayPalAuthUrl(redirectUri: string): string {
	const params = new URLSearchParams({
		client_id: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
		response_type: "code",
		scope: "openid profile email https://uri.paypal.com/services/paypalattributes",
		redirect_uri: redirectUri,
	});

	return `${PAYPAL_OAUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangePayPalCode(code: string) {
	const auth = Buffer.from(
		`${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
	).toString("base64");

	const params = new URLSearchParams({
		grant_type: "authorization_code",
		code,
	});

	const response = await fetch(PAYPAL_TOKEN_URL, {
		method: "POST",
		headers: {
			Authorization: `Basic ${auth}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: params.toString(),
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`PayPal token exchange failed: ${text}`);
	}

	return response.json();
}

/**
 * Fetch transactions from PayPal API
 */
export async function fetchPayPalTransactions(accessToken: string) {
	// Get transactions from the last 30 days
	const endDate = new Date();
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 30);

	const params = new URLSearchParams({
		start_date: startDate.toISOString(),
		end_date: endDate.toISOString(),
		fields: "all",
	});

	const url = `${PAYPAL_API_BASE}/reporting/transactions?${params.toString()}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`PayPal API error: ${text}`);
	}

	return response.json();
}

/**
 * Aggregate PayPal transactions by day
 */
export function aggregateTransactionsByDay(transactions: any[]) {
	const dailyRevenue = new Map<string, number>();

	transactions.forEach((transaction) => {
		// Only count completed payments
		if (
			transaction.transaction_info?.transaction_status === "S" &&
			transaction.transaction_info?.transaction_amount?.value
		) {
			const date = new Date(transaction.transaction_info.transaction_initiation_date)
				.toISOString()
				.split("T")[0];
			const amount = parseFloat(
				transaction.transaction_info.transaction_amount.value
			);

			// Only count positive amounts (revenue, not refunds)
			if (amount > 0) {
				const existing = dailyRevenue.get(date) || 0;
				dailyRevenue.set(date, existing + amount);
			}
		}
	});

	// Convert to array and sort by date
	return Array.from(dailyRevenue.entries())
		.map(([date, amount]) => ({
			date,
			amount: parseFloat(amount.toFixed(2)),
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
}
