import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'divider',
  title: 'Horizontal divider',
  type: 'object',
  fields: [
    defineField({
      name: 'style',
      title: 'Line weight',
      type: 'string',
      initialValue: 'standard',
      options: {
        layout: 'radio',
        list: [
          {title: 'Standard', value: 'standard'},
          {title: 'Emphasized', value: 'emphasized'},
        ],
      },
    }),
  ],
  preview: {
    select: {
      style: 'style',
    },
    prepare({style}) {
      return {title: 'Horizontal divider', subtitle: style === 'emphasized' ? 'Emphasized' : 'Standard'}
    },
  },
})
