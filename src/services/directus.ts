import { createDirectus, rest } from '@directus/sdk';

export const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8056';

export const client = createDirectus(DIRECTUS_URL).with(
  rest({
    onRequest: (options) => {
      options.cache = 'no-store';
      return options;
    },
  })
);

export const getAssetUrl = (assetId: string) => `${DIRECTUS_URL}/assets/${assetId}`;

/**
 * Verifica se um ID de asset é um UUID do Directus ou um nome de arquivo local.
 * UUIDs do Directus têm o formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
const isDirectusUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

/**
 * Retorna a URL correta para um brasão de casa.
 * Se for UUID do Directus, busca da API. Se for nome de arquivo, busca de public/brasoes/.
 */
export const getBrasaoUrl = (brasaoId: string) => {
  if (isDirectusUuid(brasaoId)) {
    return getAssetUrl(brasaoId);
  }
  return `/brasoes/${brasaoId}`;
};

/**
 * Retorna a URL correta para o ícone/foto de um personagem.
 * Se for UUID do Directus, busca da API. Se for nome de arquivo, busca de public/personagens/.
 */
export const getPersonagemIconUrl = (iconId: string) => {
  if (isDirectusUuid(iconId)) {
    return getAssetUrl(iconId);
  }
  return `/personagens/${iconId}`;
};
