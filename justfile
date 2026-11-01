default:
    @just --list

# Start the Vite development server with hot reload
dev:
    pnpm dev

# Generate the static site into dist/
build:
    pnpm build

# Build dist/ and deploy it to Vercel production
deploy: build
    vercel --prod

# Check application types and lint
check:
    pnpm exec tsc -b
    pnpm lint
