# Hous Lab 统计后端

Cloudflare Worker + KV，为静态博客提供：浏览量 / 点赞 / 国家级访客聚合（世界地图数据源）。

## 部署（首次，约 5 分钟）

前置：一个 Cloudflare 账号（免费档即可，无需绑卡）。以下命令都在**仓库根目录**执行。

```bash
# 1. 登录 Cloudflare（弹出浏览器授权页，点 Allow）
npm run worker:login

# 2. 创建 KV 命名空间，命令会输出一段 id
npm run worker:kv:create
#    把 id 粘贴到 worker/wrangler.jsonc 里替换 REPLACE_WITH_KV_NAMESPACE_ID

# 3. 部署
npm run worker:deploy
#    输出的 URL 形如 https://hous-lab-stats.<你的子域>.workers.dev
#    把它填到 src/consts.ts 的 STATS_API（PROD 一行）
```

本地联调（不需要 CF 账号，KV 为内存模拟）：

```bash
npm run worker:dev   # http://localhost:8787
```

模拟不同国家的访客（仅本地生效）：

```bash
curl -X POST localhost:8787/view -H 'content-type: application/json' \
  -H 'x-test-country: JP' -d '{"page":"/notes/"}'
```

## 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/view` `{page}` | 浏览计数（IP+UA+页 24h 去重）→ `{views, likes, liked}` |
| POST | `/like` `{page}` | 点赞/取消切换（HttpOnly Cookie，一年）→ `{likes, liked}` |
| GET | `/stats?page=/x/` | 单页计数 |
| GET | `/map` | `{countries:{CC:n}, totalViews, totalLikes}` |
| GET | `/top?limit=10` | 浏览量 Top 页面 |

`page` 规范：以 `/` 开头、单一尾斜杠（如 `/notes/foo/`）、`[A-Za-z0-9-._~/]`、≤200 字符。

## 设计边界（有意为之）

- **非原子计数**：KV 是 read-modify-write，并发首访可能少计 1。个人博客可接受；
  需要严格一致时升级为 Durable Objects（SQLite DO，免费档 13k 写/天）。
- **免费配额**：Workers 100k 请求/天；**KV 写 1,000/天**。每次独立访问约 3 写
  （页计数 + 国家计数 + 去重键）≈ 支撑 ~300 独立访客/天。超出后再考虑 DO 或采样。
- **国内访问**：`workers.dev` 域名在大陆不稳定。前端已做静默降级（接口不通则隐藏
  计数区，不影响阅读）。长期方案：绑定自有域名走 Cloudflare CDN。
- **隐私**：不存原始 IP/UA（仅日盐哈希做去重，TTL 24h）；地理仅国家级聚合；
  唯一 Cookie 是点赞状态位，无跟踪用途。

## 数据结构

```
v:{pathname}   浏览量（数字字符串）
l:{pathname}   点赞数
c:{CC}         国家聚合（ISO 3166-1 alpha-2）
d:{sha256}     24h 去重键（expirationTtl 自动过期）
```
