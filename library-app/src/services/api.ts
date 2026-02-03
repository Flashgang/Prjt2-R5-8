import axios from 'axios';

// --- TYPES ---
export interface Category {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  category: number;
  cover: string;
  description: string;
  status: 'Disponible' | 'Emprunté';
  stock: number;         
  access_level: string;
  isbn?: string;
  publication_date?: string;
  editor?: string;
  page_count?: number;
}

export interface User {
  id: number;
  username: string;
  role: string;
}

// --- CONFIG ---
const API_URL = 'http://localhost:8000/api/';

// --- API ---
export const api = {
  getBooks: async (): Promise<Book[]> => {
    try {
      const response = await axios.get(`${API_URL}books/`);
      return response.data;
    } catch (error) {
      console.error("Erreur API:", error);
      return [];
    }
  },

  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await axios.get(`${API_URL}categories/`);
      return response.data;
    } catch (error) {
      console.error("Erreur API:", error);
      return [];
    }
  },

  getBook: async (id: string): Promise<Book | null> => {
    try {
      const response = await axios.get(`${API_URL}books/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Erreur livre:", error);
      return null;
    }
  },

  login: async (username: string, password: string): Promise<User | null> => {
    try {
      const response = await axios.post(`${API_URL}login/`, {
        username: username,
        password: password
      });
      return response.data;
    } catch (error) {
      console.error("Erreur Login:", error);
      throw new Error("Identifiants incorrects");
    }
  },

  createBook: async (bookData: any): Promise<Book | null> => {
    try {
      const response = await axios.post(`${API_URL}books/`, bookData);
      return response.data;
    } catch (error) {
      console.error("Erreur création livre:", error);
      throw error;
    }
  },

  deleteBook: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}books/${id}/`);
    } catch (error) {
      console.error("Erreur suppression livre:", error);
      throw error;
    }
  },

  returnBook: async (loanId: number): Promise<void> => {
    try {
      await axios.post(`${API_URL}loans/${loanId}/return/`);
    } catch (error) {
      console.error("Erreur retour livre:", error);
      throw error;
    }
  },
  
  getAllActiveLoans: async (): Promise<any[]> => {
    const response = await axios.get(`${API_URL}loans/active/`);
    return response.data;
  },

  getMyLoans: async (userId: number): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_URL}my-loans/?user_id=${userId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur chargement emprunts:", error);
      return [];
    }
  },
  searchBookByIsbn: async (isbn: string): Promise<any> => {
    try {
      // Requete vers l'API publique de Google
      const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
      
      if (response.data.totalItems > 0) {
        const bookData = response.data.items[0].volumeInfo;
        return {
          title: bookData.title,
          author: bookData.authors ? bookData.authors[0] : "Auteur inconnu",
          cover: bookData.imageLinks?.thumbnail || "",
          description: bookData.description || "",
          page_count: bookData.pageCount || 0,
          editor: bookData.publisher || "",
          publication_date: bookData.publishedDate || ""
        };
      }
      return null;
    } catch (error) {
      console.error("Erreur Google Books:", error);
      return null;
    }
  },

  addBook: async (bookData: any) => {
    const response = await axios.post(`${API_URL}books/`, bookData);
    return response.data;
  },

  updateBook: async (id: number, bookData: any) => {
    const response = await axios.put(`${API_URL}books/${id}/`, bookData);
    return response.data;
  },

  getRoles: async () => {
    const response = await axios.get(`${API_URL}roles/`);
    return response.data;
  },

  getUsers: async () => {
    const response = await axios.get(`${API_URL}users/`);
    return response.data;
  },
  addUser: async (userData: any) => {
    const response = await axios.post(`${API_URL}users/`, userData);
    return response.data;
  },
  deleteUser: async (id: number) => {
    await axios.delete(`${API_URL}users/${id}/`);
  },
};