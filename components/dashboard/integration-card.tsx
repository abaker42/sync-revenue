"use client";

import { useEffect, useState } from "react";

type IntegrationStatus = {
	connected: boolean;
	userId?: string;
} | null;

type StatusResponse = {
	stripe: IntegrationStatus;
	gumroad: IntegrationStatus;
	paypal: IntegrationStatus;
	lemonsqueezy: IntegrationStatus;
};

export default function IntegrationCard({ name }: { name: string }) {
	const [status, setStatus] = useState<IntegrationStatus>(null);
	const [loading, setLoading] = useState(true);

	const stripeConnectUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_write&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/stripe/callback`;
	const gumroadConnectUrl = `/api/integrations/gumroad/connect`;
	const paypalConnectUrl = `/api/integrations/paypal/connect`;
	const lemonSqueezyConnectUrl = `/api/integrations/lemonsqueezy/connect`;

	let connectUrl = "";
	let providerKey = "";

	switch (name) {
		case "Gumroad":
			connectUrl = gumroadConnectUrl;
			providerKey = "gumroad";
			break;
		case "PayPal":
			connectUrl = paypalConnectUrl;
			providerKey = "paypal";
			break;
		case "Lemon Squeezy":
			connectUrl = lemonSqueezyConnectUrl;
			providerKey = "lemonsqueezy";
			break;
		case "Stripe":
			connectUrl = stripeConnectUrl;
			providerKey = "stripe";
			break;
		default:
			throw new Error(`Unknown integration name: ${name}`);
	}

	useEffect(() => {
		fetch("/api/integrations/status")
			.then((res) => res.json())
			.then((data: StatusResponse) => {
				setStatus(data[providerKey as keyof StatusResponse]);
			})
			.catch(console.error)
			.finally(() => setLoading(false));
	}, [providerKey]);

	const handleConnect = () => {
		if (!status?.connected) {
			window.location.href = connectUrl;
		}
	};

	const isConnected = status?.connected || false;
	const buttonText = isConnected
		? status?.userId || "Connected"
		: "Connect";

	return (
		<div className='bg-white shadow rounded p-4 flex justify-between items-center'>
			<span className='font-medium'>{name}</span>
			<button
				className={`px-3 py-1 rounded transition-colors ${
					isConnected
						? "bg-gray-400 text-white cursor-not-allowed"
						: "bg-blue-600 text-white hover:bg-blue-700"
				}`}
				onClick={handleConnect}
				disabled={isConnected || loading}
			>
				{loading ? "..." : buttonText}
			</button>
		</div>
	);
}
