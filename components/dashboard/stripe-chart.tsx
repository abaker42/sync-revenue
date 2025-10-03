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

export default function StripeChart() {
	const [data, setData] = useState<Point[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		fetch("/api/integrations/stripe")
			.then((res) => res.json())
			.then((json) => {
				if (json.data) setData(json.data as Point[]);
			})
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <div className='p-4'>Loading Stripe data…</div>;
	if (!data || data.length === 0)
		return <div className='p-4'>No Stripe data found.</div>;

	return (
		<div className='bg-white shadow rounded p-4'>
			<h3 className='font-semibold mb-4'>Stripe Revenue (Daily)</h3>
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
							stroke='#4f46e5'
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
