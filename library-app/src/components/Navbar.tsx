import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold' }}
          onClick={() => navigate('/')}
        >
          Ma Bibliothèque
        </Typography>

        {user ? (
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body1">
              Bonjour, <strong>{user.username}</strong> ({user.role})
            </Typography>

            <Button color="inherit" onClick={() => navigate('/mes-emprunts')}>
              Mes Emprunts
            </Button>

            {user.role === 'Bibliothécaire' && (
              <>
                <Button color="inherit" onClick={() => navigate('/dashboard')}>Dashboard</Button>
                  <Button color="inherit" onClick={() => navigate('/gestion-livres')}>Livres</Button>
                  
                  <Button color="inherit" onClick={() => navigate('/gestion-users')}>Utilisateurs</Button>
                </>
            )}

            <Button color="inherit" onClick={handleLogout} variant="outlined" sx={{ borderColor: 'white' }}>
              Se déconnecter
            </Button>
          </Box>
        ) : (
          <Button color="inherit" onClick={() => navigate('/login')}>
            Se connecter
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}