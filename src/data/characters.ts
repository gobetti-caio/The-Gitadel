import type { Personagem } from '../types/westeros';

/**
 * Dados estáticos dos Personagens de Westeros.
 * Esses dados são exibidos quando o Directus não está disponível.
 *
 * Para o campo Icone: use o nome do arquivo em public/personagens/ (ex: 'jon_snow.png')
 * Casa_ID: deve corresponder ao id de uma casa em houses.ts
 * Status: 'Vivo' | 'Morto' | 'Desconhecido'
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

  // ============ CASA LANNISTER (Casa_ID: 2) ============
  {
    id: 2,
    Nome: 'Jaime Lannister',
    Alcunha: '',
    Status: 'Morto',
    Icone: 'Jamie_Lannister.jpg',
    Importancia: 'Protagonistas',
    Casa_ID: 2,
  },

  // ============ CASA TARGARYEN (Casa_ID: 3) ============
  {
    id: 3,
    Nome: 'Daenerys Targaryen',
    Alcunha: '',
    Status: 'Morto',
    Icone: 'Daenerys_Targaryen.jpg',
    Importancia: 'Protagonistas',
    Casa_ID: 3,
  },

  // ============ CASA BARATHEON (Casa_ID: 4) ============
  {
    id: 4,
    Nome: 'Stannis Baratheon',
    Alcunha: '',
    Status: 'Morto',
    Icone: 'Stannis_Baratheon.jpg',
    Importancia: 'Protagonistas',
    Casa_ID: 4,
  },

  // ============ CASA GREYJOY (Casa_ID: 5) ============
  {
    id: 5,
    Nome: 'Euron Greyjoy',
    Alcunha: '',
    Status: 'Morto',
    Icone: 'Euron_Greyjoy.jpg',
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
    Importancia: 'Protagonistas',
    Casa_ID: 8,
  },

  // ============ CASA TYRELL (Casa_ID: 9) ============
  {
    id: 8,
    Nome: 'Olenna Tyrell',
    Alcunha: '',
    Status: 'Morto',
    Icone: 'Olenna_Tyrell.jpg',
    Importancia: 'Protagonistas',
    Casa_ID: 9,
  },

  // ============ CASA SEAWORTH (Casa_ID: 10) ============
  {
    id: 9,
    Nome: 'Davos Seaworth',
    Alcunha: '',
    Status: 'Vivo',
    Icone: 'Davos_Seaworth.png',
    Importancia: 'Protagonistas',
    Casa_ID: 10,
  },

  // ============ CASA MANDERLY (Casa_ID: 11) ============
  {
    id: 10,
    Nome: 'Wyman Manderly',
    Alcunha: '',
    Status: 'Vivo',
    Icone: 'Wyman_Manderly.jpg',
    Importancia: 'Protagonistas',
    Casa_ID: 11,
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
