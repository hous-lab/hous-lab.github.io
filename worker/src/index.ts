/**
 * Hous Lab 统计后端 — Cloudflare Worker + KV
 *
 * 端点：
 *   POST /view   {page}      浏览计数（按 IP+UA+页 24h 去重），返回 {views, likes, liked}
 *   POST /like   {page}      点赞/取消切换（Cookie 判定），返回 {likes, liked}
 *   GET  /stats?page=/path/  单页计数，返回 {views, likes, liked}
 *   GET  /map                国家聚合 + 总量，返回 {countries, totalViews, totalLikes}
 *   GET  /top?limit=10       浏览量 Top 页面，返回 [{page, views}]
 *
 * 隐私：不存原始 IP / UA —— 仅存日盐 SHA-256 去重键（TTL 24h）与国家级聚合值。
 * 已知边界（见 README）：KV 计数为非原子 read-modify-write；免费档写配额 1,000/天。
 */

export interface Env {
  STATS: KVNamespace;
}

const ALLOWED_ORIGINS = new Set([
  'https://hous-lab.github.io',
  'http://localhost:4321',
  'http://127.0.0.1:4321',
]);

// ---------- 工具 ----------

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') ?? '';
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : '';
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'content-type,x-test-country',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
  if (allowed) headers['Access-Control-Allow-Origin'] = allowed;
  return headers;
}

function json(request: Request, body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers({
    'content-type': 'application/json;charset=UTF-8',
    'cache-control': 'no-store',
    ...corsHeaders(request),
    ...(init.headers as Record<string, string> | undefined),
  });
  return new Response(JSON.stringify(body), { ...init, headers });
}

/** 规范化页面路径：以 / 开头、单一尾斜杠、字符白名单、长度上限。 */
function normalizePage(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.length > 200) return null;
  if (raw.includes('//') || raw.includes('?') || raw.includes('#')) return null;
  if (!/^[A-Za-z0-9\-._~/]+$/.test(raw)) return null;
  return raw === '/' ? '/' : raw.replace(/\/+$/, '') + '/';
}

async function sha256hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function isLocal(request: Request): boolean {
  const host = new URL(request.url).hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

/**
 * 国家代码：线上取 CF 边缘信息；本地 dev 的 request.cf 是 miniflare 默认值
 * （不可信），因此本地只认显式的 X-Test-Country 模拟头、无头则不计国家。
 * 生产环境完全忽略该请求头，不存在伪造面。
 */
function getCountry(request: Request): string | null {
  if (isLocal(request)) {
    const test = request.headers.get('x-test-country');
    if (test && /^[A-Za-z]{2}$/.test(test)) return test.toUpperCase();
    return null;
  }
  const cf = (request as { cf?: { country?: string } }).cf;
  if (cf?.country && /^[A-Za-z]{2}$/.test(cf.country)) return cf.country.toUpperCase();
  return null;
}

// ---------- KV 读写 ----------

async function kvGetNum(env: Env, key: string): Promise<number> {
  const v = await env.STATS.get(key);
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

async function kvAdd(env: Env, key: string, delta: number): Promise<number> {
  const current = await kvGetNum(env, key);
  const next = Math.max(0, current + delta);
  await env.STATS.put(key, String(next));
  return next;
}

async function sumPrefix(env: Env, prefix: string): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  let cursor: string | undefined;
  do {
    const list = await env.STATS.list({ prefix, cursor });
    const keys = list.keys.map((k) => k.name);
    const values = await Promise.all(keys.map((k) => kvGetNum(env, k)));
    keys.forEach((k, i) => out.set(k.slice(prefix.length), values[i]));
    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor);
  return out;
}

// ---------- 点赞 Cookie ----------

function likeCookieName(page: string): Promise<string> {
  return sha256hex(page).then((h) => `lk_${h.slice(0, 12)}`);
}

function parseCookies(request: Request): Map<string, string> {
  const cookies = new Map<string, string>();
  const header = request.headers.get('Cookie');
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq > 0) cookies.set(part.slice(0, eq).trim(), part.slice(eq + 1).trim());
  }
  return cookies;
}

