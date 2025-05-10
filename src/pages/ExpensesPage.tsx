import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Paper,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  Backdrop,
  Fab,
  useTheme,
  SelectChangeEvent,
  Tab,
  Tabs,
  TableFooter,
  Drawer
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Category as CategoryIcon,
  CalendarMonth as CalendarIcon,
  Description as DescriptionIcon,
  MonetizationOn as MoneyIcon,
  Event as EventIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

import { 
  getExpenses, 
  addExpense, 
  deleteExpense,
  getCategories,
  addCategory,
  deleteCategory,
  Expense,
  Category,
  ExpenseFormData
} from '../services/expense';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../contexts/LanguageContext';

// TabPanel bileşeni
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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 0, height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const ExpensesPage: React.FC = () => {
  const theme = useTheme();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openExpenseDialog, setOpenExpenseDialog] = useState<boolean>(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState<boolean>(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [expenseForm, setExpenseForm] = useState<ExpenseFormData>({
    name: '',
    amount: 0,
    date: new Date().toISOString(),
    categoryId: 0,
    description: ''
  });
  const [categoryName, setCategoryName] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [categoryPage, setCategoryPage] = useState(0);
  const [categoryRowsPerPage, setCategoryRowsPerPage] = useState(5);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMinAmount, setFilterMinAmount] = useState(0);
  const [filterMaxAmount, setFilterMaxAmount] = useState(0);
  const [filterStartDate, setFilterStartDate] = useState(new Date('2023-01-01'));
  const [filterEndDate, setFilterEndDate] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && expenseForm.categoryId === 0) {
      setExpenseForm(prev => ({
        ...prev,
        categoryId: categories[0].id
      }));
    }
  }, [categories, expenseForm.categoryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesData, categoriesData] = await Promise.all([
        getExpenses(),
        getCategories()
      ]);
      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      showSnackbar(t('app', 'error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenExpenseDialog = () => {
    setExpenseForm({
      name: '',
      amount: 0,
      date: new Date().toISOString(),
      categoryId: categories.length > 0 ? categories[0].id : 0,
      description: ''
    });
    setOpenExpenseDialog(true);
  };

  const handleCloseExpenseDialog = () => {
    setOpenExpenseDialog(false);
  };

  const handleOpenCategoryDialog = () => {
    setCategoryName('');
    setSelectedCategoryId(null);
    setOpenCategoryDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
  };

  const handleOpenConfirmDialog = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleExpenseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExpenseForm(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setExpenseForm(prev => ({
      ...prev,
      categoryId: value === '' ? 0 : parseInt(value)
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target;
    setExpenseForm(prev => ({
      ...prev,
      date: new Date(value).toISOString()
    }));
  };

  const handleAddExpense = async () => {
    try {
      if (!expenseForm.name || expenseForm.amount <= 0 || !expenseForm.categoryId) {
        showSnackbar(t('validation', 'required'), 'error');
        return;
      }

      setLoading(true);
      // Log the form data for debugging
      console.log("Gönderilecek veri:", {
        ...expenseForm,
        categoryId: Number(expenseForm.categoryId)
      });
      
      await addExpense({
        ...expenseForm,
        categoryId: Number(expenseForm.categoryId)
      });
      
      handleCloseExpenseDialog();
      await fetchData();
      showSnackbar(t('expenses', 'expenseAdded'), 'success');
    } catch (error) {
      console.error('Harcama eklenirken hata:', error);
      showSnackbar(t('app', 'error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      if (!categoryName) {
        showSnackbar(t('validation', 'required'), 'error');
        return;
      }

      setLoading(true);
      await addCategory(categoryName);
      handleCloseCategoryDialog();
      await fetchData();
      showSnackbar(t('categories', 'categoryAdded'), 'success');
    } catch (error) {
      console.error('Kategori eklenirken hata:', error);
      showSnackbar(t('app', 'error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      if (!selectedCategoryId) return;
      
      setLoading(true);
      await deleteCategory(selectedCategoryId);
      handleCloseConfirmDialog();
      await fetchData();
      showSnackbar(t('categories', 'categoryDeleted'), 'success');
    } catch (error) {
      console.error('Kategori silinirken hata:', error);
      showSnackbar(t('app', 'error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      setLoading(true);
      await deleteExpense(id);
      await fetchData();
      showSnackbar(t('expenses', 'expenseDeleted'), 'success');
    } catch (error) {
      console.error('Harcama silinirken hata:', error);
      showSnackbar(t('app', 'error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeCategoryPage = (event: unknown, newPage: number) => {
    setCategoryPage(newPage);
  };

  const handleChangeCategoryRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryRowsPerPage(parseInt(event.target.value, 10));
    setCategoryPage(0);
  };

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Bilinmeyen Kategori';
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const renderExpensesTab = () => (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenExpenseDialog}
        >
          {t('expenses', 'addExpense')}
        </Button>
      </Box>

      {loading && expenses.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : expenses.length === 0 ? (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>{t('expenses', 'noExpenses')}</Alert>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenExpenseDialog}
              size="large"
            >
              {t('expenses', 'addExpense')}
            </Button>
          </Box>
        </>
      ) : (
        <>
          <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="harcamalar tablosu">
              <TableHead sx={{ 
                backgroundColor: theme.palette.mode === 'dark' 
                  ? '#7B1FA2' // Koyu tema için mor renk
                  : theme.palette.primary.main 
              }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('expenses', 'name')}</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('expenses', 'amount')}</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('expenses', 'category')}</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('expenses', 'date')}</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('expenses', 'description')}</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('expenses', 'actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((expense) => (
                    <TableRow key={expense.id} hover>
                      <TableCell>{expense.name}</TableCell>
                      <TableCell>{expense.amount.toLocaleString(language === 'tr' ? 'tr-TR' : language === 'ru' ? 'ru-RU' : 'en-US')}₺</TableCell>
                      <TableCell>
                        <Chip 
                          label={getCategoryName(expense.categoryId)} 
                          color="primary" 
                          variant="outlined" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        <Tooltip title={t('app', 'delete')}>
                          <IconButton 
                            color="error"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={expenses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t('table', 'rowsPerPage')}
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          />
        </>
      )}
    </>
  );

  const renderCategoriesTab = () => (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCategoryDialog}
        >
          {t('categories', 'addCategory')}
        </Button>
      </Box>

      {loading && categories.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : categories.length === 0 ? (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>{t('categories', 'noCategories')}</Alert>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCategoryDialog}
              size="large"
            >
              {t('categories', 'addCategory')}
            </Button>
          </Box>
        </>
      ) : (
        <>
          <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="kategoriler tablosu">
              <TableHead sx={{ 
                backgroundColor: theme.palette.mode === 'dark' 
                  ? '#7B1FA2' // Koyu tema için mor renk
                  : theme.palette.primary.main 
              }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('categories', 'categoryName')}</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('expenses', 'actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories
                  .slice(categoryPage * categoryRowsPerPage, categoryPage * categoryRowsPerPage + categoryRowsPerPage)
                  .map((category) => (
                    <TableRow key={category.id} hover>
                      <TableCell>{category.id}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>
                        <Tooltip title={t('app', 'delete')}>
                          <IconButton 
                            color="error"
                            onClick={() => handleOpenConfirmDialog(category.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={categories.length}
            rowsPerPage={categoryRowsPerPage}
            page={categoryPage}
            onPageChange={handleChangeCategoryPage}
            onRowsPerPageChange={handleChangeCategoryRowsPerPage}
            labelRowsPerPage={t('table', 'rowsPerPage')}
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          />
        </>
      )}
    </>
  );

  const handleFilterClick = () => {
    setFilterDrawerOpen(true);
  };

  const handleFilterClose = () => {
    setFilterDrawerOpen(false);
  };

  const handleResetFilters = () => {
    setFilterCategory('');
    setFilterMinAmount(0);
    setFilterMaxAmount(0);
    setFilterStartDate(new Date('2023-01-01'));
    setFilterEndDate(new Date());
  };

  const handleApplyFilters = () => {
    // Implement filtering logic
    console.log('Filtering expenses...');
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {t('expenses', 'title')}
        </Typography>
      </Box>

      <Card elevation={0} sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              indicatorColor="primary"
              textColor="primary"
              sx={{ px: 2 }}
            >
              <Tab label={t('expenses', 'title')} icon={<MoneyIcon />} iconPosition="start" {...a11yProps(0)} />
              <Tab label={t('categories', 'title')} icon={<CategoryIcon />} iconPosition="start" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <Box sx={{ p: 2 }}>
            <TabPanel value={tabValue} index={0}>
              {renderExpensesTab()}
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              {renderCategoriesTab()}
            </TabPanel>
          </Box>
        </CardContent>
      </Card>

      {/* Harcama Ekle Dialog */}
      <Dialog open={openExpenseDialog} onClose={handleCloseExpenseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AddIcon sx={{ mr: 1 }} />
            {t('expenses', 'addExpense')}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label={t('expenses', 'name')}
                type="text"
                fullWidth
                variant="outlined"
                value={expenseForm.name}
                onChange={handleExpenseChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="amount"
                label={t('expenses', 'amount')}
                type="number"
                fullWidth
                variant="outlined"
                value={expenseForm.amount}
                onChange={handleExpenseChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">₺</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel id="category-label">{t('expenses', 'category')}</InputLabel>
                <Select
                  labelId="category-label"
                  name="categoryId"
                  value={expenseForm.categoryId === 0 ? '' : expenseForm.categoryId.toString()}
                  onChange={handleCategoryChange}
                  label={t('expenses', 'category')}
                  sx={{ height: '56px' }}
                >
                  {categories.length === 0 ? (
                    <MenuItem value="" disabled>
                      {t('categories', 'noCategories')}
                    </MenuItem>
                  ) : (
                    categories.map((category) => (
                      <MenuItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('expenses', 'date')}
                name="date"
                type="date"
                value={expenseForm.date.split('T')[0]}
                onChange={handleDateChange}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="description"
                label={t('expenses', 'description')}
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                value={expenseForm.description}
                onChange={handleExpenseChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExpenseDialog} color="inherit">
            {t('app', 'cancel')}
          </Button>
          <Button onClick={handleAddExpense} color="primary" startIcon={<AddIcon />} variant="contained">
            {t('app', 'save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Kategori Ekle Dialog */}
      <Dialog open={openCategoryDialog} onClose={handleCloseCategoryDialog} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CategoryIcon sx={{ mr: 1 }} />
            {t('categories', 'addCategory')}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label={t('categories', 'categoryName')}
            type="text"
            fullWidth
            variant="outlined"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog} color="inherit">
            {t('app', 'cancel')}
          </Button>
          <Button onClick={handleAddCategory} color="primary" startIcon={<AddIcon />} variant="contained">
            {t('app', 'save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Kategori Silme Onay Dialog */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DeleteIcon sx={{ mr: 1, color: theme.palette.error.main }} />
            {t('categories', 'deleteCategory')}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t('categories', 'confirmDelete')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="inherit">
            {t('app', 'cancel')}
          </Button>
          <Button 
            onClick={handleDeleteCategory} 
            color="error" 
            startIcon={<DeleteIcon />} 
            variant="contained"
          >
            {t('app', 'delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Genel Snackbar */}
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

      {/* Floating Action Button for Mobile */}
      {tabValue === 0 ? (
        <Fab 
          color="primary" 
          aria-label={t('expenses', 'addExpense')}
          onClick={handleOpenExpenseDialog}
          sx={{ 
            position: 'fixed',
            bottom: 20,
            right: 20,
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}
        >
          <AddIcon />
        </Fab>
      ) : (
        <Fab 
          color="primary" 
          aria-label={t('categories', 'addCategory')}
          onClick={handleOpenCategoryDialog}
          sx={{ 
            position: 'fixed',
            bottom: 20,
            right: 20,
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}
        >
          <AddIcon />
        </Fab>
      )}
      
      {/* Loading overlay */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={handleFilterClose}
      >
        <Box sx={{ width: 300, p: 3 }}>
          <Typography variant="h6" gutterBottom>{t('expenses', 'filterExpenses')}</Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>{t('expenses', 'category')}</InputLabel>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              label={t('expenses', 'category')}
            >
              <MenuItem value="">{t('expenses', 'allCategories')}</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <TextField
              label={t('expenses', 'minAmount')}
              type="number"
              value={filterMinAmount}
              onChange={(e) => setFilterMinAmount(Number(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">₺</InputAdornment>,
              }}
            />
          </FormControl>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <TextField
              label={t('expenses', 'maxAmount')}
              type="number"
              value={filterMaxAmount}
              onChange={(e) => setFilterMaxAmount(Number(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">₺</InputAdornment>,
              }}
            />
          </FormControl>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <TextField
              label={t('expenses', 'startDate')}
              type="date"
              value={filterStartDate.toISOString().split('T')[0]}
              onChange={(e) => setFilterStartDate(new Date(e.target.value))}
              InputLabelProps={{ shrink: true }}
            />
          </FormControl>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <TextField
              label={t('expenses', 'endDate')}
              type="date"
              value={filterEndDate.toISOString().split('T')[0]}
              onChange={(e) => setFilterEndDate(new Date(e.target.value))}
              InputLabelProps={{ shrink: true }}
            />
          </FormControl>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={handleResetFilters}>
              {t('expenses', 'resetFilters')}
            </Button>
            <Button variant="contained" onClick={handleApplyFilters}>
              {t('expenses', 'applyFilters')}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default ExpensesPage; 