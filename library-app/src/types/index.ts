// src/types/index.ts

// 1. Définition de la Catégorie
export interface Category {
  id: number;
  name: string;
}

// 2. Définition du Livre
export interface Book {
  id: number;
  title: string;
  author: string;
  categoryId: number;
  cover: string;
  description: string;
  status: 'Disponible' | 'Emprunté';
  isbn?: string;
  publication_date?: string;
  editor?: string;
  page_count?: number;
}