export default function IntegrationCard({ name }: { name: string }) {
	return (
		<div className='bg-white shadow rounded p-4 flex justify-between items-center'>
			<span className='font-medium'>{name}</span>
			<button className='bg-blue-600 text-white px-3 py-1 rounded'>
				Connect
			</button>
		</div>
	);
}
