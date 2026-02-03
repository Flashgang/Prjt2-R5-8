import { useState, useEffect } from 'react';
import { Container, Typography, Grid, TextField, InputAdornment, Box, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, ListItemIcon, Pagination, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import BookCard from '../components/BookCard';
import CategoryFilter from '../components/CategoryFilter';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Category { id: number; name: string; }
interface Book {
  id: number; title: string; author: string; category: number; cover: string;
  description: string; status: 'Disponible' | 'Emprunté' | 'Indisponible'; stock: number; access_level: string;
  isbn?: string; publication_date?: string; editor?: string; page_count?: number;
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // PAGINATION
  const [page, setPage] = useState(1);
  const itemsPerPage = 20; // 20 est un multiple de 4, donc tes lignes seront toujours complètes !

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const [openAlert, setOpenAlert] = useState(false);
  const [urgentLoans, setUrgentLoans] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksData, categoriesData] = await Promise.all([
          api.getBooks(),
          api.getCategories()
        ]);
        setBooks(booksData as unknown as Book[]);
        setCategories(categoriesData as unknown as Category[]);

        // --- DÉTECTION DES RETARDS ---
        if (user) {
          const myLoans = await api.getMyLoans(user.id);
          const today = new Date();
          
          const problems = myLoans.filter((loan: any) => {
            if (loan.status === 'Retourné') return false;
            
            const returnDate = new Date(loan.return_date);
            const diffTime = returnDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // On affiche le pop-up si le livre est déjà en retard (diffDays <= 0)
            // ou s'il doit être rendu dans les 3 prochains jours.
            return diffDays <= 3;
          });

          if (problems.length > 0) {
            setUrgentLoans(problems);
            setOpenAlert(true);
          }
        }
      } catch (err) {
        setError("Erreur connexion serveur.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? book.category === selectedCategory : true;

    let isVisible = true;
    if (book.access_level === 'Teacher') {
        if (!user || (user.role !== 'Enseignant' && user.role !== 'Bibliothécaire')) {
            isVisible = false;
        }
    }
    return matchesSearch && matchesCategory && isVisible;
  });

  const count = Math.ceil(filteredBooks.length / itemsPerPage);
  const booksOnCurrentPage = filteredBooks.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    // 1. maxWidth="xl" : Centre le contenu sur la page avec des marges sur les côtés
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}> 
      
      {/* --- Alert Dialog --- */}
      <Dialog open={openAlert} onClose={() => setOpenAlert(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f', fontWeight: 'bold' }}>
          <WarningIcon /> ATTENTION : Livres à rendre !
        </DialogTitle>
        <DialogContent>
          <List>
  {urgentLoans.map((loan) => {
    const diff = Math.ceil((new Date(loan.return_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    const isLate = diff < 0;
    
    return (
      <ListItem key={loan.id} sx={{ bgcolor: isLate ? '#ffebee' : '#fff3e0', borderRadius: 1, mb: 1 }}>
        <ListItemIcon>
          {isLate ? <ErrorIcon color="error" /> : <WarningIcon color="warning" />}
        </ListItemIcon>
        <ListItemText 
          primary={loan.book_title}
          secondary={isLate ? `EN RETARD de ${Math.abs(diff)} jours !` : `À rendre dans ${diff} jours`}
          primaryTypographyProps={{ fontWeight: 'bold' }}
        />
      </ListItem>
    );
  })}
</List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAlert(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>Bibliothèque Universitaire</Typography>
        <TextField
          placeholder="Rechercher un livre..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          sx={{ bgcolor: 'white', width: '100%', maxWidth: '500px' }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <CategoryFilter 
        categories={categories} 
        selectedCategory={selectedCategory} 
        onSelectCategory={(id) => { setSelectedCategory(id); setPage(1); }} 
      />

      {/* 2. GRILLE STRICTE DE 4 COLONNES */}
      <Grid container spacing={4} justifyContent="center"> 
        {booksOnCurrentPage.map((book) => (
          // xs=12 (Mobile: 1)
          // sm=6  (Tablette: 2)
          // md=3  (Petit PC: 4)  -> 12/3 = 4
          // lg=3  (Grand PC: 4)  -> 12/3 = 4 
          // xl=3  (Écran Géant: 4) -> On reste à 4
          <Grid item key={book.id} xs={12} sm={6} md={3} lg={3} xl={3}>
            <BookCard book={book} />
          </Grid>
        ))}
      </Grid>

      {count > 1 && (
        <Stack spacing={2} alignItems="center" sx={{ mt: 6 }}>
          <Pagination 
            count={count} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            size="large"
            showFirstButton 
            showLastButton
          />
        </Stack>
      )}

    </Container>
  );
}