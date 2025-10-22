import "./globals.css";
import { ReactNode } from "react";

import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "RevenueSync",
	description: "Unify your online income",
	icons: {
		icon: [
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
		],
		apple: [
			{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
		],
	},
	manifest: "/site.webmanifest",
	themeColor: "#4ECDC4",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang='en'>
			<body className='bg-gray-50 text-gray-900'>
				<div className='min-h-screen flex flex-col'>
					<nav className='w-full bg-white shadow p-4 flex justify-between'>
						<span className='font-bold'>Revenue Sync</span>
						<div>
							<a href='/auth/login' className='mr-4'>
								Login
							</a>
							<a
								href='/auth/register'
								className='bg-blue-600 text-white px-4 py-2 rounded'
							>
								Sign Up
							</a>
						</div>
					</nav>
					<main className='flex-1'>{children}</main>
					<footer className='p-4 text-center text-sm border-t'>
						© 2025 Revenue Sync
					</footer>
				</div>
			</body>
		</html>
	);
}
