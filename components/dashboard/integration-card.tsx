import { redirect } from "next/navigation";

export default function IntegrationCard({ name }: { name: string }) {
    const stripeConnectUrl = 
    `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_write&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URL}`;
    const gumroadConnectUrl = `/api/integrations/gumroad/connect`;
    const paypalConnectUrl = `/api/integrations/paypal/connect`;
    const lemonSqueezyConnectUrl = `/api/integrations/lemonsqueezy/connect`;
    let connectUrl = "";
    switch (name) {
        case "Gumroad":
        connectUrl = gumroadConnectUrl;
        break;
        case "PayPal":
        connectUrl = paypalConnectUrl;
        break;
        case "Lemon Squeezy":
        connectUrl = lemonSqueezyConnectUrl;
        break;
        case "Stripe":
        connectUrl = stripeConnectUrl;
            break;
        default:
            throw new Error(`Unknown integration name: ${name}`);
    }
    
    if (name === "Gumroad") connectUrl = gumroadConnectUrl;
    if (name === "PayPal") connectUrl = paypalConnectUrl;
    if (name === "Lemon Squeezy") connectUrl = lemonSqueezyConnectUrl;
    if (name === "Stripe") connectUrl = stripeConnectUrl;
    
	return (
		<div className='bg-white shadow rounded p-4 flex justify-between items-center'>
			<span className='font-medium'>{name}</span>
			<button className='bg-blue-600 text-white px-3 py-1 rounded'
                onClick={redirect(connectUrl)}>
				Connect
			</button>
		</div>
	);
}
