//This layout will wrap all dashboard pages and enforce authorization to view.
export const dynamic = "force-dynamic";// allows me to read cookies dynamically

//import { createClient } from '@/lib/supabase-server'
//import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/logout";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Get current session
	// const supabase = await createClient();
	// const {
	// 	data: { session },
	// } = await supabase.auth.getSession();

	// // If no session, redirect to login
	// if (!session) {
	// 	redirect("/auth/login");
	// }

	return (
		<div>
			<nav className='flex justify-between items-center p-4 border-b bg-white shadow'>
				<h1 className='font-bold'>RevenueSync</h1>
				<LogoutButton />
			</nav>
			<main className='p-8'>{children}</main>
		</div>
	);
}
