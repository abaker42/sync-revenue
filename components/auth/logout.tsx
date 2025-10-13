"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
	const supabase = createSupabaseBrowserClient();
	const router = useRouter();

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
