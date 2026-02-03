import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Grid, Typography, Box, Button, Chip, CircularProgress, Paper, Divider, Alert, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook'; 
import BusinessIcon from '@mui/icons-material/Business'; 
import QrCodeIcon from '@mui/icons-material/QrCode'; 
import axios from 'axios';
import { api } from '../services/api';

// On étend l'interface locale pour être sûr d'avoir tous les champs
interface BookDetail {
  id: number;
  title: string;
  author: string;
  category: number;
  category_name?: string;
  cover: string;
  description: string;
  stock: number;
  access_level: string;
  status: string;
  isbn?: string;
  editor?: string;
  page_count?: number;
  publication_date?: string;
}

export default function LivreView() {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState("https://via.placeholder.com/300");

  // États pour le Pop-up Prof
  const [openDialog, setOpenDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [returnDate, setReturnDate] = useState('');

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isProf = user?.role === 'Enseignant';

  useEffect(() => {
    const loadBook = async () => {
      if (id) {
        try {
          const data = await api.getBook(id);
          setBook(data as unknown as BookDetail);
          setImgSrc(data?.cover || "https://via.placeholder.com/300");
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    };
    loadBook();
  }, [id]);

  const handleBorrowClick = () => {
    if (!user) { navigate('/login'); return; }

    if (isProf) {
      setOpenDialog(true);
    } else {
      executeBorrow(1, null);
    }
  };

  const executeBorrow = async (qty: number, date: string | null) => {
    try {
      await axios.post(`http://localhost:8000/api/books/${id}/borrow/`, {
        user_id: user.id,
        quantity: qty,
        return_date: date
      });
      
      if(book) setBook({ ...book, stock: book.stock - qty });
      
      setMessage(`Emprunt réussi (${qty} ex.) !`);
      setOpenDialog(false);
    } catch (error: any) {
      setMessage(`Erreur : ${error.response?.data?.error || "Problème serveur"}`);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!book) return <Container>Livre introuvable</Container>;

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 10 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 3 }}>Retour au catalogue</Button>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {message && <Alert severity={message.includes('Valide') ? 'success' : 'error'} sx={{ mb: 3 }}>{message}</Alert>}

        <Grid container spacing={4}>
          {/* COLONNE GAUCHE : IMAGE */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box 
              component="img" 
              src={imgSrc} 
              alt={book.title}
              onError={() => setImgSrc("https://via.placeholder.com/350x500?text=Image+Introuvable")}
              sx={{ 
                width: '100%',       // Prend toute la largeur de la colonne
                maxWidth: '350px',   // Mais ne dépasse jamais 350px de large (pour ne pas être énorme sur grand écran)
                height: '500px',     // HAUTEUR FIXE POUR TOUS LES LIVRES
                objectFit: 'cover',  // "Remplis le cadre, quitte à couper un peu les bords"
                
                borderRadius: 2, 
                boxShadow: 6,        // Ombre un peu plus marquée pour faire ressortir
                bgcolor: '#f0f0f0'   // Fond gris clair propre si ça charge
              }} 
            />
          </Grid>

          {/* COLONNE DROITE : INFOS */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={book.stock > 0 ? `En stock : ${book.stock}` : "Rupture"} color={book.stock > 0 ? 'success' : 'error'} />
                {book.access_level === 'Teacher' && <Chip label="Réservé Profs" color="secondary" />}
                {book.category_name && <Chip label={book.category_name} variant="outlined" />}
            </Box>

            <Typography variant="h3" fontWeight="bold" sx={{ lineHeight: 1.2, mb: 1 }}>{book.title}</Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>de {book.author}</Typography>

            
            <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }} alignItems="center">
              {book.page_count && book.page_count > 0 && (
                <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                   <MenuBookIcon fontSize="small" /> 
                   <Typography variant="body2">{book.page_count} pages</Typography>
                </Box>
              )}
              
              {book.editor && (
                <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                   <BusinessIcon fontSize="small" /> 
                   <Typography variant="body2">{book.editor}</Typography>
                </Box>
              )}

              {book.isbn && (
                <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                   <QrCodeIcon fontSize="small" /> 
                   <Typography variant="body2">ISBN: {book.isbn}</Typography>
                </Box>
              )}
            </Stack>

            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="h6" gutterBottom>Résumé</Typography>
            <Typography paragraph color="text.secondary" sx={{ fontStyle: book.description ? 'normal' : 'italic' }}>
              {book.description || "Aucune description disponible pour ce livre."}
            </Typography>

            <Button 
                variant="contained" 
                size="large" 
                fullWidth
                disabled={book.stock <= 0}
                onClick={handleBorrowClick}
                sx={{ mt: 4, py: 1.5, fontSize: '1.1rem' }}
            >
                {book.stock > 0 ? (isProf ? "Configurer l'emprunt (Prof)" : "Emprunter ce livre") : "Indisponible"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Options d'emprunt Enseignant</DialogTitle>
        <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 300 }}>
                <TextField
                    label="Quantité souhaitée"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    inputProps={{ min: 1, max: book.stock }}
                    helperText={`Max disponible : ${book.stock}`}
                    fullWidth
                />
                <TextField
                    label="Date limite de retour"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    fullWidth
                    helperText="Laissez vide pour la durée standard (14 jours)"
                />
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
            <Button variant="contained" onClick={() => executeBorrow(quantity, returnDate)}>
                Valider
            </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}