import type { Personagem } from '../types/westeros';

/**
 * Dados estáticos dos Personagens de Westeros.
 * Esses dados são exibidos quando o Directus não está disponível.
 *
 * Para o campo Icone: use o nome do arquivo em public/personagens/ (ex: 'jon_snow.png')
 * Casa_ID: deve corresponder ao id de uma casa em houses.ts
 * Status: 'Vivo' | 'Viva' | 'Morto' | 'Morta' | 'Desconhecido'
 * Importancia: 'Protagonistas' | 'Membros Notaveis' | 'Demais Membros'
 */
export const staticCharacters: Personagem[] = [
  // ============ CASA STARK (Casa_ID: 1) ============
  {
    id: 1,
    Nome: 'Jon Snow',
    Alcunha: 'O Lobo Branco',
    Status: 'Desconhecido',
    Icone: 'jon_snow.png',
    Importancia: 'Protagonistas',
    Casa_ID: 1,
  },

  {
    id: 11,
    Nome: 'Arya Stark',
    Alcunha: '',
    Status: 'Viva',
    Icone: 'arya_stark.png',
    Importancia: 'Protagonistas',
    Casa_ID: 1,
  },

  {
    id: 12,
    Nome: 'Catelyn Stark',
    Alcunha: '',
    Status: 'Morta',
    Icone: 'Catelyn_Stark.png',
    Importancia: 'Protagonistas',
    Casa_ID: 1,
  },

  {
    id: 13,
    Nome: 'Rickon Stark',
    Alcunha: '',
    Status: 'Vivo',
    Icone: 'Rickon_Stark.png',
    Importancia: 'Membros Notaveis',
    Casa_ID: 1,
  },

  {
    id: 14,
    Nome: 'Rickard Stark',
    Alcunha: '',
    Status: 'Morto',
    Icone: 'Rickard_Stark.png',
    Importancia: 'Membros Notaveis',
    Casa_ID: 1,
  },

  // ============ CASA LANNISTER (Casa_ID: 2) ============
  {
    id: 2,
    Nome: 'Jaime Lannister',
    Alcunha: 'Reigicida',
    Status: 'Vivo',
    Icone: 'Jamie_Lannister.jpg',
    Importancia: 'Protagonistas',
    Casa_ID: 2,
  },

  {
    id: 15,
    Nome: 'Tywin Lannister',
    Alcunha: '',
    Status: 'Morto',
    Icone: 'tywin_lannister.png',
    Importancia: 'Membros Notaveis',
    Casa_ID: 2,
  },

  {
    id: 16,
    Nome: 'Lancel Lannister',
    Alcunha: '',
    Status: 'Vivo',
    Icone: 'Lancel_Lannister.png',
    Importancia: 'Membros Notaveis',
    Casa_ID: 2,
  },

  // ============ CASA TARGARYEN (Casa_ID: 3) ============
  {
    id: 3,
    Nome: 'Daenerys Targaryen',
    Alcunha: 'Mãe dos Dragões',
    Status: 'Viva',
    Icone: 'Daenerys_Targaryen.jpg',
    Importancia: 'Protagonistas',
    Casa_ID: 3,
  },

  {
    id: 17,
    Nome: 'Rhaegar Targaryen',
    Alcunha: '',
    Status: 'Morto',
    Icone: 'Rhaegar_Targaryen.png',
    Importancia: 'Membros Notaveis',
    Casa_ID: 3,
  },

  {
    id: 18,
    Nome: 'Viserys Targaryen',
    Alcunha: '',
    Status: 'Morto',
    Icone: 'Viserys_Targaryen.png',
    Importancia: 'Membros Notaveis',
    Casa_ID: 3,
  },

  // ============ CASA BARATHEON (Casa_ID: 4) ============
  {
    id: 4,
    Nome: 'Stannis Baratheon',
    Alcunha: 'Azor Ahai',
    Status: 'Vivo',
    Icone: 'Stannis_Baratheon.jpg',
    Importancia: 'Membros Notaveis',
    Casa_ID: 4,
  },

  // ============ CASA GREYJOY (Casa_ID: 5) ============
  {
    id: 5,
    Nome: 'Euron Greyjoy',
    Alcunha: 'Olho de Corvo',
    Status: 'Vivo',
    Icone: 'Euron_Greyjoy.jpg',
    Importancia: 'Membros Notaveis',
    Casa_ID: 5,
  },

  {
    id: 19,
    Nome: 'Theon Greyjoy',
    Alcunha: '',
    Status: 'Vivo',
    Icone: 'theon_greyjoy.jpg',
    Importancia: 'Protagonistas',
    Casa_ID: 5,
  },

  // ============ CASA MARTELL (Casa_ID: 7) ============
  {
    id: 6,
    Nome: 'Oberyn Martell',
    Alcunha: '',
    Status: 'Morto',
    Icone: 'Oberyn_Martell.jpg',
    Importancia: 'Membros Notaveis',
    Casa_ID: 7,
  },

  {
    id: 20,
    Nome: 'Arianne Martell',
    Alcunha: '',
    Status: 'Viva',
    Icone: 'arianne_martell.jpg',
    Importancia: 'Protagonistas',
    Casa_ID: 7,
  },

  // ============ CASA TULLY (Casa_ID: 8) ============
  {
    id: 7,
    Nome: 'Edmure Tully',
    Alcunha: '',
    Status: 'Vivo',
    Icone: 'Edmure_Tully.jpg',
    Importancia: 'Membros Notaveis',
    Casa_ID: 8,
  },

  {
    id: 21,
    Nome: 'Brynden Tully',
    Alcunha: '',
    Status: 'Vivo',
    Icone: 'brynden_Tully.png',
    Importancia: 'Membros Notaveis',
    Casa_ID: 8,
  },

  // ============ CASA TYRELL (Casa_ID: 9) ============
  {
    id: 8,
    Nome: 'Olenna Tyrell',
    Alcunha: 'Rainha dos Espinhos',
    Status: 'Viva',
    Icone: 'Olenna_Tyrell.jpg',
    Importancia: 'Membros Notaveis',
    Casa_ID: 9,
  },

  // ============ CASA SEAWORTH (Casa_ID: 10) ============
  {
    id: 9,
    Nome: 'Davos Seaworth',
    Alcunha: 'Cavalheiro das Cebolas',
    Status: 'Vivo',
    Icone: 'Davos_Seaworth.png',
    Importancia: 'Protagonistas',
    Casa_ID: 10,
  },

  // ============ CASA MANDERLY (Casa_ID: 11) ============
  {
    id: 10,
    Nome: 'Wyman Manderly',
    Alcunha: 'Lorde Gordo',
    Status: 'Vivo',
    Icone: 'Wyman_Manderly.jpg',
    Importancia: 'Membros Notaveis',
    Casa_ID: 11,
  },

  // ============ CASA ARRYN (Casa_ID: 6) ============
  {
    id: 22,
    Nome: 'Jon Arryn',
    Alcunha: '',
    Status: 'Morto',
    Icone: 'jon_arryn.png',
    Importancia: 'Membros Notaveis',
    Casa_ID: 6,
  },
  // Adicione mais personagens abaixo seguindo o mesmo formato:
  // {
  //   id: 11,
  //   Nome: '',
  //   Alcunha: '',
  //   Status: 'Vivo',
  //   Icone: '',
  //   Importancia: 'Demais Membros',
  //   Casa_ID: 1,
  // },
];
