import { Drawer, Toolbar, List, ListSubheader, ListItemButton, ListItemIcon, ListItemText, useMediaQuery } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import PriceChangeRoundedIcon from '@mui/icons-material/PriceChangeRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ReportGmailerrorredRoundedIcon from '@mui/icons-material/ReportGmailerrorredRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';

export const DRAWER_WIDTH = 220;

export default function SideNav({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const { pathname } = useLocation();
  const lgUp = useMediaQuery('(min-width:1200px)');

  const isSelected = (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  const content = (
    <>
      <Toolbar />
      <List
        subheader={<ListSubheader disableSticky>总览</ListSubheader>}
      >
        <ListItemButton component={Link} to="/" selected={isSelected('/')}> 
          <ListItemIcon><DashboardRoundedIcon /></ListItemIcon>
          <ListItemText primary="仪表盘" />
        </ListItemButton>
      </List>
      <List
        subheader={<ListSubheader disableSticky>分析</ListSubheader>}
      >
        <ListItemButton component={Link} to="/analytics/brands" selected={isSelected('/analytics/brands')}>
          <ListItemIcon><ShowChartRoundedIcon /></ListItemIcon>
          <ListItemText primary="品牌分析" />
        </ListItemButton>
        <ListItemButton component={Link} to="/analytics/models" selected={isSelected('/analytics/models')}>
          <ListItemIcon><ShowChartRoundedIcon /></ListItemIcon>
          <ListItemText primary="车型分析" />
        </ListItemButton>
        <ListItemButton component={Link} to="/analytics/dealers" selected={isSelected('/analytics/dealers')}>
          <ListItemIcon><ShowChartRoundedIcon /></ListItemIcon>
          <ListItemText primary="经销商" />
        </ListItemButton>
        <ListItemButton component={Link} to="/analytics/colors" selected={isSelected('/analytics/colors')}>
          <ListItemIcon><ColorLensRoundedIcon /></ListItemIcon>
          <ListItemText primary="颜色" />
        </ListItemButton>
        <ListItemButton component={Link} to="/analytics/price" selected={isSelected('/analytics/price')}>
          <ListItemIcon><PriceChangeRoundedIcon /></ListItemIcon>
          <ListItemText primary="价格" />
        </ListItemButton>
        <ListItemButton component={Link} to="/analytics/yoy" selected={isSelected('/analytics/yoy')}>
          <ListItemIcon><TimelineRoundedIcon /></ListItemIcon>
          <ListItemText primary="同比环比" />
        </ListItemButton>
      </List>
      <List
        subheader={<ListSubheader disableSticky>业务</ListSubheader>}
      >
        <ListItemButton component={Link} to="/inventory" selected={isSelected('/inventory')}>
          <ListItemIcon><Inventory2RoundedIcon /></ListItemIcon>
          <ListItemText primary="库存" />
        </ListItemButton>
        <ListItemButton component={Link} to="/recalls" selected={isSelected('/recalls')}>
          <ListItemIcon><ReportGmailerrorredRoundedIcon /></ListItemIcon>
          <ListItemText primary="召回" />
        </ListItemButton>
      </List>
      <List
        subheader={<ListSubheader disableSticky>目录</ListSubheader>}
      >
        <ListItemButton component={Link} to="/catalog" selected={isSelected('/catalog')}>
          <ListItemIcon><FolderRoundedIcon /></ListItemIcon>
          <ListItemText primary="目录" />
        </ListItemButton>
      </List>
    </>
  );

  return (
    <>
      {/* Mobile */}
      {!lgUp && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', lg: 'none' }, [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
        >
          {content}
        </Drawer>
      )}
      {/* Desktop */}
      {lgUp && (
        <Drawer
          variant="permanent"
          open
          sx={{ display: { xs: 'none', lg: 'block' }, [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
        >
          {content}
        </Drawer>
      )}
    </>
  );
}


