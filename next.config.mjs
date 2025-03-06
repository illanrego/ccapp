/** @type {import('next').NextConfig} */
const nextConfig = {

	async headers() {
        return [
            {
                // matching all API routes
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, authorization" }, // Added authorization
                ]
            }
        ]
    },

    experimental: {
		serverComponentsExternalPackages: ["@node-rs/argon2"]
	}, 
	images: {
		remotePatterns: [
		  {
			protocol: "https",
			hostname: "i.pravatar.cc",
		  },
		  {
			protocol: "https",
			hostname: "images.unsplash.com",
		  },
		  {
			protocol: "https",
			hostname: "github.com",
		  },
		  {
			protocol: "https",
			hostname: 'coral-ready-gopher-979.mypinata.cloud',
		  },
		  {
			protocol: "https",
			hostname: 'replicate.delivery',
		  }
		],
	  },
};

export default nextConfig;
