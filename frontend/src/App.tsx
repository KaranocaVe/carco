import { Suspense } from 'react';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemText, Box } from '@mui/material';
import { Link, Route, Routes } from 'react-router-dom';
import { theme } from './app/theme';
import { routes } from './app/routes';

const drawerWidth = 220;

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            CarCo Analytics
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" sx={{ width: drawerWidth, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' }}}>
        <Toolbar />
        <List>
          {[
            { to: '/', text: '仪表盘' },
            { to: '/analytics/brands', text: '品牌分析' },
            { to: '/analytics/models', text: '车型分析' },
            { to: '/analytics/dealers', text: '经销商' },
            { to: '/analytics/colors', text: '颜色' },
            { to: '/analytics/price', text: '价格' },
            { to: '/analytics/yoy', text: '同比环比' },
            { to: '/inventory', text: '库存' },
            { to: '/recalls', text: '召回' },
            { to: '/catalog', text: '目录' },
          ].map((item) => (
            <ListItem key={item.to} disablePadding>
              <ListItemButton component={Link} to={item.to}>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, ml: `${drawerWidth}px` }}>
        <Toolbar />
        <Box className="p-4">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {routes.map((r) => (
                <Route key={r.path} path={r.path} element={r.element} />
              ))}
            </Routes>
          </Suspense>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
