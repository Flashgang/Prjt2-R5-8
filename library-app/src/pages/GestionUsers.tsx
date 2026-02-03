import { useEffect, useState } from 'react';
import { Container, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Paper, Box, Chip, Avatar, CircularProgress, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { api } from '../services/api';
import AddUserDialog from '../components/AddUserDialog';

export default function GestionUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      // Tri sécurisé
      const sorted = (data as any[]).sort((a, b) => {
        const roleA = a.role ? a.role.id : 99;
        const roleB = b.role ? b.role.id : 99;
        return roleA - roleB;
      });
      setUsers(sorted);
    } catch (e) {
      console.error(e);
      setError("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      try {
        await api.deleteUser(id);
        fetchUsers(); 
      } catch (error) {
        alert("Impossible de supprimer.");
      }
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 10 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Gestion des Utilisateurs</Typography>
        
        <Button 
            variant="contained" 
            startIcon={<PersonAddIcon />} 
            onClick={() => setOpenDialog(true)}
        >
          Nouvel Utilisateur
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Avatar</TableCell>
              <TableCell>Nom d'utilisateur</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">Aucun utilisateur.</TableCell></TableRow>
            ) : (
                users.map((user) => {
                  const roleName = user.role ? user.role.name : "Sans rôle";
                  return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar sx={{ bgcolor: roleName === 'Bibliothécaire' ? '#9c27b0' : (roleName === 'Enseignant' ? '#ed6c02' : '#1976d2') }}>
                        {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">{user.username}</Typography>
                    </TableCell>
                    <TableCell>
                        <Chip 
                            label={roleName} 
                            color={roleName === 'Bibliothécaire' ? 'secondary' : (roleName === 'Enseignant' ? 'warning' : 'primary')} 
                            size="small" 
                            variant={roleName === 'Élève' ? 'outlined' : 'filled'}
                        />
                    </TableCell>
                    <TableCell>{user.email || "Non renseigné"}</TableCell>
                    <TableCell align="right">
                      {user.username !== 'admin' && (
                        <IconButton color="error" onClick={() => handleDelete(user.id)}>
                            <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                )})
            )}
          </TableBody>
        </Table>
      </Paper>

      
      <AddUserDialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        onUserAdded={fetchUsers} 
      />

    </Container>
  );
}