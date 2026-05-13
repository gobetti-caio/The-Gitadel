import { staticHouses } from '../src/data/houses';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8056';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

if (!DIRECTUS_TOKEN) {
  console.error('DIRECTUS_TOKEN nao definido.');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
};

async function requestJson(path: string, options: RequestInit = {}) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = body?.errors?.[0]?.message || res.statusText;
    throw new Error(`${res.status} ${message}`);
  }
  return body;
}

async function findHouseByName(name: string) {
  const query = `?filter[Nome][_eq]=${encodeURIComponent(name)}&limit=1`;
  const result = await requestJson(`/items/Casas_Westeros${query}`);
  return result?.data?.[0] || null;
}

async function createHouse(payload: Record<string, unknown>) {
  const result = await requestJson('/items/Casas_Westeros', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result?.data || null;
}

async function seed() {
  let created = 0;
  let skipped = 0;

  const isUuid = (value: unknown) =>
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

  for (const house of staticHouses) {
    const existing = await findHouseByName(house.Nome);
    if (existing) {
      skipped++;
      continue;
    }

    const payload = { ...house } as Record<string, unknown>;
    if (payload.id === undefined) {
      delete payload.id;
    }

    if (payload.Brasao && !isUuid(payload.Brasao)) {
      delete payload.Brasao;
    }

    await createHouse(payload);
    created++;
  }

  console.log(`Seed finalizado. Criadas: ${created}, Ja existentes: ${skipped}`);
}

seed().catch((error) => {
  console.error('Falha no seed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
