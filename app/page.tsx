export default function HomePage() {
	return (
		<section className='flex flex-col items-center justify-center text-center py-20 px-6'>
			<h1 className='text-4xl font-bold mb-4'>
				Unify Your Revenue Streams in One Dashboard
			</h1>
			<p className='max-w-xl mb-6 text-gray-600'>
				Revenue Sync helps solo founders view Stripe, Gumroad, PayPal, and
				Lemon Squeezy income in one place.
			</p>
			<div className='space-x-4'>
				<a
					href='/auth/register'
					className='bg-blue-600 text-white px-6 py-3 rounded-lg'
				>
					Free Download
				</a>
				<a href='#waitlist' className='bg-gray-200 px-6 py-3 rounded-lg'>
					Upgrade Coming Soon
				</a>
			</div>
		</section>
	);
}
