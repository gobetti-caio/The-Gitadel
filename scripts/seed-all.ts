import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { staticHouses } from '../src/data/houses';
import { staticCharacters } from '../src/data/characters';
import type { CasaWesteros, Personagem } from '../src/types/westeros';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8056';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

if (!DIRECTUS_TOKEN) {
  console.error('DIRECTUS_TOKEN nao definido.');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
};

const BRASOES_DIR = path.resolve('public/brasoes');
const PERSONAGENS_DIR = path.resolve('public/personagens');

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function requestJson(pathname: string, options: RequestInit = {}) {
  const res = await fetch(`${DIRECTUS_URL}${pathname}`, {
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

function getDirectusId(record: Record<string, unknown>) {
  return (record.id ?? record.ID) as string | number | undefined;
}

async function findHouseByName(name: string) {
  const query = `?filter[Nome][_eq]=${encodeURIComponent(name)}&limit=1`;
  const result = await requestJson(`/items/Casas_Westeros${query}`);
  return result?.data?.[0] || null;
}

async function createHouse(payload: Record<string, unknown>) {
  const result = await requestJson('/items/Casas_Westeros', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return result?.data || null;
}

async function updateHouse(id: string | number, payload: Record<string, unknown>) {
  const result = await requestJson(`/items/Casas_Westeros/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return result?.data || null;
}

async function findCharacterByNameAndHouse(name: string, houseId: string | number) {
  const query =
    `?filter[Nome][_eq]=${encodeURIComponent(name)}` +
    `&filter[Casa_ID][_eq]=${encodeURIComponent(String(houseId))}&limit=1`;
  const result = await requestJson(`/items/Personagens${query}`);
  return result?.data?.[0] || null;
}

async function createCharacter(payload: Record<string, unknown>) {
  const result = await requestJson('/items/Personagens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return result?.data || null;
}

async function updateCharacter(id: string | number, payload: Record<string, unknown>) {
  const result = await requestJson(`/items/Personagens/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return result?.data || null;
}

async function uploadFile(filePath: string, title: string) {
  const buffer = await readFile(filePath);
  const blob = new Blob([buffer]);
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', blob, path.basename(filePath));

  const res = await fetch(`${DIRECTUS_URL}/files`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = body?.errors?.[0]?.message || res.statusText;
    throw new Error(`${res.status} ${message}`);
  }
  return body?.data?.id as string | undefined;
}

async function maybeUploadBrasao(house: CasaWesteros) {
  if (!house.Brasao) return undefined;
  const filePath = path.join(BRASOES_DIR, house.Brasao);
  if (!(await fileExists(filePath))) return undefined;
  return uploadFile(filePath, house.Brasao);
}

async function maybeUploadIcone(character: Personagem) {
  if (!character.Icone) return undefined;
  const filePath = path.join(PERSONAGENS_DIR, character.Icone);
  if (!(await fileExists(filePath))) return undefined;
  return uploadFile(filePath, character.Icone);
}

async function seedHouses() {
  const byLocalId = new Map<string, string | number>();
  const byName = new Map<string, string | number>();

  let created = 0;
  let updated = 0;

  for (const house of staticHouses) {
    const existing = await findHouseByName(house.Nome);
    const payload: Record<string, unknown> = { ...house };
    delete payload.id;

    const brasaoId = await maybeUploadBrasao(house);
    if (brasaoId) payload.Brasao = brasaoId;

    let record;
    if (existing) {
      const existingId = getDirectusId(existing);
      if (!existingId) throw new Error(`Casa sem ID no Directus: ${house.Nome}`);
      record = await updateHouse(existingId, payload);
      updated++;
    } else {
      record = await createHouse(payload);
      created++;
    }

    const directusId = getDirectusId(record);
    if (!directusId) throw new Error(`Falha ao obter ID da casa: ${house.Nome}`);
    byLocalId.set(String(house.id), directusId);
    byName.set(house.Nome, directusId);
  }

  console.log(`Casas: criadas ${created}, atualizadas ${updated}`);
  return { byLocalId, byName };
}

async function seedCharacters(
  houseMap: Map<string, string | number>,
  houseByName: Map<string, string | number>,
) {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  const localHouseNameById = new Map<string, string>();
  staticHouses.forEach((h) => h.id && localHouseNameById.set(String(h.id), h.Nome));

  for (const character of staticCharacters) {
    const localHouseId = character.Casa_ID ? String(character.Casa_ID) : '';
    const houseName = localHouseNameById.get(localHouseId);
    const directusHouseId =
      (houseName ? houseByName.get(houseName) : undefined) ?? houseMap.get(localHouseId);

    if (!directusHouseId) {
      console.warn(`Personagem sem casa no Directus: ${character.Nome}`);
      skipped++;
      continue;
    }

    const payload: Record<string, unknown> = {
      ...character,
      Casa_ID: directusHouseId,
    };
    delete payload.id;

    const iconeId = await maybeUploadIcone(character);
    if (iconeId) payload.Icone = iconeId;

    const existing = await findCharacterByNameAndHouse(character.Nome, directusHouseId);
    if (existing) {
      const existingId = getDirectusId(existing);
      if (!existingId) throw new Error(`Personagem sem ID no Directus: ${character.Nome}`);
      await updateCharacter(existingId, payload);
      updated++;
    } else {
      await createCharacter(payload);
      created++;
    }
  }

  console.log(`Personagens: criados ${created}, atualizados ${updated}, ignorados ${skipped}`);
}

async function seedAll() {
  const { byLocalId, byName } = await seedHouses();
  await seedCharacters(byLocalId, byName);
}

seedAll().catch((error) => {
  console.error('Falha no seed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
