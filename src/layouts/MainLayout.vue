<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-dark text-white shadow-2" style="border-bottom: 2px solid #CBA135;">
      <q-toolbar class="q-py-md">
        <q-toolbar-title class="text-center">
          <div class="font-cinzel text-h4 text-primary text-weight-bold" style="letter-spacing: 2px;">
            Arquivo da Cidadela
          </div>
          <div class="font-lora text-caption text-grey-5" style="letter-spacing: 4px; text-transform: uppercase;">
            Registros Oficiais de Westeros
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onMounted } from 'vue';

const $q = useQuasar();

onMounted(() => {
  // Ativa o Modo Escuro assim que o layout carrega
  $q.dark.set(true);
});
</script>
