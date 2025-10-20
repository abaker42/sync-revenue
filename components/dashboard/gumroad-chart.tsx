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

export default function GumroadChart() {
	const [data, setData] = useState<Point[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		fetch("/api/integrations/gumroad")
			.then((res) => {
				if (!res.ok) {
					if (res.status === 404) {
						throw new Error("Gumroad not connected");
					}
					throw new Error("Failed to fetch Gumroad data");
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

	if (loading) return <div className='p-4'>Loading Gumroad data…</div>;
	if (error) return <div className='p-4 text-gray-500'>{error}</div>;
	if (!data || data.length === 0)
		return <div className='p-4'>No Gumroad data found.</div>;

	return (
		<div className='bg-white shadow rounded p-4'>
			<h3 className='font-semibold mb-4'>Gumroad Revenue (Daily)</h3>
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
							stroke='#ff90e8'
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
