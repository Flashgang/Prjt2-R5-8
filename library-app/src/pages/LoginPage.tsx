import { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api'; // On utilise notre vraie API

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // 1. On demande à Django si c'est bon
      const user = await api.login(username, password);
      
      if (user) {
        // 2. Si c'est bon, on sauvegarde qui est connecté dans le navigateur
        localStorage.setItem('user', JSON.stringify(user));
        
        // 3. On va vers l'accueil
        alert(`Bienvenue ${user.username} ! Vous êtes connecté en tant que ${user.role}.`);
        navigate('/');
      }
    } catch (err) {
      setError("Nom d'utilisateur ou mot de passe incorrect.");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 15 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
          Connexion
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleLogin}>
          <TextField
            fullWidth label="Nom d'utilisateur" variant="outlined" margin="normal"
            value={username} onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            fullWidth label="Mot de passe" type="password" variant="outlined" margin="normal"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <Button fullWidth variant="contained" size="large" type="submit" sx={{ mt: 3 }}>
            Se connecter
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}