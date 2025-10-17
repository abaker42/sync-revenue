// login form
"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function Login() {
	const searchParams = useSearchParams();
	const authErr = searchParams.get("error");
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const supabase = createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	);

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

export default function LoginPage() {
	// Wrapping in Suspense is optional but future-proof.
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Login />
		</Suspense>
	);
}