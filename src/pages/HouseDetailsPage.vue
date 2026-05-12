<template>
  <q-page
    padding
    :style="
      house
        ? {
            background: `linear-gradient(135deg, ${withAlpha(house.Cor, 0.22)} 0%, ${withAlpha(house.Cor2 || house.Cor, 0.28)} 100%), #121212`,
          }
        : {}
    "
    style="min-height: 100vh"
  >
    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="house">
      <!-- Cabeçalho da Casa -->
      <div class="row items-center q-mb-xl q-gutter-md">
        <q-btn flat round icon="arrow_back" color="primary" @click="router.push('/')" />

        <q-avatar square v-if="house.Brasao" size="100px" class="q-mr-md shadow-2">
          <img :src="getBrasaoUrl(house.Brasao)" />
        </q-avatar>
        <q-icon
          v-else
          :name="house.Icone || 'shield'"
          :style="{
            background: `linear-gradient(135deg, ${house.Cor}, ${house.Cor2 || house.Cor})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.2))',
          }"
          size="100px"
          class="q-mr-md"
        />

        <div>
          <div
            class="font-cinzel text-h3 text-weight-bold"
            :style="{
              background: `linear-gradient(-45deg, ${house.Cor || '#CBA135'}, ${house.Cor2 || house.Cor || '#CBA135'})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              WebkitTextStroke: needsStroke ? '1px rgba(255,255,255,0.6)' : 'none',
              filter: 'drop-shadow(-1px 1px 8px rgba(255,255,255,0.7))',
            }"
          >
            {{ house.Nome }}
          </div>
          <div
            class="font-lora text-subtitle1 text-grey-5"
            style="letter-spacing: 2px; text-transform: uppercase"
          >
            Região: {{ house.Regiao }}
          </div>
          <div
            v-if="house.Categoria === 'Casa Vassala' && house.Suserano"
            class="font-lora text-subtitle2 q-mt-xs"
            style="letter-spacing: 1px; color: #ee4b2b"
          >
            <q-icon name="swords" class="q-mr-xs" /> Juramentada à casa {{ house.Suserano }}
          </div>
          <div class="font-lora text-h6 text-italic q-mt-sm text-grey-4" v-if="house.Lema">
            "{{ house.Lema }}"
          </div>
        </div>
      </div>

      <q-separator class="q-mb-lg" />

      <!-- Sessão de Personagens -->
      <div class="row items-center justify-between q-mb-md">
        <div class="font-cinzel text-h5 text-primary">Membros da Casa</div>
        <q-btn
          label="Adicionar Membro"
          icon="add"
          color="primary"
          outline
          class="font-cinzel text-weight-bold"
          @click="showAddCharacterDialog = true"
        />
      </div>

      <div v-if="characters.length > 0">
        <div v-for="group in characterGroups" :key="group.title">
          <div v-if="group.list.length > 0">
            <div class="q-mt-lg q-mb-md">
              <q-separator class="q-mb-md" color="grey-8" />
              <div :class="['font-cinzel text-h6 text-weight-bold', group.colorClass]">
                {{ group.title }}
              </div>
            </div>

            <div class="row q-col-gutter-md q-mb-xl">
              <div class="col-12 col-sm-6 col-md-4" v-for="char in group.list" :key="char.id">
                <q-card flat class="full-height westeros-border bg-dark-page font-lora">
                  <q-card-section class="row items-center no-wrap">
                    <q-avatar size="60px" class="q-mr-md shadow-1">
                      <img
                        v-if="char.Icone"
                        :src="getPersonagemIconUrl(char.Icone)"
                        class="avatar-img"
                      />
                      <q-icon v-else name="person" color="grey-6" size="xl" />
                    </q-avatar>

                    <div class="col">
                      <div class="font-cinzel text-h6 line-height-tight text-white">
                        {{ char.Nome }}
                      </div>
                      <div class="text-caption text-grey-5" v-if="char.Alcunha">
                        {{ char.Alcunha }}
                      </div>
                      <q-badge class="q-mt-xs" :color="statusColor(char.Status)">
                        {{ char.Status || 'Desconhecido' }}
                      </q-badge>
                    </div>
                  </q-card-section>

                  <q-card-actions
                    align="right"
                    class="bg-dark q-px-md"
                    style="border-top: 1px solid rgba(203, 161, 53, 0.2)"
                  >
                    <q-btn
                      color="negative"
                      unelevated
                      icon="delete"
                      label="Excluir"
                      @click="char.id && deleteCharacter(char.id)"
                      size="sm"
                      class="font-cinzel text-weight-bold"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center q-pa-xl bg-dark rounded-borders westeros-border">
        <q-icon name="group_off" size="4em" color="grey-7" class="q-mb-md" />
        <div class="font-cinzel text-h6 text-grey-5">Nenhum membro registrado para esta casa.</div>
      </div>

      <!-- Modal de Adicionar Personagem -->
      <q-dialog v-model="showAddCharacterDialog" persistent>
        <q-card style="min-width: 400px" class="bg-dark text-white westeros-border">
          <q-card-section class="bg-primary text-dark font-cinzel">
            <div class="text-h6 text-weight-bold">Registrar Novo Personagem</div>
            <div class="text-subtitle2 text-weight-medium">Casa: {{ house.Nome }}</div>
          </q-card-section>

          <q-card-section class="q-pt-md">
            <q-form @submit="saveCharacter" class="q-gutter-md">
              <q-input v-model="newCharacter.Nome" label="Nome do Personagem" filled required />
              <q-input v-model="newCharacter.Alcunha" label="Alcunha (Ex: O Jovem Lobo)" filled />

              <q-select
                v-model="newCharacter.Importancia"
                :options="['Protagonistas', 'Membros Notaveis', 'Demais Membros']"
                label="Nível de Importância"
                filled
                required
              />

              <q-select
                v-model="newCharacter.Status"
                :options="['Vivo', 'Viva', 'Morto', 'Morta', 'Desconhecido']"
                label="Status"
                filled
              />

              <q-file
                filled
                v-model="arquivoIconePersonagem"
                label="Foto / Ícone"
                accept=".jpg, .png, image/*"
              >
                <template v-slot:prepend>
                  <q-icon name="face" />
                </template>
              </q-file>

              <div class="row justify-end q-mt-md">
                <q-btn label="Cancelar" color="primary" flat v-close-popup class="font-cinzel" />
                <q-btn
                  label="Salvar"
                  type="submit"
                  color="primary"
                  :loading="sendingCharacter"
                  class="font-cinzel text-weight-bold"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { readItem, readItems, createItem, deleteItem, uploadFiles } from '@directus/sdk';
