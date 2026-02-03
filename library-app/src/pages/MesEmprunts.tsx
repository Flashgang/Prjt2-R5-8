import { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, Box, CircularProgress } from '@mui/material';
import { api } from '../services/api';

export default function MesEmprunts() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      api.getMyLoans(user.id).then(data => {
        setLoans(data);
        setLoading(false);
      });
    }
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">Mes Emprunts</Typography>
      
      <Paper elevation={3} sx={{ mt: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Livre</TableCell>
              <TableCell>Date d'emprunt</TableCell>
              <TableCell>Date de retour prévue</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">Vous n'avez aucun emprunt en cours.</TableCell>
              </TableRow>
            ) : (
              loans.map((loan) => {
                const dateRendu = loan.return_date ? new Date(loan.return_date) : null;
                const isLate = loan.status === 'En cours' && dateRendu && dateRendu < new Date();

                return (
                  <TableRow key={loan.id} sx={{ bgcolor: isLate ? '#ffebee' : 'inherit' }}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <img 
                          src={loan.book_cover || "https://via.placeholder.com/40x60"} 
                          alt="" 
                          style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 4 }} 
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">{loan.book_title}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{new Date(loan.loan_date).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ color: isLate ? 'red' : 'inherit', fontWeight: isLate ? 'bold' : 'normal' }}>
                      {/* AFFICHAGE DE LA DATE CORRIGÉ */}
                      {dateRendu ? dateRendu.toLocaleDateString() : "Non définie"}
                      {isLate && " (Retard)"}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={loan.status} 
                        color={loan.status === 'Retourné' ? 'success' : (isLate ? 'error' : 'primary')} 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}