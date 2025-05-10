import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Translate as TranslateIcon
} from '@mui/icons-material';
import { useLanguage, useTranslation } from '../contexts/LanguageContext';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import { Language } from '../i18n';

type ThemeMode = 'light' | 'dark' | 'system';

interface LanguageThemeSelectorProps {
  showLabels?: boolean;
  variant?: 'dropdown' | 'icons';
}

const LanguageThemeSelector: React.FC<LanguageThemeSelectorProps> = ({
  showLabels = true,
  variant = 'dropdown'
}) => {
  const theme = useTheme();
  const { language, setLanguage, availableLanguages } = useLanguage();
  const { themeMode, setThemeMode, isDarkMode } = useAppTheme();
  const { t } = useTranslation();

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value as Language);
  };

  const handleThemeChange = (event: SelectChangeEvent) => {
    setThemeMode(event.target.value as ThemeMode);
  };

  const toggleTheme = () => {
    setThemeMode(isDarkMode ? 'light' : 'dark');
  };

  if (variant === 'icons') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={t('settings', 'language')}>
          <IconButton color="inherit" onClick={() => {
            // Dil değiştirme döngüsü
            const currentIndex = availableLanguages.findIndex(lang => lang.code === language);
            const nextIndex = (currentIndex + 1) % availableLanguages.length;
            setLanguage(availableLanguages[nextIndex].code);
          }}>
            <TranslateIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={isDarkMode ? t('profile', 'lightTheme') : t('profile', 'darkTheme')}>
          <IconButton color="inherit" onClick={toggleTheme}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: showLabels ? 'column' : 'row', gap: 2 }}>
      <FormControl fullWidth variant="outlined" size="small">
        <InputLabel>{t('profile', 'language')}</InputLabel>
        <Select
          value={language}
          onChange={handleLanguageChange}
          label={t('profile', 'language')}
        >
          {availableLanguages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              {lang.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth variant="outlined" size="small">
        <InputLabel>{t('profile', 'theme')}</InputLabel>
        <Select
          value={themeMode}
          onChange={handleThemeChange}
          label={t('profile', 'theme')}
        >
          <MenuItem value="light">{t('profile', 'lightTheme')}</MenuItem>
          <MenuItem value="dark">{t('profile', 'darkTheme')}</MenuItem>
          <MenuItem value="system">{t('profile', 'systemTheme')}</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageThemeSelector; 