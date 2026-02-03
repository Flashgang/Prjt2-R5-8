import { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Chip, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import InventoryIcon from '@mui/icons-material/Inventory';

interface Book {
  id: number;
  title: string;
  author: string;
  category: number;
  cover: string;
  description: string;
  status: 'Disponible' | 'Emprunté' | 'Indisponible';
  stock: number;
  access_level: string;
}

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate();
  
  const [imgSrc, setImgSrc] = useState(book.cover || "https://via.placeholder.com/200x300");

  useEffect(() => {
    setImgSrc(book.cover || "https://via.placeholder.com/200x300");
  }, [book.cover]);

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const canSeeStock = user && (user.role === 'Enseignant' || user.role === 'Bibliothécaire');

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {book.access_level === 'Teacher' && (
        <Chip 
          label="Prof Only" 
          color="secondary" 
          size="small" 
          sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }} 
        />
      )}

      <CardMedia
        component="img"
        height="280" 
        image={imgSrc}
        alt={book.title}
        sx={{ cursor: 'pointer', objectFit: 'cover' }} 
        onClick={() => navigate(`/book/${book.id}`)}
        onError={() => setImgSrc("https://via.placeholder.com/200x300?text=Pas+d'image")}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip 
            label={book.stock > 0 ? "Disponible" : "Rupture"} 
            color={book.stock > 0 ? 'success' : 'error'} 
            size="small" 
          />
          {canSeeStock && (
            <Chip 
              icon={<InventoryIcon />} 
              label={`Stock: ${book.stock}`} 
              variant="outlined" 
              color="primary" 
              size="small" 
            />
          )}
        </Box>

        <Typography variant="h6" component="div" sx={{ lineHeight: 1.2, mb: 0.5, fontSize: '1rem', fontWeight: 'bold' }}>
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {book.author}
        </Typography>
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Button 
          variant="contained" 
          fullWidth 
          disabled={book.stock <= 0}
          onClick={() => navigate(`/book/${book.id}`)}
        >
          {book.stock > 0 ? "Voir détails" : "Indisponible"}
        </Button>
      </Box>
    </Card>
  );
}