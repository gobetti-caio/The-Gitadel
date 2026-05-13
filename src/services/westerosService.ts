import { ref, type Ref } from 'vue';
import {
  readItems,
  readItem,
  createItem,
  updateItem,
  deleteItem,
  uploadFiles,
} from '@directus/sdk';
import type { CasaWesteros, Personagem } from '../types/westeros';
import { client, DIRECTUS_URL } from './directus';
import { staticHouses } from '../data/houses';
import { staticCharacters } from '../data/characters';

// ─── Estado global reativo ───────────────────────────────────────────
export type DataSource = 'directus' | 'local';
export const dataSource: Ref<DataSource> = ref('local');

// Cópias mutáveis dos dados estáticos (modo local opera sobre elas)
let localHouses: CasaWesteros[] = structuredClone(staticHouses);
let localCharacters: Personagem[] = structuredClone(staticCharacters);
let nextLocalHouseId = Math.max(...staticHouses.map((h) => Number(h.id) || 0)) + 100;
let nextLocalCharacterId = Math.max(...staticCharacters.map((c) => Number(c.id) || 0)) + 100;

// ─── Conectividade ───────────────────────────────────────────────────
let lastCheck = 0;
let cachedAvailable = false;
const CACHE_TTL = 30_000; // 30 segundos

