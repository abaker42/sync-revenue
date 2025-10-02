import Link from "next/link";

export default function NotFound() {
	return (
		<div className='flex min-h-screen flex-col items-center justify-center bg-gray-100 text-center p-4'>
			<h2 className='text-4xl font-bold text-gray-800 mb-4'>
				404 - Page Not Found
			</h2>
			<p className='text-gray-600 mb-6'>
				Sorry, the page you&apos;re looking for doesn&apos;t exist or has been
				moved.
			</p>
			<Link
				href='/'
				className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'
			>
				Go back home
			</Link>
		</div>
	);
}
