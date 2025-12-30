# Cloudflare Workers Full-Stack Template

[cloudflarebutton]

A production-ready full-stack application template powered by Cloudflare Workers. Features a modern React frontend with shadcn/ui components, a Hono-based API backend with Durable Objects for persistent state, and seamless TypeScript integration.

## ✨ Features

- **Full-Stack Ready**: React 18 frontend + Hono API backend in a single deploy
- **Stateful Backend**: Cloudflare Durable Objects for counters, data persistence, and real-time features
- **Modern UI**: shadcn/ui components with Tailwind CSS and custom animations
- **Data Fetching**: TanStack Query for optimistic updates, caching, and mutations
- **Type-Safe**: End-to-end TypeScript with shared types between frontend and worker
- **Development UX**: Vite hot reload for frontend, live reloading for worker API
- **Responsive Design**: Mobile-first with dark mode support and sidebar layouts
- **Production Optimized**: Automatic bundling, Tailwind purging, and Cloudflare assets handling
- **Error Handling**: Global error boundaries and client error reporting to worker API

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 18, Vite, TypeScript, shadcn/ui, Tailwind CSS, TanStack Query, React Router, Lucide Icons, Sonner (Toasts), Framer Motion |
| **Backend** | Cloudflare Workers, Hono, Durable Objects |
| **Styling** | Tailwind CSS, Tailwind Animate, CSS Variables |
| **State** | Zustand, Immer |
| **Utilities** | clsx, tw-merge, date-fns, UUID |
| **Dev Tools** | Bun, ESLint, TypeScript, Wrangler |

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed (`curl -fsSL https://bun.sh/install | bash`)
- [Cloudflare CLI (Wrangler)](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`bunx wrangler@latest init` or `npm i -g wrangler`)
- Cloudflare account with Workers enabled

### Installation

```bash
bun install
```

### Development

Start the development server (frontend on `:3000`, API on same origin via proxy):

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Hot Reload**: Frontend changes hot-reload instantly. API routes auto-reload via dynamic import.

**Type Generation**: Regenerate Worker types after changes:

```bash
bunx wrangler types
```

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server (frontend + API proxy) |
| `bun run build` | Build for production |
| `bun run lint` | Run ESLint |
| `bun run preview` | Local preview of production build |
| `bun run deploy` | Build + deploy to Cloudflare |
| `bunx wrangler types` | Generate Worker TypeScript types |
| `bunx wrangler dev` | Direct Worker dev (no frontend) |

## 🚀 Deployment

Deploy to Cloudflare Workers with Pages/Assets support (SPA routing preserved):

1. Authenticate with Wrangler:
   ```bash
   bunx wrangler login
   bunx wrangler whoami
   ```

2. Deploy:
   ```bash
   bun run deploy
   ```

Or use the one-click deploy button:

[cloudflarebutton]

Your app will be live at `https://<worker-name>.<your-subdomain>.workers.dev`.

**Custom Domain**: Edit `wrangler.jsonc` and run `bunx wrangler deploy --env production`.

**Durable Objects**: Automatically provisioned via migrations in `wrangler.jsonc`.

## 📚 Usage

### Backend API (Hono + Durable Objects)

Extend routes in `worker/userRoutes.ts`. Example endpoints (already included):

```
GET    /api/test              → Basic health check
GET    /api/demo              → Fetch demo items (Durable Object storage)
POST   /api/demo              → Add item
PUT    /api/demo/:id          → Update item
DELETE /api/demo/:id          → Delete item
GET    /api/counter           → Get counter value
POST   /api/counter/increment → Increment counter
```

Shared types in `shared/types.ts` provide full type safety.

### Frontend Customization

- **Pages**: Edit `src/pages/HomePage.tsx` or add routes in `src/main.tsx`
- **Components**: Use shadcn/ui from `@/components/ui/*`
- **Layout**: Wrap pages with `AppLayout` for sidebar (`src/components/layout/AppLayout.tsx`)
- **Hooks**: `useTheme`, `useMobile`, TanStack Query defaults
- **Error Reporting**: Automatic client errors POST to `/api/client-errors`

### Data Fetching Example (TanStack Query)

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['demo'],
  queryFn: async () => {
    const res = await fetch('/api/demo');
    return ApiResponse.parse(await res.json());
  },
});
```

## 🧪 Testing the Durable Objects

- Counter persists across requests: `curl /api/counter`, then `/api/counter/increment`
- Demo items stored in SQLite-backed Durable Object: CRUD via `/api/demo*`

## 🤝 Contributing

1. Fork and clone
2. Install: `bun install`
3. Develop: `bun run dev`
4. PR to `main`

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

Built with ❤️ for Cloudflare Workers.