import { createDirectus, rest } from '@directus/sdk';
export const client = createDirectus('http://localhost:8056').with(
  rest({
    onRequest: (options) => {
      options.cache = 'no-store';
      return options;
    }
  })
);
