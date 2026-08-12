import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: { type: 'author' },
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description: 'Describe the image for search engines and screen readers.',
        }),
      ],
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      description: 'Optional. Falls back to the post title when empty.',
      validation: (Rule) => Rule.max(60).warning('Keep SEO titles under 60 characters when possible.'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO/meta description',
      type: 'text',
      rows: 3,
      description: 'Optional. Falls back to an excerpt generated from the post body when empty.',
      validation: (Rule) => Rule.max(160).warning('Keep meta descriptions under 160 characters when possible.'),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
    defineField({
      name: 'modifiedAt',
      title: 'Updated/modified date',
      type: 'datetime',
      description: 'Optional. Use when the article has been materially updated.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),

    // ✅ Comment Field Definition
    defineField({
      name: 'comments',
      title: 'Comments',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Name',
              type: 'string',
            },
            {
              name: 'message',
              title: 'Message',
              type: 'text',
            },
            {
              name: 'createdAt',
              title: 'Created At',
              type: 'datetime',
            },
            {
              name: 'approved',
              title: 'Approved',
              type: 'boolean',
              initialValue: false,
            },
          ],
        },
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const { author } = selection
      return {
        ...selection,
        subtitle: author && `by ${author}`,
      }
    },
  },
})
