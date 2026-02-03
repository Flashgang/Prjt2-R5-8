import { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, CircularProgress, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Button, Chip, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, LinearProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import CategoryIcon from '@mui/icons-material/Category';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PieChartIcon from '@mui/icons-material/PieChart';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import axios from 'axios';

interface DashboardData {
  total_books: number;
  total_users: number;
  active_loans: number;
  late_loans: number;
  popular_books: { book__title: string; total_loans: number }[];
  books_by_category: { category__name: string; count: number }[];
  top_readers: { user__username: string; total_loans: number }[];
  loans_by_role: { user__role__name: string; count: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.role !== 'Bibliothécaire') {
      navigate('/');
      return;
    }
    axios.get('http://localhost:8000/api/dashboard/').then(res => setStats(res.data));
    api.getAllActiveLoans().then(data => setActiveLoans(data));
  }, [navigate, refresh]);

  const handleReturn = async (loanId: number) => {
    if (window.confirm("Confirmer le retour de ce livre ?")) {
      await api.returnBook(loanId);
      setRefresh(!refresh);
    }
  };

  const getRolePercentage = (roleName: string) => {
    if (!stats) return 0;
    const roleData = stats.loans_by_role.find(r => r.user__role__name === roleName);
    const totalLoans = stats.loans_by_role.reduce((acc, curr) => acc + curr.count, 0);
    return roleData && totalLoans > 0 ? (roleData.count / totalLoans) * 100 : 0;
  };

  if (!stats) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 10 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
        Tableau de Bord (Admin)
      </Typography>

      {/* --- KPI --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ bgcolor: stats.late_loans > 0 ? '#ffebee' : '#e8f5e9', border: stats.late_loans > 0 ? '1px solid red' : 'none' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarningIcon sx={{ fontSize: 40, color: stats.late_loans > 0 ? '#d32f2f' : '#2e7d32' }} />
              <Typography variant="h4" fontWeight="bold" color={stats.late_loans > 0 ? 'error' : 'success'}>
                {stats.late_loans}
              </Typography>
              <Typography fontWeight="bold" color={stats.late_loans > 0 ? 'error' : 'textSecondary'}>
                En Retard !
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <BookmarkIcon sx={{ fontSize: 40, color: '#ed6c02' }} />
              <Typography variant="h4" fontWeight="bold">{stats.active_loans}</Typography>
              <Typography color="text.secondary">Emprunts en cours</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <LibraryBooksIcon sx={{ fontSize: 40, color: '#1976d2' }} />
              <Typography variant="h4" fontWeight="bold">{stats.total_books}</Typography>
              <Typography color="text.secondary">Livres en stock</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
              <Typography variant="h4" fontWeight="bold">{stats.total_users}</Typography>
              <Typography color="text.secondary">Utilisateurs</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* --- ANALYSE --- */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WhatshotIcon color="error" /> Top 5 des Livres Populaires
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              {stats.popular_books.length === 0 ? <Typography>Aucune donnée.</Typography> : 
                stats.popular_books.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#ff5722', width: 30, height: 30, fontSize: '0.9rem' }}>{index + 1}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={item.book__title} secondary={`${item.total_loans} emprunt(s) cumulés`} />
                  </ListItem>
                ))
              }
            </List>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CategoryIcon color="primary" /> Répartition par Catégorie
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {stats.books_by_category.map((cat, index) => (
                <Chip key={index} label={`${cat.category__name}: ${cat.count}`} color="primary" variant="outlined" />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* --- UTILISATEURS --- */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEventsIcon sx={{ color: '#ffb300' }} /> Top 5 Meilleurs Lecteurs
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                    {stats.top_readers.map((reader, index) => (
                        <ListItem key={index}>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: index === 0 ? '#ffb300' : '#e0e0e0', color: '#000' }}>
                                    {reader.user__username.charAt(0).toUpperCase()}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                                primary={reader.user__username} 
                                secondary={<b>{reader.total_loans} emprunts au total</b>} 
                            />
                            {index === 0 && <EmojiEventsIcon sx={{ color: '#ffb300' }} />}
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PieChartIcon color="secondary" /> Activité par Rôle
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ mb: 3 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Élèves</Typography>
                        <Typography variant="body2" fontWeight="bold">{Math.round(getRolePercentage('Élève'))}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={getRolePercentage('Élève')} color="info" sx={{ height: 10, borderRadius: 5 }} />
                </Box>
                <Box sx={{ mb: 3 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Enseignants</Typography>
                        <Typography variant="body2" fontWeight="bold">{Math.round(getRolePercentage('Enseignant'))}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={getRolePercentage('Enseignant')} color="secondary" sx={{ height: 10, borderRadius: 5 }} />
                </Box>
            </Paper>
        </Grid>
      </Grid>

      {/* --- GESTION DES RETOURS --- */}
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Gestion des Retours ({activeLoans.length})
      </Typography>
      
      <Paper elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Livre</TableCell>
              <TableCell>Emprunté par</TableCell>
              <TableCell>Date retour prévue</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeLoans.map((loan) => {
              const returnDateObj = new Date(loan.return_date);
              const isLate = returnDateObj < new Date();
              return (
                <TableRow key={loan.id} sx={{ bgcolor: isLate ? '#ffebee' : 'inherit' }}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box component="img" src={loan.book_cover || "https://via.placeholder.com/30"} alt="" sx={{ width: 30, height: 45, borderRadius: 1, objectFit: 'cover' }} />
                      <Typography variant="body2" fontWeight="bold">{loan.book_title || "Titre inconnu"}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{loan.username || "Inconnu"}</TableCell> 
                  <TableCell sx={{ color: isLate ? '#d32f2f' : 'inherit', fontWeight: isLate ? 'bold' : 'normal' }}>
                    {returnDateObj.toLocaleDateString()}
                    {isLate && <Chip label="RETARD" color="error" size="small" sx={{ ml: 1, height: 20, fontSize: '0.6rem' }} />}
                  </TableCell>
                  <TableCell align="right">
                    <Button variant="contained" color="success" size="small" startIcon={<CheckCircleIcon />} onClick={() => handleReturn(loan.id)}>Rendre</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}