import type { Schema, Struct } from '@strapi/strapi';

export interface SlideMcq extends Struct.ComponentSchema {
  collectionName: 'components_slide_mcqs';
  info: {
    displayName: 'MCQ';
    icon: 'bulletList';
  };
  attributes: {
    a: Schema.Attribute.Text & Schema.Attribute.Required;
    b: Schema.Attribute.String & Schema.Attribute.Required;
    c: Schema.Attribute.String & Schema.Attribute.Required;
    correctOption: Schema.Attribute.Enumeration<['a', 'b', 'c', 'd']> &
      Schema.Attribute.Required;
    d: Schema.Attribute.Text & Schema.Attribute.Required;
    duration: Schema.Attribute.Integer;
    question: Schema.Attribute.Text & Schema.Attribute.Required;
    thumbnail: Schema.Attribute.Media<'images' | 'videos'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'slide.mcq': SlideMcq;
    }
  }
}
