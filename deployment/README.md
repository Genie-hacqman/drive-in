# Production deployment

This deployment shape uses:

- Managed PostgreSQL for durable application data.
- Managed Redis for shared rate limits across all API workers.
- PM2 cluster mode for multiple API workers on one host.
- Nginx for HTTPS termination, static frontend hosting, API proxying, and WebSocket forwarding.
- `/api/health/ready` for load-balancer readiness checks.
- `/api/metrics` for Prometheus-compatible basic process metrics.

## Required production environment

Set these values in the production environment, never in Git:

```env
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://example.com
BACKEND_URL=https://example.com
TRUST_PROXY_HOPS=1
DATABASE_URL=postgresql://user:password@managed-postgres-host:5432/showroom?sslmode=require
DB_POOL_MAX=20
DB_IDLE_TIMEOUT_MS=30000
DB_CONNECTION_TIMEOUT_MS=5000
REDIS_URL=rediss://default:password@managed-redis-host:6379
SESSION_SECRET=generate-a-long-random-value
CSRF_SECRET=generate-a-different-long-random-value
```

`REDIS_URL` is mandatory when `NODE_ENV=production`. Use your provider's TLS URL (`rediss://`) when available.

## Managed PostgreSQL

Create a production database with your provider, enable automated backups and point-in-time recovery, then use its SSL connection string as `DATABASE_URL`. Set `DB_POOL_MAX` according to the provider connection limit and the number of API instances. Keep the total across all instances below the provider limit.

## Managed Redis

Create a Redis instance, enable TLS where supported, and place its URL in `REDIS_URL`. All API workers must use the same Redis instance so rate-limit counters are shared.

## Deploy

From the repository root:

```bash
cd frontend && npm ci && npm run build
cd ../backend && npm ci
cd ../deployment
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

Copy `nginx.conf` to your Nginx configuration directory, replace `example.com`, point the frontend `root` at the built `frontend/dist`, and obtain certificates with Certbot:

```bash
sudo certbot --nginx -d example.com -d www.example.com
sudo nginx -t
sudo systemctl reload nginx
```

Set the load balancer health check to:

```text
GET /api/health/ready
```

Protect `/api/metrics` behind your monitoring network or an authenticated proxy before exposing it publicly.
