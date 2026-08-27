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
      sidebar: [
        { label: '首页', link: '/' },
        {
          label: '项目',
          items: [
            { label: '项目概览', link: '/projects/' },
            { label: 'Alpamayo on Jetson Orin', link: '/projects/alpamayo-orin/' },
          ],
        },
        {
          label: '部署实践',
          items: [
            { label: '部署概览', link: '/deployment/' },
            {
              label: 'Jetson Orin',
              items: [
                { autogenerate: { directory: 'deployment/orin' } },
              ],
            },
            {
              label: '模型量化',
              items: [
                { autogenerate: { directory: 'deployment/quantization' } },
              ],
            },
            {
              label: 'TensorRT-LLM',
              items: [
                { autogenerate: { directory: 'deployment/tensorrt-llm' } },
              ],
            },
            {
              label: 'Qualcomm QNN',
              items: [{ autogenerate: { directory: 'deployment/qnn' } }],
            },
          ],
        },
        {
          label: '研究',
          items: [
            { label: '研究概览', link: '/research/' },
            { autogenerate: { directory: 'research' } },
          ],
        },
        {
          label: '工程方法',
          items: [
            { label: '工程概览', link: '/engineering/' },
            {
              label: '性能分析',
              items: [
                { autogenerate: { directory: 'engineering/profiling' } },
              ],
            },
            {
              label: '蒸馏与压缩',
              items: [
                { autogenerate: { directory: 'engineering/distillation' } },
              ],
            },
          ],
        },
        { label: '技术笔记', link: '/notes/' },
        { label: '关于', link: '/about/' },
      ],
    }),
  ],
});
