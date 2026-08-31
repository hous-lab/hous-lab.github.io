/**
 * 站点互动层配置 —— 所有需要修改的地址/ID都集中在这里。
 */

/** 统计后端（Cloudflare Worker）。DEV 指向本地 wrangler dev。 */
export const STATS_API = import.meta.env.DEV
  ? 'http://localhost:8787'
  : 'https://hous-lab-stats.hous-lab.workers.dev';

/**
 * giscus 评论配置。三步启用（见 worker/README.md 或站点文档）：
 * 1. 仓库 Settings → General → Features 勾选 Discussions
 * 2. 在 Discussions 里新建分类 `Comments`（类型建议 Announcements）
 * 3. 打开 https://giscus.app/zh-CN 填入仓库名，把页面给出的
 *    data-repo-id / data-category-id 粘贴到下面
 * 留空时评论区静默不渲染。
 */
export const GISCUS = {
  repo: 'hous-lab/hous-lab.github.io',
  repoId: 'R_kgDOUFk78A',
  category: 'Comments',
  categoryId: 'DIC_kwDOUFk78M4DEjTJ',
} as const;

/** giscus 是否已配置（repoId/categoryId 均已填写） */
export const GISCUS_ENABLED = GISCUS.repoId !== '' && GISCUS.categoryId !== '';