import type { CasaWesteros, Personagem } from '../types/westeros';
import { client, getBrasaoUrl, getPersonagemIconUrl } from '../services/directus';
import { staticHouses } from '../data/houses';
import { staticCharacters } from '../data/characters';
import { withAlpha } from '../utils/color';
const route = useRoute();
const router = useRouter();

// Pegamos o ID da casa pela URL (ex: /casa/1 -> id = 1)
const houseId = route.params.id as string;

// Estados Principais
const loading = ref(true);
const house = ref<CasaWesteros | null>(null);

// Lógica para detectar se alguma das cores é muito escura
const isDarkColor = (color: string | undefined): boolean => {
  if (!color) return false;
  const trimmed = color.trim();
  if (!trimmed.startsWith('#')) return false;

  const hex = trimmed.replace('#', '');
  if (hex.length !== 8 && hex.length !== 6 && hex.length !== 4 && hex.length !== 3) return false;

  const expand = (s: string) =>
    s
      .split('')
      .map((ch) => ch + ch)
      .join('');

  const rgbHex =
    hex.length === 8
      ? hex.slice(0, 6)
      : hex.length === 4
        ? expand(hex.slice(0, 3))
        : hex.length === 3
          ? expand(hex)
          : hex;

  const r = parseInt(rgbHex.substring(0, 2), 16);
  const g = parseInt(rgbHex.substring(2, 4), 16);
  const b = parseInt(rgbHex.substring(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return false;

  // Calcula a luminância (0 a 255)
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 50; // Se for menor que 50, é uma cor muito escura (quase preta)
};

const needsStroke = computed(() => {
  if (!house.value) return false;
  return isDarkColor(house.value.Cor) || isDarkColor(house.value.Cor2);
});

const statusColor = (status: Personagem['Status'] | undefined) => {
  if (!status || status === 'Desconhecido') return 'grey-7';
  if (status === 'Vivo' || status === 'Viva') return 'positive';
  if (status === 'Morto' || status === 'Morta') return 'negative';
  return 'grey-7';
};
const characters = ref<Personagem[]>([]);

// Estados Modal Add Personagem
const showAddCharacterDialog = ref(false);
const sendingCharacter = ref(false);
const arquivoIconePersonagem = ref<File | null>(null);
const newCharacter = reactive({
  Nome: '',
  Alcunha: '',
  Status: 'Vivo',
  Importancia: 'Demais Membros',
});

// Agrupamento de Personagens
const characterGroups = computed(() => [
  {
    title: 'Protagonistas',
    colorClass: 'text-warning',
    list: characters.value.filter((c) => c.Importancia === 'Protagonistas'),
  },
  {
    title: 'Membros Notáveis',
    colorClass: 'text-primary',
    list: characters.value.filter((c) => c.Importancia === 'Membros Notaveis'),
  },
  {
    title: 'Demais Membros',
    colorClass: 'text-grey-4',
    list: characters.value.filter((c) => !c.Importancia || c.Importancia === 'Demais Membros'),
  },
]);

// Funções de Busca
const fetchHouseDetails = async () => {
  try {
    const response = await client.request(readItem('Casas_Westeros', houseId));
    house.value = response as CasaWesteros;
  } catch (error) {
    console.warn('Directus indisponível para casa, usando dados estáticos:', error);
    const found = staticHouses.find((h) => String(h.id) === String(houseId));
    house.value = found || null;
  }
};

const fetchCharacters = async () => {
  try {
    const response = await client.request(
      readItems('Personagens', {
        filter: {
          Casa_ID: { _eq: houseId },
        },
      }),
    );
    characters.value = response as Personagem[];
  } catch (error) {
    console.warn('Directus indisponível para personagens, usando dados estáticos:', error);
    characters.value = staticCharacters.filter((c) => String(c.Casa_ID) === String(houseId));
  }
};

const loadData = async () => {
  loading.value = true;
  await Promise.all([fetchHouseDetails(), fetchCharacters()]);
  loading.value = false;
};

// Funções de Escrita
const saveCharacter = async () => {
  sendingCharacter.value = true;
  try {
    let idDaImagem = null;

    if (arquivoIconePersonagem.value) {
      const formData = new FormData();
      formData.append('title', `Foto - ${newCharacter.Nome}`);
      formData.append('file', arquivoIconePersonagem.value);

      const uploadResult = await client.request(uploadFiles(formData));
      idDaImagem = uploadResult.id;
    }

    const dadosParaSalvar = {
      ...newCharacter,
      Icone: idDaImagem,
      Casa_ID: houseId,
    };

    await client.request(createItem('Personagens', dadosParaSalvar));

    Object.assign(newCharacter, {
      Nome: '',
      Alcunha: '',
      Status: 'Vivo',
      Importancia: 'Demais Membros',
    });
    arquivoIconePersonagem.value = null;
    showAddCharacterDialog.value = false;

    await fetchCharacters(); // Recarrega a lista
  } catch (error) {
    console.error('Erro ao salvar personagem:', error);
  } finally {
    sendingCharacter.value = false;
  }
};

const deleteCharacter = async (id: string | number) => {
  if (confirm('Tem certeza que deseja banir este personagem de Westeros para sempre?')) {
    try {
      await client.request(deleteItem('Personagens', id));
      await fetchCharacters(); // Atualiza a lista após apagar
    } catch (error) {
      console.error('Erro ao apagar personagem:', error);
    }
  }
};

onMounted(loadData);
</script>

<style scoped>
.line-height-tight {
  line-height: 1.2;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
</style>
