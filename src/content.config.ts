import { defineCollection } from 'astro:content';
import { z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				/** 是否渲染评论区（giscus），默认开启 */
				comments: z.boolean().default(true),
			}),
		}),
	}),
};
