import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  Tab,
  Tabs,
  useTheme,
  alpha,
  SelectChangeEvent
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  PhotoCamera as PhotoCameraIcon,
  AttachMoney as AttachMoneyIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { getUserData, User } from '../services/auth';
import { updateMonthlySalary, updateProfile, updatePreferences, getUserPreferences, UserPreferences } from '../services/user';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/LanguageContext';
import { Language } from '../i18n';
import LanguageThemeSelector from '../components/LanguageThemeSelector';

// ThemeMode tipini tanımlayalım
type ThemeMode = 'light' | 'dark' | 'system';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

interface ExtendedUser extends User {
  language: string;
  theme: string;
}

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const { language, setLanguage, availableLanguages } = useLanguage();
  const { themeMode, setThemeMode } = useAppTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  
  const [userData, setUserData] = useState<ExtendedUser | null>(null);
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    itemsPerPage: 10,
    defaultCurrency: 'TRY',
    notificationEnabled: true
  });

  const [editSalary, setEditSalary] = useState(false);
  const [newMonthlySalary, setNewMonthlySalary] = useState<number>(0);
  const [languagePreference, setLanguagePreference] = useState('tr');
  const [themePreference, setThemePreference] = useState('light');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [defaultCurrency, setDefaultCurrency] = useState('TRY');
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = await getUserData();
        
        if (user) {
          const extendedUser: ExtendedUser = {
            ...user,
            language: user.language || 'tr',
            theme: user.theme || 'light'
          };
          
          setUserData(extendedUser);
          setNewMonthlySalary(user.monthlySalary || 0);
          setLanguagePreference(extendedUser.language);
          setThemePreference(extendedUser.theme);
          
          try {
            const userPrefs = await getUserPreferences();
            setPreferences(userPrefs);
            setItemsPerPage(userPrefs.itemsPerPage);
            setDefaultCurrency(userPrefs.defaultCurrency);
            setNotificationEnabled(userPrefs.notificationEnabled);
          } catch (error) {
            console.error('Tercihler yüklenirken hata:', error);
            setPreferences({
              itemsPerPage: 10,
              defaultCurrency: 'TRY',
              notificationEnabled: true
            });
            setItemsPerPage(10);
            setDefaultCurrency('TRY');
            setNotificationEnabled(true);
          }
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
        showSnackbar(t('app', 'error'), 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSalaryUpdate = async () => {
    if (newMonthlySalary <= 0) {
      showSnackbar(t('app', 'error'), 'error');
      return;
    }

    try {
      setSaving(true);
      await updateMonthlySalary(newMonthlySalary);
      
      if (userData) {
        setUserData({ ...userData, monthlySalary: newMonthlySalary });
      }
      
      setEditSalary(false);
      showSnackbar(t('profile', 'salaryUpdated'), 'success');
    } catch (error) {
      console.error('Maaş güncellenirken hata:', error);
      showSnackbar(t('app', 'error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      
      // Güncel dil ve tema bilgilerini context'lerden al
      const currentLanguage = language;
      const currentTheme = themeMode;
      
      await updateProfile(
        userData?.profilePicture || null,
        currentLanguage,
        currentTheme
      );
      
      if (userData) {
        setUserData({ 
          ...userData, 
          language: currentLanguage, 
          theme: currentTheme 
        });
      }
      
      showSnackbar(t('profile', 'profileUpdated'), 'success');
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      showSnackbar(t('app', 'error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    try {
      setSaving(true);
      await updatePreferences(
        itemsPerPage,
        defaultCurrency,
        notificationEnabled
      );
      
      setPreferences({
        itemsPerPage,
        defaultCurrency,
        notificationEnabled
      });
      
      showSnackbar(t('profile', 'preferencesUpdated'), 'success');
    } catch (error) {
      console.error('Tercihler güncellenirken hata:', error);
      showSnackbar(t('app', 'error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (userData) {
          setUserData({ ...userData, profilePicture: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Paper 
        elevation={1} 
        sx={{ 
          p: 0, 
          mb: 4, 
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
        }}
      >
        <Box
          sx={{
            p: 4,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(145deg, #7B1FA2 0%, #4A148C 100%)'
              : `linear-gradient(145deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#ffffff',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 3
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={userData?.profilePicture || undefined}
              sx={{
                width: 100,
                height: 100,
                border: '4px solid #ffffff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}
            >
              {!userData?.profilePicture && <AccountCircleIcon sx={{ fontSize: 60 }} />}
            </Avatar>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="icon-button-file"
              type="file"
              onChange={handlePhotoUpload}
            />
            <label htmlFor="icon-button-file">
              <IconButton
                sx={{
                  position: 'absolute',
                  right: -10,
                  bottom: -10,
                  bgcolor: '#ffffff',
                  color: theme.palette.primary.main,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.light, 0.1)
                  }
                }}
                component="span"
              >
                <PhotoCameraIcon />
              </IconButton>
            </label>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
              {userData?.username || t('profile', 'username')}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
              {userData?.email || 'email@example.com'}
            </Typography>
            
            {userData?.monthlySalary !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoneyIcon sx={{ mr: 1, opacity: 0.9 }} />
                {editSalary ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      value={newMonthlySalary}
                      onChange={(e) => setNewMonthlySalary(Number(e.target.value))}
                      variant="outlined"
                      type="number"
                      inputProps={{ min: 0 }}
                      sx={{
                        mr: 2,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                          '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                          '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.7)' }
                        },
                        '& .MuiInputBase-input': { color: '#ffffff' },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ffffff' }
                      }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">₺</InputAdornment>
                      }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={handleSalaryUpdate}
                      disabled={saving}
                      sx={{ 
                        bgcolor: '#ffffff', 
                        color: theme.palette.primary.main,
                        '&:hover': { bgcolor: alpha('#ffffff', 0.9) }
                      }}
                    >
                      {saving ? <CircularProgress size={24} /> : t('app', 'save')}
                    </Button>
                    <Button 
                      onClick={() => {
                        setEditSalary(false);
                        setNewMonthlySalary(userData?.monthlySalary || 0);
                      }}
                      sx={{ color: '#ffffff', ml: 1 }}
                    >
                      {t('app', 'cancel')}
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '1.1rem' }}>
                      {t('profile', 'monthlySalary')}: {userData?.monthlySalary ? userData.monthlySalary.toLocaleString('tr-TR') : '0'}₺
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => setEditSalary(true)}
                      sx={{ ml: 1, color: '#ffffff' }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Profil Sekmeleri */}
        <Box>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="profile tabs"
            sx={{ 
              px: 2,
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: '64px'
              }
            }}
          >
            <Tab 
              icon={<AccountCircleIcon />} 
              label={t('profile', 'personalInfo')}
              iconPosition="start"
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<SettingsIcon />} 
              label={t('profile', 'accountSettings')}
              iconPosition="start"
              {...a11yProps(1)} 
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: '18px', 
                    boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LanguageIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6" fontWeight="bold">
                      {t('profile', 'language')} & {t('profile', 'theme')}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <LanguageThemeSelector showLabels={true} variant="dropdown" />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                      onClick={handleProfileUpdate}
                      disabled={saving}
                    >
                      {t('profile', 'saveChanges')}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: '18px', 
                    boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SecurityIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6" fontWeight="bold">
                      {t('profile', 'security')}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ mb: 2 }}>
                      {t('profile', 'securityTips')}
                    </Typography>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li><Typography sx={{ mb: 1 }}>{t('profile', 'securityTip1')}</Typography></li>
                      <li><Typography sx={{ mb: 1 }}>{t('profile', 'securityTip2')}</Typography></li>
                      <li><Typography sx={{ mb: 1 }}>{t('profile', 'securityTip3')}</Typography></li>
                    </ul>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      color="primary"
                    >
                      {t('profile', 'changePassword')}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: '18px', 
                    boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <PaletteIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6" fontWeight="bold">
                      {t('profile', 'viewPreferences')}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>{t('profile', 'itemsPerPage')}</InputLabel>
                        <Select
                          value={itemsPerPage ? itemsPerPage.toString() : "10"}
                          onChange={(e: SelectChangeEvent) => setItemsPerPage(Number(e.target.value))}
                          label={t('profile', 'itemsPerPage')}
                        >
                          <MenuItem value="5">5</MenuItem>
                          <MenuItem value="10">10</MenuItem>
                          <MenuItem value="25">25</MenuItem>
                          <MenuItem value="50">50</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>{t('profile', 'currency')}</InputLabel>
                        <Select
                          value={defaultCurrency || "TRY"}
                          onChange={(e: SelectChangeEvent) => setDefaultCurrency(e.target.value)}
                          label={t('profile', 'currency')}
                        >
                          <MenuItem value="TRY">Türk Lirası (₺)</MenuItem>
                          <MenuItem value="USD">Amerikan Doları ($)</MenuItem>
                          <MenuItem value="EUR">Euro (€)</MenuItem>
                          <MenuItem value="GBP">İngiliz Sterlini (£)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: '18px', 
                    boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <NotificationsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6" fontWeight="bold">
                      {t('profile', 'notificationSettings')}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!notificationEnabled}
                          onChange={(e) => setNotificationEnabled(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={t('profile', 'enableNotifications')}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {t('profile', 'notificationsInfo')}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handlePreferencesUpdate}
                    disabled={saving}
                  >
                    {t('profile', 'saveChanges')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>
        </Box>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage; 