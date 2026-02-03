import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid, Box, Alert } from '@mui/material';
import { api } from '../services/api';

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

export default function AddUserDialog({ open, onClose, onUserAdded }: AddUserDialogProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role_id: '' // On stocke l'ID du rôle sélectionné
  });
  const [roles, setRoles] = useState<any[]>([]);
  const [error, setError] = useState('');

  // Charger la liste des rôles quand la fenêtre s'ouvre
  useEffect(() => {
    if (open) {
      api.getRoles().then(data => setRoles(data)).catch(console.error);
      setFormData({ username: '', email: '', password: '', role_id: '' });
      setError('');
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.password || !formData.role_id) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      await api.addUser(formData);
      alert("Utilisateur créé avec succès !");
      onUserAdded();
      onClose();
    } catch (err) {
      setError("Erreur lors de la création. Le nom d'utilisateur existe peut-être déjà.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
        <Box component="form" sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                name="username" label="Nom d'utilisateur" fullWidth required 
                value={formData.username} onChange={handleChange} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                name="email" label="Email (Optionnel)" type="email" fullWidth 
                value={formData.email} onChange={handleChange} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                name="password" label="Mot de passe" type="password" fullWidth required 
                value={formData.password} onChange={handleChange} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                select name="role_id" label="Rôle" fullWidth required 
                value={formData.role_id} onChange={handleChange}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Annuler</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
            Créer
        </Button>
      </DialogActions>
    </Dialog>
  );
}