// register form
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleRegister(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) {
			setError(error.message);
			setLoading(false);
			return;
		}

		// Wait for Supabase to set cookies
		const { data: sessionData } = await supabase.auth.getSession();
		if (!sessionData?.session) {
			setError("Unable to create a session. Please try again.");
			setLoading(false);
			return;
		}

		// Optional: double-check in browser that cookie exists
		console.log("Session established:", sessionData.session.user.email);

		// Now safe to navigate
		router.push("/dashboard");
		setLoading(false);
	}

	return (
		<div className='flex justify-center items-center min-h-screen'>
			<form
				onSubmit={handleRegister}
				className='bg-white shadow rounded p-6 w-80'
			>
				<h2 className='text-xl font-bold mb-4'>Sign Up</h2>
				{error && <p className='text-red-600 mb-2'>{error}</p>}
				<input
					type='email'
					placeholder='Email'
					className='w-full border p-2 mb-3 rounded'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<input
					type='password'
					placeholder='Password'
					className='w-full border p-2 mb-3 rounded'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button
					type='submit'
					disabled={loading}
					className='bg-blue-600 text-white w-full py-2 rounded disabled:opacity-50'
				>
					{loading ? "Signing up..." : "Sign Up"}
				</button>
			</form>
		</div>
	);
}
