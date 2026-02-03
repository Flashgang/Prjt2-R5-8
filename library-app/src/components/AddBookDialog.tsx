import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid, Box } from '@mui/material';
import { api } from '../services/api';

interface Category {
  id: number;
  name: string;
}

interface AddBookDialogProps {
  open: boolean;
  onClose: () => void;
  onBookAdded: () => void;
  categories: Category[];
  bookToEdit?: any | null; 
}

export default function AddBookDialog({ open, onClose, onBookAdded, categories, bookToEdit }: AddBookDialogProps) {
  
  // Initialisation de l'état avec tous les champs possibles
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    stock: 1,
    access_level: 'Student', // 'Student' ou 'Teacher'
    isbn: '',
    editor: '',
    page_count: 0,
    publication_date: '',
    cover: '',
    description: ''
  });

  // QUAND LA FENÊTRE S'OUVRE : On remplit les champs si on modifie, sinon on vide
  useEffect(() => {
    if (open) {
        if (bookToEdit) {
            // Mode Modification : On remplit avec les données du livre
            setFormData({
                title: bookToEdit.title || '',
                author: bookToEdit.author || '',
                category: bookToEdit.category || '',
                stock: bookToEdit.stock || 1,
                access_level: bookToEdit.access_level || 'Student',
                isbn: bookToEdit.isbn || '',
                editor: bookToEdit.editor || '',
                page_count: bookToEdit.page_count || 0,
                publication_date: bookToEdit.publication_date || '', // Format YYYY-MM-DD attendu
                cover: bookToEdit.cover || '',
                description: bookToEdit.description || ''
            });
        } else {
            // Mode Ajout : On remet tout à zéro
            setFormData({
                title: '', author: '', category: '', stock: 1, access_level: 'Student',
                isbn: '', editor: '', page_count: 0, publication_date: '', cover: '', description: ''
            });
        }
    }
  }, [open, bookToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      // Conversion des types pour l'API (nombres)
      const payload = {
        ...formData,
        category: parseInt(formData.category as string),
        stock: parseInt(formData.stock as unknown as string),
        page_count: parseInt(formData.page_count as unknown as string),
        // Si la date est vide, on envoie null pour éviter une erreur Django
        publication_date: formData.publication_date === '' ? null : formData.publication_date 
      };

      if (bookToEdit) {
        // --- MISE À JOUR ---
        await api.updateBook(bookToEdit.id, payload);
        alert("Livre modifié avec succès !");
      } else {
        // --- CRÉATION ---
        await api.addBook(payload);
        alert("Livre ajouté avec succès !");
      }
      
      onBookAdded(); // Rafraîchir la liste parente
      onClose();     // Fermer
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement. Vérifiez les champs obligatoires (Titre, Auteur, Catégorie).");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{bookToEdit ? "Modifier le livre" : "Ajouter un nouveau livre"}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            
            {/* --- INFO PRINCIPALES --- */}
            <Grid item xs={12} sm={6}>
              <TextField name="title" label="Titre du livre" fullWidth required value={formData.title} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="author" label="Auteur" fullWidth required value={formData.author} onChange={handleChange} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField select name="category" label="Catégorie" fullWidth required value={formData.category} onChange={handleChange}>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6} sm={3}>
                <TextField type="number" name="stock" label="Stock" fullWidth value={formData.stock} onChange={handleChange} />
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField select name="access_level" label="Accès" fullWidth value={formData.access_level} onChange={handleChange}>
                <MenuItem value="Student">Tout le monde</MenuItem>
                <MenuItem value="Teacher">Profs uniquement</MenuItem>
              </TextField>
            </Grid>

            {/* --- DÉTAILS TECHNIQUES --- */}
            <Grid item xs={12} sm={6}>
              <TextField name="isbn" label="Code ISBN" fullWidth value={formData.isbn} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="editor" label="Éditeur" fullWidth value={formData.editor} onChange={handleChange} />
            </Grid>
            
            <Grid item xs={6} sm={6}>
               <TextField type="number" name="page_count" label="Nb Pages" fullWidth value={formData.page_count} onChange={handleChange} />
            </Grid>
            <Grid item xs={6} sm={6}>
               <TextField type="date" name="publication_date" label="Date de publication" InputLabelProps={{ shrink: true }} fullWidth value={formData.publication_date} onChange={handleChange} />
            </Grid>

            {/* --- VISUEL & DESC --- */}
            <Grid item xs={12}>
              <TextField name="cover" label="URL de l'image de couverture" fullWidth placeholder="https://..." value={formData.cover} onChange={handleChange} />
            </Grid>
            
            <Grid item xs={12}>
              <TextField name="description" label="Résumé / Description" multiline rows={4} fullWidth value={formData.description} onChange={handleChange} />
            </Grid>

          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Annuler</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
            {bookToEdit ? "Enregistrer les modifications" : "Ajouter le livre"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}