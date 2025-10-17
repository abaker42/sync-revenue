"use client";


import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
	const router = useRouter();
	const supabase = createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	);

	async function handleLogout() {
		await supabase.auth.signOut();
		router.push("/");
	}

	return (
		<button
			onClick={handleLogout}
			className='bg-gray-200 px-3 py-1 rounded hover:bg-gray-300'
		>
			Logout
		</button>
	);
}
