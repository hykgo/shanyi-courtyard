# shanyi-courtyard

Cloudflare Pages project for the campus message wall.

## Structure

- public/index.html: static page
- functions/api/messages.js: Pages Functions API
- migrations/0001_create_messages.sql: D1 table
- wrangler.toml: Pages/D1 config

## Cloudflare setup

1. Bind D1 database `shanyi_messages` to Pages as `DB`.
2. Use `public` as the build output directory.
3. Leave build command empty.
4. Add `IP_HASH_SALT` in Pages environment variables if you want IP hashing.

## Local preview

```bash
npm install
npm run db:migrate:local
npm run dev
```
