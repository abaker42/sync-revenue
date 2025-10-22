// RevenueSync Logo Component

type LogoSize = "small" | "default" | "large";

interface RevenueSyncProps {
	size?: LogoSize;
	className?: string;
}

const RevenueSync: React.FC<RevenueSyncProps> = ({
	size = "default",
	className = ""
}) => {
	const sizes: Record<LogoSize, string> = {
		small: "text-2xl",
		default: "text-5xl",
		large: "text-7xl",
	};

	return (
		<div
			className={`inline-flex items-center gap-1 font-extrabold tracking-tight ${sizes[size]} ${className}`}
		>
			<span className='text-[#2D3142]'>Revenue</span>

			{/* Icon Container */}
			<div className='relative inline-flex items-center justify-center w-[0.9em] h-[0.9em]'>
				{/* Sync Arrows */}
				<div className='absolute inset-0'>
					{/* Top Arrow (Right to Left) */}
					<div className='absolute top-0 right-0 w-[75%] h-[50%] border-[0.11em] border-[#2D3142] border-b-0 border-l-0 rounded-tr-[0.25em]'>
						<div className='absolute top-[-0.11em] left-[-0.35em] w-0 h-0 border-r-[0.22em] border-r-transparent border-t-[0.22em] border-t-transparent border-l-[0.3em] border-l-[#4ECDC4] border-b-[0.22em] border-b-transparent'></div>
					</div>

					{/* Bottom Arrow (Left to Right) */}
					<div className='absolute bottom-0 left-0 w-[75%] h-[50%] border-[0.11em] border-[#2D3142] border-t-0 border-r-0 rounded-bl-[0.25em]'>
						<div className='absolute bottom-[-0.11em] right-[-0.35em] w-0 h-0 border-l-[0.22em] border-l-transparent border-b-[0.22em] border-b-transparent border-r-[0.3em] border-r-[#4ECDC4] border-t-[0.22em] border-t-transparent'></div>
					</div>
				</div>

				{/* Lock */}
				<div className='absolute w-[0.38em] h-[0.46em] z-10'>
					{/* Shackle */}
					<div className='absolute top-0 w-full h-[55%] border-[0.09em] border-[#4ECDC4] border-b-0 rounded-t-[0.21em]'></div>
					{/* Body */}
					<div className='absolute bottom-0 w-full h-[50%] bg-[#4ECDC4] rounded-[0.08em] flex items-center justify-center'>
						{/* Keyhole */}
						<div className='relative w-[0.08em] h-[0.15em] bg-white rounded-t-[0.04em]'>
							<div
								className='absolute bottom-[-0.08em] left-1/2 -translate-x-1/2 w-[0.08em] h-[0.1em] bg-white'
								style={{
									clipPath: "polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)",
								}}
							></div>
						</div>
					</div>
				</div>
			</div>

			<span className='text-[#4ECDC4]'>Sync</span>
		</div>
	);
};

export default RevenueSync;

// Usage Examples:
// 
// Default size:
// <RevenueSync />
//
// Small size (navbar):
// <RevenueSync size="small" />
//
// Large size (hero):
// <RevenueSync size="large" />
//
// With custom classes:
// <RevenueSync className="mb-4 hover:opacity-80 transition-opacity" />
//
// Custom sizing (override text size):
// <RevenueSync className="text-6xl" />