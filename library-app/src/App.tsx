import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LivreView from './pages/LivreView'; 
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import MesEmprunts from './pages/MesEmprunts';
import Dashboard from './pages/Dashboard';
import GestionLivres from './pages/GestionLivres'; 
import GestionUsers from './pages/GestionUsers';

const theme = createTheme({
  palette: {
    primary: { main: '#2563eb' },
    secondary: { main: '#dc2626' },
    background: { default: '#f3f4f6' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
      <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book/:id" element={<LivreView />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/mes-emprunts" element={<MesEmprunts />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gestion-livres" element={<GestionLivres />} /> 
          <Route path="/gestion-users" element={<GestionUsers />} />      
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;