import { Suspense, useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Box, useMediaQuery, Container, IconButton, LinearProgress } from '@mui/material';
import { Route, Routes } from 'react-router-dom';
import { createAppTheme } from './app/theme';
import { routes } from './app/routes';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SideNav, { DRAWER_WIDTH } from './components/layout/SideNav';


export default function App() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(() => createAppTheme(prefersDark ? 'dark' : 'light'), [prefersDark]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobile = () => setMobileOpen((v) => !v);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="fixed" color="default" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={toggleMobile} sx={{ mr: 2, display: { lg: 'none' } }}>
            <MenuRoundedIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            CarCo Analytics
          </Typography>
        </Toolbar>
      </AppBar>
      <SideNav mobileOpen={mobileOpen} onClose={toggleMobile} />
      <Box component="main" sx={{ flexGrow: 1, ml: { lg: `${DRAWER_WIDTH}px` } }}>
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Suspense fallback={<LinearProgress /> }>
            <Routes>
              {routes.map((r) => (
                <Route key={r.path} path={r.path} element={r.element} />
              ))}
            </Routes>
          </Suspense>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
