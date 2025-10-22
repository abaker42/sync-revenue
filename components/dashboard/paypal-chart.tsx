"use client";
import { useEffect, useState } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
} from "recharts";

type Point = { date: string; amount: number };

export default function PayPalChart() {
	const [data, setData] = useState<Point[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		fetch("/api/integrations/paypal")
			.then((res) => {
				if (!res.ok) {
					if (res.status === 404) {
						throw new Error("PayPal not connected");
					}
					throw new Error("Failed to fetch PayPal data");
				}
				return res.json();
			})
			.then((json) => {
				if (json.dailyRevenue) {
					setData(json.dailyRevenue as Point[]);
				}
			})
			.catch((err) => {
				console.error(err);
				setError(err.message);
			})
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <div className='p-4'>Loading PayPal data…</div>;
	if (error) return <div className='p-4 text-gray-500'>{error}</div>;
	if (!data || data.length === 0)
		return <div className='p-4'>No PayPal data found.</div>;

	return (
		<div className='bg-white shadow rounded p-4'>
			<h3 className='font-semibold mb-4'>PayPal Revenue (Daily)</h3>
			<div style={{ width: "100%", height: 240 }}>
				<ResponsiveContainer>
					<LineChart data={data}>
						<CartesianGrid strokeDasharray='3 3' />
						<XAxis dataKey='date' />
						<YAxis />
						<Tooltip />
						<Line
							type='monotone'
							dataKey='amount'
							stroke='#0070ba'
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
