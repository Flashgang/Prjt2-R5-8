import { useEffect, useState } from 'react';
import { Container, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Paper, Box, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { api } from '../services/api';
import AddBookDialog from '../components/AddBookDialog';

export default function GestionLivres() {
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  
  // NOUVEAU : Pour stocker le livre qu'on veut modifier
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  const fetchData = async () => {
    const [booksData, catsData] = await Promise.all([
      api.getBooks(),
      api.getCategories()
    ]);
    // On trie par ID pour que les nouveaux apparaissent en bas (ou inversement)
    setBooks((booksData as any[]).sort((a, b) => b.id - a.id));
    setCategories(catsData as any[]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce livre ?")) {
      await api.deleteBook(id);
      fetchData();
    }
  };

  // QUAND ON CLIQUE SUR "AJOUTER"
  const handleOpenAdd = () => {
    setSelectedBook(null); // On s'assure qu'on est en mode "Ajout" (pas de livre sélectionné)
    setOpenDialog(true);
  };

  // QUAND ON CLIQUE SUR "MODIFIER"
  const handleOpenEdit = (book: any) => {
    setSelectedBook(book); // On charge le livre dans le formulaire
    setOpenDialog(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 10 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Gestion des Livres</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
          Nouveau Livre
        </Button>
      </Box>

      <Paper elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Couverture</TableCell>
              <TableCell>Titre / Auteur</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Accès</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id}>
                <TableCell>{book.id}</TableCell>
                <TableCell>
                    <img src={book.cover || "https://via.placeholder.com/40"} alt="cover" style={{width: 40, height: 60, objectFit: 'cover', borderRadius: 4}} />
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">{book.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{book.author}</Typography>
                </TableCell>
                <TableCell>
                    <Chip label={book.stock} color={book.stock > 0 ? 'success' : 'error'} size="small" />
                </TableCell>
                <TableCell>
                    {book.access_level === 'Teacher' ? 
                        <Chip label="Profs" color="secondary" size="small" variant="outlined" /> : 
                        <Chip label="Tous" size="small" variant="outlined" />
                    }
                </TableCell>
                <TableCell align="right">
                  {/* BOUTON MODIFIER */}
                  <IconButton color="primary" onClick={() => handleOpenEdit(book)} sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  
                  {/* BOUTON SUPPRIMER */}
                  <IconButton color="error" onClick={() => handleDelete(book.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* La fenêtre unique qui sert à AJOUTER ou MODIFIER */}
      <AddBookDialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        onBookAdded={fetchData} 
        categories={categories}
        bookToEdit={selectedBook} // On passe le livre à modifier (ou null)
      />
    </Container>
  );
}