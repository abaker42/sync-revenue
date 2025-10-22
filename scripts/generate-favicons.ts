// scripts/generate-favicons.ts
// Simplified version with better error handling
// Run with: npx tsx scripts/generate-favicons.ts

import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

// Simple SVG template for the icon
const generateIconSVG = (size: number) => {
	const scale = size / 100; // Base size 100
	const strokeWidth = 2.5 * scale;
	const arrowSize = 6 * scale;

	return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2D3142;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1d2e;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background rectangle with rounded corners -->
  <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="url(#bg)"/>
  
  <!-- Icon centered -->
  <g transform="translate(${size * 0.15}, ${size * 0.15})">
    <!-- Sync Arrows (rectangular with rounded corners) -->
    <!-- Top Arrow (Right to Left) -->
    <path d="M ${70 * scale} ${10 * scale} 
             L ${70 * scale} ${10 * scale} 
             Q ${70 * scale} ${10 * scale} ${70 * scale} ${10 * scale}
             L ${20 * scale} ${10 * scale}"
          stroke="#4ECDC4" 
          stroke-width="${strokeWidth}" 
          fill="none"
          stroke-linecap="round"/>
    <path d="M ${70 * scale} ${10 * scale} L ${70 * scale} ${40 * scale}"
          stroke="#4ECDC4" 
          stroke-width="${strokeWidth}" 
          fill="none"
          stroke-linecap="round"/>
    <!-- Top arrow head (pointing left) -->
    <polygon points="${15 * scale},${10 * scale} 
                      ${15 * scale + arrowSize},${10 * scale - arrowSize * 0.7} 
                      ${15 * scale + arrowSize},${
		10 * scale + arrowSize * 0.7
	}" 
             fill="#4ECDC4"/>
    
    <!-- Bottom Arrow (Left to Right) -->
    <path d="M ${30 * scale} ${60 * scale} 
             L ${30 * scale} ${60 * scale}
             L ${80 * scale} ${60 * scale}"
          stroke="#4ECDC4" 
          stroke-width="${strokeWidth}" 
          fill="none"
          stroke-linecap="round"/>
    <path d="M ${30 * scale} ${60 * scale} L ${30 * scale} ${30 * scale}"
          stroke="#4ECDC4" 
          stroke-width="${strokeWidth}" 
          fill="none"
          stroke-linecap="round"/>
    <!-- Bottom arrow head (pointing right) -->
    <polygon points="${85 * scale},${60 * scale} 
                      ${85 * scale - arrowSize},${60 * scale - arrowSize * 0.7} 
                      ${85 * scale - arrowSize},${
		60 * scale + arrowSize * 0.7
	}" 
             fill="#4ECDC4"/>
    
    <!-- Lock (centered) -->
    <g transform="translate(${35 * scale}, ${27 * scale})">
      <!-- Lock shackle -->
      <rect x="${5 * scale}" y="0" 
            width="${20 * scale}" height="${16 * scale}" 
            rx="${8 * scale}"
            fill="none" 
            stroke="#4ECDC4" 
            stroke-width="${strokeWidth}"/>
      <rect x="${5 * scale}" y="${8 * scale}" 
            width="${20 * scale}" height="${8 * scale}" 
            fill="url(#bg)"/>
      
      <!-- Lock body -->
      <rect x="0" y="${12 * scale}" 
            width="${30 * scale}" height="${18 * scale}" 
            rx="${2 * scale}"
            fill="#4ECDC4"/>
      
      <!-- Keyhole -->
      <circle cx="${15 * scale}" cy="${19 * scale}" 
              r="${3 * scale}" 
              fill="#2D3142"/>
      <rect x="${13.5 * scale}" y="${19 * scale}" 
            width="${3 * scale}" height="${6 * scale}" 
            fill="#2D3142"/>
    </g>
  </g>
</svg>
  `.trim();
};

// Favicon sizes to generate
const FAVICON_SIZES: Record<string, number> = {
	"favicon-16x16.png": 16,
	"favicon-32x32.png": 32,
	"favicon-48x48.png": 48,
	"apple-touch-icon.png": 180,
	"android-chrome-192x192.png": 192,
	"android-chrome-512x512.png": 512,
	"icon-192.png": 192,
	"icon-512.png": 512,
};

async function generateFavicons() {
	console.log("🎨 Starting RevenueSync favicon generation...\n");
	console.log("📍 Current directory:", process.cwd());

	const publicDir = path.join(process.cwd(), "public");
	console.log("📂 Public directory:", publicDir);

	try {
		// Ensure public directory exists
		await fs.mkdir(publicDir, { recursive: true });
		console.log("✅ Public directory ready\n");
	} catch (error) {
		console.error("❌ Failed to create public directory:", error);
		return;
	}

	// Generate each size
	let successCount = 0;
	let failCount = 0;

	for (const [filename, size] of Object.entries(FAVICON_SIZES)) {
		try {
			console.log(`🔨 Generating ${filename} (${size}x${size})...`);

			const svg = generateIconSVG(size);
			const svgBuffer = Buffer.from(svg);

			// Convert SVG to PNG
			await sharp(svgBuffer)
				.png()
				.resize(size, size)
				.toFile(path.join(publicDir, filename));

			console.log(`✅ ${filename} created successfully`);
			successCount++;
		} catch (error) {
			console.error(`❌ Failed to generate ${filename}:`, error);
			failCount++;
		}
	}

	console.log("\n" + "=".repeat(50));
	console.log(`✅ Success: ${successCount} files`);
	console.log(`❌ Failed: ${failCount} files`);
	console.log("=".repeat(50));

	// Generate web manifest
	try {
		console.log("\n📝 Generating site.webmanifest...");

		const manifest = {
			name: "RevenueSync",
			short_name: "RevenueSync",
			description: "Unify your online income",
			icons: [
				{
					src: "/icon-192.png",
					sizes: "192x192",
					type: "image/png",
				},
				{
					src: "/icon-512.png",
					sizes: "512x512",
					type: "image/png",
				},
			],
			theme_color: "#4ECDC4",
			background_color: "#2D3142",
			display: "standalone",
			start_url: "/",
		};

		await fs.writeFile(
			path.join(publicDir, "site.webmanifest"),
			JSON.stringify(manifest, null, 2)
		);

		console.log("✅ site.webmanifest created");
	} catch (error) {
		console.error("❌ Failed to generate site.webmanifest:", error);
	}

	console.log("\n✨ Generation complete!\n");
	console.log("📋 Next steps:");
	console.log("1. Check your public/ folder for the generated files");
	console.log("2. Add favicon links to your HTML <head>");
	console.log("3. Test by hard-refreshing your browser (Ctrl+Shift+R)\n");
}

// Run the script
generateFavicons().catch((error) => {
	console.error("💥 Fatal error:", error);
	process.exit(1);
});
