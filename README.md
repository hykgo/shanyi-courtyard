# 山艺文艺小院 Cloudflare Pages 留言版

这个项目使用纯 Cloudflare 生态：

- `public/index.html`：手机端 H5 页面
- `functions/api/messages.js`：Pages Functions API
- `migrations/0001_create_messages.sql`：D1 留言表
- `wrangler.toml`：Cloudflare Pages/D1 配置

## 你需要在 Cloudflare 操作

1. 登录 Cloudflare，创建一个 D1 数据库，建议命名为 `shanyi_messages`。
2. 把 D1 的 `database_id` 填到 `wrangler.toml` 里的 `database_id`。
3. 创建 Turnstile 站点，拿到 `Site Key` 和 `Secret Key`。
4. 把 `Site Key` 填到 `public/index.html`：

```html
<meta name="turnstile-site-key" content="你的 Site Key">
```

5. 在 Cloudflare Pages 项目的环境变量里添加：

```text
TURNSTILE_SECRET_KEY=你的 Secret Key
IP_HASH_SALT=任意一串长随机字符
```

6. 在 Pages 项目里绑定 D1：

```text
Binding name: DB
Database: shanyi_messages
```

7. 执行远程数据库迁移：

```bash
npm install
npm run db:migrate:remote
```

8. 部署 Pages。构建设置可以留空：

```text
Build command: 留空
Build output directory: public
```

## 本地开发

```bash
npm install
npm run db:migrate:local
npm run dev
```

访问 Wrangler 给出的本地地址即可。

## API

- `GET /api/messages?limit=30`：读取最近留言
- `POST /api/messages`：提交留言

提交格式：

```json
{
  "name": "26级萌新",
  "content": "想来小院看看日落。",
  "turnstileToken": "前端 Turnstile token"
}
```

如果暂时不配置 Turnstile，后端会跳过验证，方便先跑通流程。正式公开二维码前建议一定配置 Turnstile。