function buildLikeCookie(name: string, liked: boolean, request: Request): string {
  const local = isLocal(request);
  // 跨站 cookie（github.io 页面 → workers.dev 接口）必须 SameSite=None; Secure；
  // 本地 http 联调用 Lax 即可。
  const attrs = [
    `${name}=1`,
    'Path=/',
    'Max-Age=31536000',
    'HttpOnly',
    local ? 'SameSite=Lax' : 'SameSite=None; Secure',
  ];
  return liked ? attrs.join('; ') : `${name}=; Path=/; Max-Age=0; HttpOnly`;
}

// ---------- 路由 ----------

async function handleView(env: Env, request: Request, page: string): Promise<Response> {
  const ip = request.headers.get('CF-Connecting-IP') ?? '0.0.0.0';
  const ua = request.headers.get('User-Agent') ?? '';
  const day = new Date().toISOString().slice(0, 10);
  const dedupeKey = `d:${await sha256hex(`${ip}|${ua}|${page}|${day}`)}`;

  const seen = await env.STATS.get(dedupeKey);
  if (seen === null) {
    await env.STATS.put(dedupeKey, '1', { expirationTtl: 86400 });
    await kvAdd(env, `v:${page}`, 1);
    const country = getCountry(request);
    if (country) await kvAdd(env, `c:${country}`, 1);
  }

  const cookieName = await likeCookieName(page);
  const liked = parseCookies(request).has(cookieName);
  const [views, likes] = await Promise.all([
    kvGetNum(env, `v:${page}`),
    kvGetNum(env, `l:${page}`),
  ]);
  return json(request, { views, likes, liked });
}

async function handleLike(env: Env, request: Request, page: string): Promise<Response> {
  const cookieName = await likeCookieName(page);
  const liked = !parseCookies(request).has(cookieName);
  const likes = await kvAdd(env, `l:${page}`, liked ? 1 : -1);
  return json(request, { likes, liked }, {
    headers: { 'Set-Cookie': buildLikeCookie(cookieName, liked, request) },
  });
}

async function handleMap(env: Env, request: Request): Promise<Response> {
  const [countries, pages, likes] = await Promise.all([
    sumPrefix(env, 'c:'),
    sumPrefix(env, 'v:'),
    sumPrefix(env, 'l:'),
  ]);
  let totalViews = 0;
  for (const n of pages.values()) totalViews += n;
  let totalLikes = 0;
  for (const n of likes.values()) totalLikes += n;
  return json(request, {
    countries: Object.fromEntries(countries),
    totalViews,
    totalLikes,
  });
}

async function handleTop(env: Env, request: Request): Promise<Response> {
  const limit = Math.min(Math.max(Number(new URL(request.url).searchParams.get('limit')) || 10, 1), 50);
  const pages = await sumPrefix(env, 'v:');
  const top = [...pages.entries()]
    .map(([page, views]) => ({ page, views }))
    .filter((e) => e.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
  return json(request, top);
}

// ---------- 入口 ----------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (url.pathname === '/' && request.method === 'GET') {
      return json(request, { ok: true, service: 'hous-lab-stats' });
    }

    if (request.method === 'POST' && (url.pathname === '/view' || url.pathname === '/like')) {
      let body: { page?: unknown };
      try {
        body = await request.json();
      } catch {
        return json(request, { error: 'invalid json' }, { status: 400 });
      }
      const page = normalizePage(body.page);
      if (!page) return json(request, { error: 'invalid page' }, { status: 400 });
      return url.pathname === '/view'
        ? handleView(env, request, page)
        : handleLike(env, request, page);
    }

    if (request.method === 'GET') {
      if (url.pathname === '/stats') {
        const page = normalizePage(url.searchParams.get('page'));
        if (!page) return json(request, { error: 'invalid page' }, { status: 400 });
        const cookieName = await likeCookieName(page);
        const liked = parseCookies(request).has(cookieName);
        const [views, likes] = await Promise.all([
          kvGetNum(env, `v:${page}`),
          kvGetNum(env, `l:${page}`),
        ]);
        return json(request, { views, likes, liked });
      }
      if (url.pathname === '/map') return handleMap(env, request);
      if (url.pathname === '/top') return handleTop(env, request);
    }

    return json(request, { error: 'not found' }, { status: 404 });
  },
};
