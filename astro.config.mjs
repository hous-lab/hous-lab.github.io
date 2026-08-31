import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://hous-lab.github.io',
  integrations: [
    starlight({
      title: 'Hous Lab',
      description:
        'Autonomous Driving × AI Systems × Edge Intelligence — 模型部署、推理优化与端侧智能的真实工程经验',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
      },
      social: [
        {
          label: 'GitHub',
          icon: 'github',
          href: 'https://github.com/hous-lab',
        },
      ],
      editLink: {
        baseUrl:
          'https://github.com/hous-lab/hous-lab.github.io/tree/main/src/content/docs',
      },
      customCss: ['./src/styles/custom.css'],
      components: {
        // 在页脚区域挂载 阅读量/点赞/评论区（见 src/components/overrides/Footer.astro）
        Footer: './src/components/overrides/Footer.astro',
      },
      sidebar: [
        { label: '首页', link: '/' },
        { label: '项目', link: '/projects/' },
        { label: '部署实践', link: '/deployment/' },
        { label: 'SparseDriveV2 在 SA8775P 上的量化部署', link: '/deployment/sparsedrive2-sa8775p-qnn-deployment/' },
        { label: '研究', link: '/research/' },
        { label: '工程方法', link: '/engineering/' },
        { label: '技术笔记', link: '/notes/' },
        { label: '关于', link: '/about/' },
        { label: '站点统计', link: '/stats/' },
      ],
    }),
  ],
});
