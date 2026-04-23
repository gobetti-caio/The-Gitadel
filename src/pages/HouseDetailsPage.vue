<template>
  <q-page padding>
    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="house">
      <!-- Cabeçalho da Casa -->
      <div class="row items-center q-mb-xl q-gutter-md">
        <q-btn flat round icon="arrow_back" color="primary" @click="router.push('/')" />

        <q-avatar square v-if="house.Brasao" size="100px" class="q-mr-md shadow-2">
          <img :src="`http://localhost:8056/assets/${house.Brasao}`" />
        </q-avatar>
        <q-icon v-else name="shield" :style="{ color: house.Cor || '#1976D2' }" size="100px" class="q-mr-md" />

        <div>
          <div class="font-cinzel text-h3 text-weight-bold" :style="{ color: house.Cor || '#CBA135' }">{{ house.Nome }}</div>
          <div class="font-lora text-subtitle1 text-grey-5" style="letter-spacing: 2px; text-transform: uppercase;">Região: {{ house.Regiao }}</div>
          <div class="font-lora text-h6 text-italic q-mt-sm text-grey-4" v-if="house.Lema">"{{ house.Lema }}"</div>
        </div>
      </div>

      <q-separator class="q-mb-lg" />

      <!-- Sessão de Personagens -->
      <div class="row items-center justify-between q-mb-md">
        <div class="font-cinzel text-h5 text-primary">Membros da Casa</div>
        <q-btn label="Adicionar Membro" icon="add" color="primary" outline class="font-cinzel text-weight-bold" @click="showAddCharacterDialog = true" />
      </div>

      <div v-if="characters.length > 0">
        <div v-for="group in characterGroups" :key="group.title">
          <div v-if="group.list.length > 0">
            <div :class="['font-cinzel text-h6 q-mb-md', group.colorClass]">{{ group.title }}</div>

            <div class="row q-col-gutter-md q-mb-xl">
              <div class="col-12 col-sm-6 col-md-4" v-for="char in group.list" :key="char.id">
                <q-card flat class="full-height westeros-border bg-dark-page font-lora">
                  <q-card-section class="row items-center no-wrap">
                    <q-avatar size="60px" class="q-mr-md shadow-1">
                      <img v-if="char.Icone" :src="`http://localhost:8056/assets/${char.Icone}`" />
                      <q-icon v-else name="person" color="grey-6" size="xl" />
                    </q-avatar>

                    <div class="col">
                      <div class="font-cinzel text-h6 line-height-tight text-white">{{ char.Nome }}</div>
                      <div class="text-caption text-grey-5" v-if="char.Alcunha">{{ char.Alcunha }}</div>
                      <q-badge class="q-mt-xs" :color="char.Status === 'Vivo' ? 'positive' : 'negative'">
                        {{ char.Status || 'Desconhecido' }}
                      </q-badge>
                    </div>
                  </q-card-section>

                  <q-card-actions align="right" class="bg-dark q-px-md" style="border-top: 1px solid rgba(203, 161, 53, 0.2);">
                    <q-btn flat color="negative" icon="delete" label="Excluir" @click="deleteCharacter(char.id)" size="sm" class="font-cinzel" />
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
                :options="['Vivo', 'Morto', 'Desconhecido']"
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
                <q-btn label="Salvar" type="submit" color="primary" :loading="sendingCharacter" class="font-cinzel text-weight-bold" />
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
import {
  createDirectus,
  rest,
  readItem,
  readItems,
  createItem,
  deleteItem,
  uploadFiles,
} from '@directus/sdk';

// Interfaces
interface CasaWesteros {
  id: string | number;
  ID?: string | number;
  Nome: string;
  Regiao: string;
  Lema: string;
  Cor?: string;
  Brasao?: string;
}

interface Personagem {
  id: string | number;
  Nome: string;
  Alcunha?: string;
  Status?: string;
  Icone?: string;
  Importancia?: string;
}

const client = createDirectus('http://localhost:8056').with(rest());
const route = useRoute();
const router = useRouter();

// Pegamos o ID da casa pela URL (ex: /casa/1 -> id = 1)
const houseId = route.params.id as string;

// Estados Principais
const loading = ref(true);
const house = ref<CasaWesteros | null>(null);
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
  { title: 'Protagonistas', colorClass: 'text-secondary', list: characters.value.filter(c => c.Importancia === 'Protagonistas') },
  { title: 'Membros Notáveis', colorClass: 'text-primary', list: characters.value.filter(c => c.Importancia === 'Membros Notaveis') },
  { title: 'Demais Membros', colorClass: 'text-grey-5', list: characters.value.filter(c => !c.Importancia || c.Importancia === 'Demais Membros') }
]);

// Funções de Busca
const fetchHouseDetails = async () => {
  try {
    const response = await client.request(readItem('Casas_Westeros', houseId));
    house.value = response as CasaWesteros;
  } catch (error) {
    console.error('Erro ao buscar casa:', error);
  }
};

const fetchCharacters = async () => {
  try {
    const response = await client.request(
      readItems('Personagens', {
        filter: {
          Casa_ID: { _eq: houseId },
        },
      })
    );
    characters.value = response as Personagem[];
  } catch (error) {
    console.error('Erro ao buscar personagens:', error);
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

    Object.assign(newCharacter, { Nome: '', Alcunha: '', Status: 'Vivo', Importancia: 'Demais Membros' });
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
</style>
