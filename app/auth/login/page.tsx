// login form
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
	const searchParams = useSearchParams();
	const authErr = searchParams.get("error");
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			setError(error.message);
		} else {
			router.push("/dashboard");
		}

		setLoading(false);
	}

	return (
		<div className='flex justify-center items-center min-h-screen'>
			<form onSubmit={handleLogin} className='bg-white shadow rounded p-6 w-80'>
				<h2 className='text-xl font-bold mb-4'>Login</h2>
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
					onClick={handleLogin}
					disabled={loading}
					className='bg-blue-600 text-white w-full py-2 rounded disabled:opacity-50'
				>
					{loading ? "Logging in..." : "Login"}
				</button>
			</form>
			{authErr && (
				<div className='bg-red-100 text-red-700 px-4 py-2 rounded mb-4'>
					{error === "stripe"
						? "There was an issue connecting your Stripe account. Please try again."
						: "An unexpected error occurred."}
				</div>
			)}
		</div>
	);
}
