export interface CasaWesteros {
  id?: string | number;
  Nome: string;
  Regiao: string;
  Lema: string;
  Cor?: string;
  Cor2?: string;
  Icone?: string;
  Brasao?: string;
  Categoria?: 'Grande Casa' | 'Casa Vassala';
  Suserano?: string;
}

export interface Personagem {
  id?: string | number;
  Nome: string;
  Alcunha?: string;
  Status?: 'Vivo' | 'Morto' | 'Desconhecido';
  Icone?: string;
  Importancia?: 'Protagonistas' | 'Membros Notaveis' | 'Demais Membros';
  Casa_ID?: string | number;
}
