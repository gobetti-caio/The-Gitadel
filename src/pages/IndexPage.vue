<template>
  <q-page padding class="q-pa-xl">
    <div class="row items-center justify-between q-mb-lg">
      <div class="font-cinzel text-h5 text-primary">Grandes e Pequenas Casas</div>
      <q-btn
        label="Nova Casa"
        icon="add"
        color="primary"
        outline
        class="font-cinzel text-weight-bold"
        @click="openAddDialog"
      />
    </div>

    <!-- Abas para dividir as Casas -->
    <q-tabs
      v-model="tab"
      class="text-red font-cinzel q-mb-md"
      active-color="warning"
      indicator-color="warning"
      align="left"
    >
      <q-tab name="todas" label="Todas as Casas" />
      <q-tab name="Grande Casa" label="Grandes Casas" />
      <q-tab name="Casa Vassala" label="Casas Vassalas" />
    </q-tabs>

    <q-table
      :rows="filteredHouses"
      :columns="columns"
      :filter="filter"
      row-key="Nome"
      :loading="loading"
      v-model:pagination="initialPagination"
      flat
      class="westeros-border bg-dark-page font-lora"
    >
      <template v-slot:body="props">
        <!-- Navega para a página de detalhes -->
        <q-tr
          :props="props"
          :style="{
            background: `linear-gradient(90deg, ${props.row.Cor}15 0%, ${props.row.Cor2 || props.row.Cor}15 100%)`,
          }"
          @click="abrirCasa(props.row)"
          class="cursor-pointer"
        >
          <q-td key="Nome" :props="props" class="text-weight-bold">
            <q-avatar square v-if="props.row.Brasao" size="md" class="q-mr-sm">
              <img :src="getBrasaoUrl(props.row.Brasao)" />
            </q-avatar>
            <q-icon
              v-else
              :name="props.row.Icone || 'shield'"
              :style="{ color: props.row.Cor }"
              size="sm"
              class="q-mr-sm"
            />
            {{ props.row.Nome }}
          </q-td>

          <q-td key="Categoria" :props="props">
            {{ props.row.Categoria }}
          </q-td>

          <q-td key="Suserano" :props="props" class="text-italic text-grey-5">
            <span v-if="props.row.Suserano">{{ props.row.Suserano }}</span>
            <span v-else-if="props.row.Categoria === 'Casa Vassala'">-</span>
          </q-td>

          <q-td key="Regiao" :props="props">
            {{ props.row.Regiao }}
          </q-td>

          <q-td key="Lema" :props="props" class="text-italic"> "{{ props.row.Lema }}" </q-td>

          <q-td key="actions" :props="props" class="text-center">
            <q-btn flat round color="primary" icon="settings" size="sm" @click.stop>
              <q-menu>
                <q-list style="min-width: 150px">
                  <q-item clickable v-close-popup @click="editHouse(props.row)">
                    <q-item-section avatar
                      ><q-icon name="edit" color="primary" size="sm"
                    /></q-item-section>
                    <q-item-section>Editar Casa</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="deleteHouse(props.row.id)">
                    <q-item-section avatar
                      ><q-icon name="delete" color="negative" size="sm"
                    /></q-item-section>
                    <q-item-section class="text-negative">Excluir</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 400px" class="bg-dark text-white westeros-border">
        <q-card-section class="bg-primary text-dark font-cinzel">
          <div class="text-h6 text-weight-bold">
            {{ isEditing ? 'Atualizar Casa' : 'Enviar Corvo com Nova Casa' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveHouse" class="q-gutter-md">
            <q-input v-model="newHouse.Nome" label="Nome da Casa" filled required />

            <q-select
              v-model="newHouse.Categoria"
              :options="['Grande Casa', 'Casa Vassala']"
              label="Tamanho da Casa"
              filled
              required
            />

            <q-select
              v-if="newHouse.Categoria === 'Casa Vassala'"
              v-model="newHouse.Suserano"
              :options="grandesCasasOptions"
              label="Juramentada a qual Grande Casa?"
              filled
              clearable
            />

            <q-input v-model="newHouse.Regiao" label="Região" filled required />
            <q-input v-model="newHouse.Lema" label="Lema" filled />
            <q-input
              v-model="newHouse.Icone"
              label="Ícone (Material Icon)"
              filled
              hint="Ex: shield, castle, flag"
            >
              <template v-slot:append>
                <q-icon :name="newHouse.Icone || 'shield'" />
              </template>
            </q-input>

            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-file
                  filled
                  v-model="arquivoBrasao"
                  label="Upload do Brasão"
                  accept=".jpg, image/*"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
              </div>
              <div class="col-6">
                <q-input filled v-model="newHouse.Cor" label="Cor Principal">
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer" :style="{ color: newHouse.Cor }">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-color v-model="newHouse.Cor" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-6">
                <q-input filled v-model="newHouse.Cor2" label="Cor Secundária">
                  <template v-slot:append>
                    <q-icon
                      name="colorize"
                      class="cursor-pointer"
                      :style="{ color: newHouse.Cor2 }"
                    >
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-color v-model="newHouse.Cor2" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row justify-end q-mt-md">
              <q-btn label="Cancelar" color="primary" flat v-close-popup />
              <q-btn label="Salvar Casa" type="submit" color="primary" :loading="sending" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { QTableColumn } from 'quasar';
import { readItems, createItem, updateItem, deleteItem, uploadFiles } from '@directus/sdk';
import type { CasaWesteros } from '../types/westeros';
import { client, getBrasaoUrl } from '../services/directus';
import { staticHouses } from '../data/houses';

// 2. Router
const router = useRouter();

// 3. Estados
const arquivoBrasao = ref<File | null>(null);
const houses = ref<CasaWesteros[]>([]);
const loading = ref(false);
const showAddDialog = ref(false);
const sending = ref(false);
const filter = ref('');
const tab = ref('todas');
const isEditing = ref(false);
const editingId = ref<string | number | null>(null);

// Configuração da Paginação da Tabela
const initialPagination = ref({
  rowsPerPage: 20, // Coloque 0 para mostrar "Tudo" numa página só, ou mude para o número que quiser
});

const grandesCasasOptions = computed(() => {
  return houses.value.filter((h) => h.Categoria === 'Grande Casa').map((h) => h.Nome);
});

const newHouse = reactive<CasaWesteros>({
  Nome: '',
  Categoria: 'Casa Vassala',
  Regiao: '',
  Lema: '',
  Cor: '#1976D2',
  Cor2: '#000000',
  Icone: 'shield',
  Suserano: '',
});

// 4. Definição das Colunas (Importante: name deve bater com o slot)
const columns: QTableColumn[] = [
  { name: 'Nome', label: 'Nome da Casa', align: 'left', field: 'Nome', sortable: true },
  { name: 'Categoria', label: 'Hierarquia', align: 'left', field: 'Categoria', sortable: true },
  { name: 'Suserano', label: 'Juramentada à', align: 'left', field: 'Suserano', sortable: true },
  { name: 'Regiao', label: 'Região', align: 'left', field: 'Regiao', sortable: true },
  { name: 'Lema', label: 'Lema', align: 'left', field: 'Lema' },
  { name: 'actions', label: 'Ações', align: 'center', field: 'id' },
];

// 5. Buscar Dados
const fetchHouses = async () => {
  loading.value = true;
  try {
    const response = await client.request(readItems('Casas_Westeros'));
    houses.value = response as CasaWesteros[];
  } catch (error) {
    console.warn('Directus indisponível, usando dados estáticos:', error);
    houses.value = staticHouses;
  } finally {
    loading.value = false;
  }
};

// 6. Formulário
const openAddDialog = () => {
  isEditing.value = false;
  editingId.value = null;
  Object.assign(newHouse, {
    Nome: '',
    Categoria: 'Casa Vassala',
    Regiao: '',
    Lema: '',
    Cor: '#CBA135',
    Cor2: '#000000',
    Icone: 'shield',
    Suserano: '',
  });
  arquivoBrasao.value = null;
  showAddDialog.value = true;
};

const editHouse = (house: CasaWesteros) => {
  isEditing.value = true;
  editingId.value = house.id || null;
  Object.assign(newHouse, {
    Nome: house.Nome,
    Categoria: house.Categoria || 'Casa Vassala',
    Regiao: house.Regiao,
    Lema: house.Lema || '',
    Cor: house.Cor || '#CBA135',
    Cor2: house.Cor2 || '#000000',
    Icone: house.Icone || 'shield',
    Suserano: house.Suserano || '',
  });
  arquivoBrasao.value = null;
  showAddDialog.value = true;
};

const saveHouse = async () => {
  sending.value = true;
  try {
    let idDaImagem = null;

    // A. SE o usuário escolheu uma imagem, fazemos o upload primeiro
    if (arquivoBrasao.value) {
      const formData = new FormData();
      formData.append('title', `Brasão - ${newHouse.Nome}`);
      formData.append('file', arquivoBrasao.value);

      // Envia pro cofre do Directus
      const uploadResult = await client.request(uploadFiles(formData));
      idDaImagem = uploadResult.id; // Pega o código da imagem gerado
    }

    // B. Agora criamos a Casa, juntando os textos e o ID da imagem
    const dadosParaSalvar: CasaWesteros = {
      ...newHouse,
    };

    // Só enviamos o Brasao se uma nova imagem foi feita upload
    if (idDaImagem) {
      dadosParaSalvar.Brasao = idDaImagem;
    }

    if (isEditing.value && editingId.value) {
      await client.request(updateItem('Casas_Westeros', editingId.value, dadosParaSalvar));
    } else {
      await client.request(createItem('Casas_Westeros', dadosParaSalvar));
    }

    // Resetar formulário
    Object.assign(newHouse, {
      Nome: '',
      Categoria: 'Casa Vassala',
      Regiao: '',
      Lema: '',
      Cor: '#CBA135',
      Cor2: '#000000',
      Icone: 'shield',
      Suserano: '',
    });
    arquivoBrasao.value = null; // Limpa o campo de arquivo
    showAddDialog.value = false;
    isEditing.value = false;
    editingId.value = null;

    await fetchHouses();
  } catch (error) {
    console.error('Erro ao salvar (verifique as permissões de Directus Files!):', error);
  } finally {
    sending.value = false;
  }
};

const deleteHouse = async (id: string | number) => {
  // Uma confirmação simples antes de apagar
  if (confirm('Tem certeza que deseja apagar este registro do Arquivo?')) {
    loading.value = true;
    try {
      await client.request(deleteItem('Casas_Westeros', id));
      await fetchHouses(); // Atualiza a lista após apagar
    } catch (error) {
      console.error('Erro ao apagar:', error);
    } finally {
      loading.value = false;
    }
  }
};

const abrirCasa = async (casa: CasaWesteros) => {
  const casaId = casa.id || '';
  await router.push({ name: 'house-details', params: { id: String(casaId) } });
};

const filteredHouses = computed(() => {
  if (tab.value === 'todas') return houses.value;
  return houses.value.filter((h) => h.Categoria === tab.value);
});

onMounted(fetchHouses);
</script>
