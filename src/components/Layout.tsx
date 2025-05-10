import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  Container, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Avatar,
  useTheme,
  useMediaQuery,
  Skeleton,
  Paper,
  alpha
} from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import { getUserData, logout, User } from '../services/auth';
import { useTranslation } from '../contexts/LanguageContext';
import LanguageThemeSelector from './LanguageThemeSelector';

const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // API'den kullanıcı bilgilerini al
        const userData = await getUserData();
        setUser(userData);
      } catch (error) {
        console.error('Kullanıcı bilgileri alınırken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleDrawerToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { text: t('navigation', 'home'), icon: <HomeRoundedIcon fontSize="medium" />, path: '/' },
    { text: t('navigation', 'expenses'), icon: <ReceiptLongRoundedIcon fontSize="medium" />, path: '/expenses' },
    { text: t('navigation', 'profile'), icon: <AccountCircleRoundedIcon fontSize="medium" />, path: '/profile' },
  ];

  // İsmin baş harflerini alma
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const drawer = (
    <Box sx={{ 
      width: 280, 
      height: '100%', 
      bgcolor: theme.palette.background.paper, 
      padding: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 3,
        bgcolor: theme.palette.mode === 'dark' 
          ? alpha('#7B1FA2', 0.9)  // Mor renk (koyu tema için)
          : alpha(theme.palette.primary.main, 0.9),
        borderRadius: { xs: 0, md: '0 0 24px 0' }
      }}>
        <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#fff', fontWeight: 700, fontSize: '1.3rem' }}>
          {t('app', 'title')}
        </Typography>
        {isMobile && (
          <IconButton 
            onClick={handleDrawerToggle} 
            sx={{ 
              color: '#fff',
              '&:hover': {
                bgcolor: alpha('#fff', 0.1)
              }
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        )}
      </Box>
      
      <Paper
        elevation={0}
        sx={{
          mx: 2, 
          mt: 3, 
          p: 2, 
          borderRadius: '16px',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          bgcolor: theme.palette.background.paper
        }}
      >
        {loading ? (
          <>
            <Skeleton variant="circular" width={50} height={50} sx={{ mr: 2 }} />
            <Box>
              <Skeleton variant="text" width={120} />
              <Skeleton variant="text" width={150} />
            </Box>
          </>
        ) : (
          <>
            <Avatar 
              sx={{ 
                mr: 2, 
                width: 50, 
                height: 50,
                bgcolor: theme.palette.primary.main,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
              src={user?.profilePicture || undefined}
            >
              {!user?.profilePicture && (user ? getInitials(user.username) : <AccountCircleRoundedIcon />)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {user?.username || t('app', 'unknownUser')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                {user?.email || t('app', 'noEmail')}
              </Typography>
              {user?.monthlySalary && (
                <Typography variant="caption" color="primary" sx={{ fontWeight: 600, display: 'block', mt: 0.5 }}>
                  {user.monthlySalary.toLocaleString('tr-TR')}₺ / {t('profile', 'month')}
                </Typography>
              )}
            </Box>
          </>
        )}
      </Paper>
      
      <Box sx={{ py: 2, px: 2, flexGrow: 1 }}>
        <Typography variant="overline" sx={{ 
          pl: 2,
          color: 'text.secondary',
          fontWeight: 600,
          fontSize: '0.7rem',
          letterSpacing: 1.2,
          textTransform: 'uppercase'
        }}>
          {t('navigation', 'menu')}
        </Typography>
        
        <List sx={{ mt: 1 }}>
          {menuItems.map((item) => (
            <ListItem 
              button 
              component={Link}
              to={item.path}
              key={item.text}
              onClick={isMobile ? handleDrawerToggle : undefined}
              sx={{
                borderRadius: '12px',
                mb: 1,
                py: 1.2,
                color: window.location.pathname === item.path ? theme.palette.primary.main : 'text.primary',
                bgcolor: window.location.pathname === item.path ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: window.location.pathname === item.path 
                    ? alpha(theme.palette.primary.main, 0.12) 
                    : alpha(theme.palette.primary.main, 0.04)
                },
                transition: 'all 0.2s'
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: window.location.pathname === item.path ? theme.palette.primary.main : 'text.secondary',
                  minWidth: '42px'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography variant="body1" sx={{ fontWeight: window.location.pathname === item.path ? 600 : 500 }}>
                    {item.text}
                  </Typography>
                } 
              />
              
              {window.location.pathname === item.path && (
                <Box 
                  sx={{ 
                    width: 4, 
                    height: 24, 
                    bgcolor: theme.palette.primary.main,
                    borderRadius: '4px',
                    ml: 1
                  }} 
                />
              )}
            </ListItem>
          ))}
        </List>
      </Box>
      
      {/* Dil ve Tema Seçicisi */}
      <Box sx={{ px: 2, mb: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '12px',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 4px 20px rgba(0,0,0,0.3)'
              : '0 4px 20px rgba(0,0,0,0.05)',
            bgcolor: theme.palette.background.paper
          }}
        >
          <LanguageThemeSelector showLabels={false} variant="icons" />
        </Paper>
      </Box>
      
      <Paper
        elevation={0}
        sx={{
          m: 2,
          p: 1.5,
          borderRadius: '12px',
          bgcolor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.error.main, 0.15)
            : alpha(theme.palette.error.light, 0.1),
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark'
              ? alpha(theme.palette.error.main, 0.2)
              : alpha(theme.palette.error.light, 0.15)
          },
          transition: 'all 0.2s'
        }}
      >
        <ListItem 
          button 
          onClick={handleLogout}
          sx={{
            borderRadius: '8px',
            color: theme.palette.error.main,
            p: 0.5
          }}
        >
          <ListItemIcon sx={{ color: theme.palette.error.main, minWidth: '42px' }}>
            <LogoutRoundedIcon />
          </ListItemIcon>
          <ListItemText 
            primary={
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t('auth', 'logout')}
              </Typography>
            } 
          />
        </ListItem>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      overflow: 'hidden',
      position: 'absolute',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      margin: 0,
      padding: 0,
      bgcolor: theme.palette.background.default
    }}>
      {/* Sidebar - Büyük ekranlarda sabit, küçük ekranlarda drawer */}
      {!isMobile ? (
        <Paper
          component="nav"
          elevation={2}
          sx={{
            width: 280,
            flexShrink: 0,
            borderRadius: '0 24px 24px 0',
            overflowY: 'auto',
            m: 0,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 0 24px rgba(0,0,0,0.5)'
              : '0 0 24px rgba(0,0,0,0.05)',
            zIndex: 10,
            bgcolor: theme.palette.background.paper
          }}
        >
          {drawer}
        </Paper>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileMenuOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 280, 
              m: 0, 
              p: 0,
              borderRadius: 0
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Ana içerik alanı */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Mobil için AppBar */}
        {isMobile && (
          <AppBar 
            position="static" 
            elevation={0}
            sx={{ 
              bgcolor: theme.palette.background.paper, 
              color: theme.palette.text.primary,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  mr: 2,
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.primary.main, 0.08)
                  }
                }}
              >
                <MenuRoundedIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
                {t('app', 'title')}
              </Typography>
              <Avatar 
                sx={{ 
                  bgcolor: theme.palette.primary.main, 
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.2s'
                }}
                onClick={() => navigate('/profile')}
                src={user?.profilePicture || undefined}
              >
                {!user?.profilePicture && (user ? getInitials(user.username) : <AccountCircleRoundedIcon />)}
              </Avatar>
            </Toolbar>
          </AppBar>
        )}

        {/* Scroll edilebilir içerik */}
        <Box
          sx={{
            p: 3,
            overflowY: 'auto',
            flexGrow: 1,
            bgcolor: theme.palette.background.default
          }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: '24px',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 20px rgba(0,0,0,0.3)'
                : '0 4px 20px rgba(0,0,0,0.05)',
              p: { xs: 2, md: 3 },
              height: '100%',
              bgcolor: theme.palette.background.paper,
              overflow: 'auto'
            }}
          >
            <Outlet />
          </Paper>
        </Box>

        {/* Footer */}
        <Paper
          component="footer"
          elevation={0}
          sx={{
            py: 1.5,
            textAlign: 'center',
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            bgcolor: theme.palette.background.paper
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © 2025 {t('app', 'title')} | {t('app', 'allRightsReserved')}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Layout;