export async function checkDirectus(): Promise<boolean> {
  const now = Date.now();
  if (now - lastCheck < CACHE_TTL) return cachedAvailable;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${DIRECTUS_URL}/server/ping`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    cachedAvailable = res.ok;
  } catch {
    cachedAvailable = false;
  }

  lastCheck = now;
  dataSource.value = cachedAvailable ? 'directus' : 'local';
  return cachedAvailable;
}

/** Força recheck na próxima chamada */
export function invalidateCache() {
  lastCheck = 0;
}

// ─── CASAS ───────────────────────────────────────────────────────────

type DirectusHouse = CasaWesteros & { ID?: string | number };

export async function getHouses(): Promise<CasaWesteros[]> {
  let directusHouses: CasaWesteros[] = [];
  if (await checkDirectus()) {
    try {
      const response = await client.request(readItems('Casas_Westeros'));
      directusHouses = (response as DirectusHouse[]).map((item) => {
        const mapped = { ...item, id: item.id ?? item.ID };
        delete mapped.ID;
        return mapped as CasaWesteros;
      });
      return directusHouses;
    } catch (error) {
      console.warn('Falha ao buscar casas do Directus:', error);
    }
  }

  return localHouses;
}

export async function getHouseById(id: string | number): Promise<CasaWesteros | null> {
  if (await checkDirectus()) {
    try {
      const response = (await client.request(readItem('Casas_Westeros', id))) as DirectusHouse;
      const mapped = { ...response, id: response.id ?? response.ID };
      delete mapped.ID;
      return mapped as CasaWesteros;
    } catch (error) {
      // Falhou no Directus (pode ser 404 pq a casa só existe localmente)
      console.warn(`Casa ${id} não encontrada no Directus, tentando localmente.`, error);
    }
  }
  return localHouses.find((h) => String(h.id) === String(id)) || null;
}

export interface SaveHouseResult<T = CasaWesteros | Personagem> {
  success: boolean;
  source: DataSource;
  error?: unknown;
  data?: T;
}

export async function createHouse(
  house: CasaWesteros,
  brasaoFile?: File | null,
): Promise<SaveHouseResult<CasaWesteros>> {
  if (await checkDirectus()) {
    try {
      let brasaoId: string | null = null;
      if (brasaoFile) {
        brasaoId = await uploadImage(brasaoFile, `Brasão - ${house.Nome}`);
      }

      const payload = { ...house };
      if (brasaoId) payload.Brasao = brasaoId;

      const created = (await client.request(
        createItem('Casas_Westeros', payload),
      )) as DirectusHouse;
      const mapped = { ...created, id: created.id ?? created.ID };
      delete mapped.ID;

      return { success: true, source: 'directus', data: mapped as CasaWesteros };
    } catch (error) {
      console.error('Erro ao criar casa no Directus:', error);
      return { success: false, source: 'directus', error };
    }
  }

  // Modo local
  const newHouse: CasaWesteros = {
    ...house,
    id: nextLocalHouseId++,
  };
  localHouses.push(newHouse);
  return { success: true, source: 'local', data: newHouse };
}

export async function updateHouse(
  id: string | number,
  house: CasaWesteros,
  brasaoFile?: File | null,
): Promise<SaveHouseResult<CasaWesteros>> {
  let directusError = null;
  if (await checkDirectus()) {
    try {
      let brasaoId: string | null = null;
      if (brasaoFile) {
        brasaoId = await uploadImage(brasaoFile, `Brasão - ${house.Nome}`);
      }

      const payload = { ...house };
      if (brasaoId) payload.Brasao = brasaoId;

      const updated = (await client.request(
        updateItem('Casas_Westeros', id, payload),
      )) as DirectusHouse;
      const mapped = { ...updated, id: updated.id ?? updated.ID };
      delete mapped.ID;

      // Atualiza no array local também para manter sincronia no merge
      const idx = localHouses.findIndex((h) => String(h.id) === String(id));
      if (idx >= 0) {
        localHouses[idx] = { ...localHouses[idx], ...payload };
      }
      return { success: true, source: 'directus', data: mapped as CasaWesteros };
    } catch (error) {
      console.warn('Erro ao atualizar casa no Directus, tentando atualizar localmente:', error);
      directusError = error;
    }
  }

  // Modo local
  const idx = localHouses.findIndex((h) => String(h.id) === String(id));
  if (idx >= 0) {
    localHouses[idx] = { ...localHouses[idx], ...house };
    return { success: true, source: 'local', data: localHouses[idx] };
  }
  return { success: false, source: 'local', error: directusError || 'Casa não encontrada' };
}

export async function deleteHouse(id: string | number): Promise<SaveHouseResult<CasaWesteros>> {
  let deletedFromDirectus = false;
  let directusError = null;

  if (await checkDirectus()) {
    try {
      await client.request(deleteItem('Casas_Westeros', id));
      deletedFromDirectus = true;
    } catch (error) {
      console.warn(
        `Casa ${id} não pôde ser excluída no Directus. Tentando excluir localmente:`,
        error,
      );
      directusError = error;
    }
  }

  // Sempre removemos do array local para garantir que não vai voltar no merge
  const before = localHouses.length;
  localHouses = localHouses.filter((h) => String(h.id) !== String(id));
  const deletedFromLocal = localHouses.length < before;

  if (deletedFromDirectus) {
    return { success: true, source: 'directus' };
  }

  if (deletedFromLocal) {
    return { success: true, source: 'local' };
  }

  return { success: false, source: 'local', error: directusError || 'Casa não encontrada' };
}

// ─── PERSONAGENS ─────────────────────────────────────────────────────

export async function getCharactersByHouse(houseId: string | number): Promise<Personagem[]> {
  let directusCharacters: Personagem[] = [];
  if (await checkDirectus()) {
    try {
      const response = await client.request(
        readItems('Personagens', {
          filter: { Casa_ID: { _eq: houseId } },
        }),
      );
      directusCharacters = response as Personagem[];
      return directusCharacters;
    } catch (error) {
      console.warn('Falha ao buscar personagens do Directus:', error);
    }
  }

  return localCharacters.filter((c) => String(c.Casa_ID) === String(houseId));
}

export async function createCharacter(
  character: Omit<Personagem, 'id'>,
  iconeFile?: File | null,
): Promise<SaveHouseResult<Personagem>> {
  if (await checkDirectus()) {
    try {
      let iconeId: string | null = null;
      if (iconeFile) {
        iconeId = await uploadImage(iconeFile, `Foto - ${character.Nome}`);
      }

      const payload = { ...character, Icone: iconeId };
      const created = (await client.request(createItem('Personagens', payload))) as Personagem;
      return { success: true, source: 'directus', data: created };
    } catch (error) {
      console.error('Erro ao criar personagem no Directus:', error);
      return { success: false, source: 'directus', error };
    }
  }

  // Modo local
  const newChar: Personagem = {
    ...character,
    id: nextLocalCharacterId++,
  };
  localCharacters.push(newChar);
  return { success: true, source: 'local', data: newChar };
}

export async function deleteCharacter(id: string | number): Promise<SaveHouseResult<Personagem>> {
  let deletedFromDirectus = false;
  let directusError = null;

  if (await checkDirectus()) {
    try {
      await client.request(deleteItem('Personagens', id));
      deletedFromDirectus = true;
    } catch (error) {
      console.warn(
        `Personagem ${id} não pôde ser excluído no Directus. Tentando excluir localmente:`,
        error,
      );
      directusError = error;
    }
  }

  // Sempre removemos do array local
  const before = localCharacters.length;
  localCharacters = localCharacters.filter((c) => String(c.id) !== String(id));
  const deletedFromLocal = localCharacters.length < before;

  if (deletedFromDirectus) {
    return { success: true, source: 'directus' };
  }

  if (deletedFromLocal) {
    return { success: true, source: 'local' };
  }

  return { success: false, source: 'local', error: directusError || 'Personagem não encontrado' };
}

// ─── Upload (apenas Directus) ────────────────────────────────────────

async function uploadImage(file: File, title: string): Promise<string> {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', file);
  const result = await client.request(uploadFiles(formData));
  return result.id;
}

/** Indica se upload de arquivos está disponível no modo atual */
export function isUploadAvailable(): boolean {
  return dataSource.value === 'directus';
}
