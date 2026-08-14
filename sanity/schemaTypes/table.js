import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'table',
  title: 'Table',
  type: 'object',
  fields: [
    defineField({name: 'headerRows', type: 'number', initialValue: 1}),
    defineField({
      name: 'rows',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'row',
          type: 'object',
          fields: [
            defineField({
              name: 'cells',
              type: 'array',
              of: [
                defineArrayMember({
                  name: 'cell',
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'value',
                      type: 'array',
                      of: [
                        defineArrayMember({
                          type: 'block',
                          styles: [{title: 'Normal', value: 'normal'}],
                          lists: [],
                          marks: {decorators: [], annotations: []},
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
})
