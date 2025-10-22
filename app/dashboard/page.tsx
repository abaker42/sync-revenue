import RevenueSummary from "@/components/dashboard/revenue-summary";
import IntegrationCard from "@/components/dashboard/integration-card";
import StripeChart from "@/components/dashboard/stripe-chart";
import GumroadChart from "@/components/dashboard/gumroad-chart";
import PayPalChart from "@/components/dashboard/paypal-chart";

export default function DashboardPage() {
	return (
		<div className='p-8 space-y-6'>
			<h2 className='text-2xl font-bold'>Dashboard</h2>
			<h2 className='text-2xl font-bold mb-6'>Welcome back 👋</h2>
			<p>This is your unified revenue dashboard.</p>
			<RevenueSummary />
            <StripeChart />
			<GumroadChart />
			<PayPalChart />
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<IntegrationCard name='Stripe' />
				<IntegrationCard name='Gumroad' />
				<IntegrationCard name='PayPal' />
				<IntegrationCard name='Lemon Squeezy' />
			</div>
		</div>
	);
}
