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

# Check application lint and generated icons
check:
    pnpm lint
    pnpm check:icons
