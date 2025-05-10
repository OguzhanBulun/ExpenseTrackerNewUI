import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Divider, 
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getReportData } from '../services/report';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SavingsIcon from '@mui/icons-material/Savings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useTranslation } from '../contexts/LanguageContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ReportData {
  userId: number;
  startDate: string;
  endDate: string;
  monthlySalary: number;
  totalExpenses: number;
  remainingBudget: number;
  categoryExpenses: Record<string, number>;
  expenses: Expense[];
}

interface Expense {
  id: number;
  name: string;
  amount: number;
  description: string;
  date: string;
}

const BUDGET_COLORS = ['#0088FE', '#00C49F'];
const CATEGORY_COLORS = ['#FF6B6B', '#FFBB28', '#AF69EF', '#FF8042', '#F55D5D', '#36A2EB', '#8884D8', '#4BC0C0'];

const HomePage: React.FC = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const { language } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getReportData();
        setData(response);
      } catch (err: any) {
        setError(t('app', 'error'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100%'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">{t('home', 'noData')}</Alert>
      </Box>
    );
  }

  const pieData = [
    { name: t('home', 'totalExpenses'), value: data.totalExpenses },
    { name: t('home', 'remainingBudget'), value: data.remainingBudget },
  ];

  const categoryPieData = Object.entries(data.categoryExpenses || {}).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  const expenseRatio = data.totalExpenses > 0 
    ? ((data.totalExpenses / data.monthlySalary) * 100).toFixed(0)
    : '0';

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, value, name } = props;
    const RADIAN = Math.PI / 180;
    
    const radius = outerRadius * 1.4; 
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    const sx = cx + outerRadius * Math.cos(-midAngle * RADIAN);
    const sy = cy + outerRadius * Math.sin(-midAngle * RADIAN);
    
    const mx = sx + (x - sx) * 0.5;
    const my = sy + (y - sy) * 0.5;
    
    return (
      <g>
        <path 
          d={`M${sx},${sy}L${mx},${my}L${x},${y}`} 
          stroke={BUDGET_COLORS[index % BUDGET_COLORS.length]}
          fill="none"
          strokeWidth={1.5}
        />
        <rect
          x={x - 14 + (x > cx ? 10 : -20)}
          y={y - 9}
          width={30}
          height={18}
          fill={theme.palette.mode === 'dark' ? theme.palette.background.paper : "white"}
          fillOpacity={0.8}
          rx={9}
          ry={9}
        />
        <text 
          x={x + (x > cx ? 7 : -7)}
          y={y}
          fill={BUDGET_COLORS[index % BUDGET_COLORS.length]}
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontWeight="bold"
          fontSize="12"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  };

  const renderCategoryLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, value, name } = props;
    const RADIAN = Math.PI / 180;
    
    const radius = outerRadius * 1.4; 
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    const sx = cx + outerRadius * Math.cos(-midAngle * RADIAN);
    const sy = cy + outerRadius * Math.sin(-midAngle * RADIAN);
    
    const mx = sx + (x - sx) * 0.5;
    const my = sy + (y - sy) * 0.5;
    
    return (
      <g>
        <path 
          d={`M${sx},${sy}L${mx},${my}L${x},${y}`} 
          stroke={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
          fill="none"
          strokeWidth={1.5}
        />
        <rect
          x={x - 14 + (x > cx ? 10 : -20)}
          y={y - 9}
          width={30}
          height={18}
          fill={theme.palette.mode === 'dark' ? theme.palette.background.paper : "white"}
          fillOpacity={0.8}
          rx={9}
          ry={9}
        />
        <text 
          x={x + (x > cx ? 7 : -7)}
          y={y}
          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontWeight="bold"
          fontSize="12"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  };

  return (
    <Box sx={{ minHeight: '100%', pb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
          {t('home', 'welcome')}
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: 'text.secondary',
          p: 1,
          borderRadius: 1,
          bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : 'transparent'
        }}>
          <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography variant="body2">
            {formatDate(data?.startDate || '')} - {formatDate(data?.endDate || '')}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            elevation={1} 
            sx={{ 
              borderRadius: '18px',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #1A6696 0%, #0C7F9B 100%)'
                : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              overflow: 'hidden',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 6px 20px rgba(0, 0, 0, 0.3)'
                : '0 6px 20px rgba(79, 172, 254, 0.15)'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('home', 'monthlySalary')}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                    {data?.monthlySalary.toLocaleString(language === 'tr' ? 'tr-TR' : language === 'ru' ? 'ru-RU' : 'en-US')}₺
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: 1.5, 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AttachMoneyIcon fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            elevation={1} 
            sx={{ 
              borderRadius: '18px',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #972F49 0%, #7D1D38 100%)'
                : 'linear-gradient(135deg, #FF9A8B 0%, #FF6B95 100%)',
              color: 'white',
              overflow: 'hidden',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 6px 20px rgba(0, 0, 0, 0.3)'
                : '0 6px 20px rgba(255, 154, 139, 0.15)'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('home', 'totalExpenses')}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                    {data?.totalExpenses.toLocaleString(language === 'tr' ? 'tr-TR' : language === 'ru' ? 'ru-RU' : 'en-US')}₺
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: 1.5, 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <TrendingUpIcon fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            elevation={1} 
            sx={{ 
              borderRadius: '18px',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #0F664B 0%, #0A7A66 100%)'
                : 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
              color: 'white',
              overflow: 'hidden',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 6px 20px rgba(0, 0, 0, 0.3)'
                : '0 6px 20px rgba(67, 233, 123, 0.15)'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('home', 'remainingBudget')}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                    {data?.remainingBudget.toLocaleString(language === 'tr' ? 'tr-TR' : language === 'ru' ? 'ru-RU' : 'en-US')}₺
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: 1.5, 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <SavingsIcon fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper 
            elevation={1} 
            sx={{ 
              borderRadius: '24px',
              p: 3,
              height: '100%',
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 14px rgba(0, 0, 0, 0.3)'
                : '0 4px 14px rgba(0,0,0,0.05)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              {t('home', 'monthlyOverview')}
            </Typography>
            
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    labelLine={true}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BUDGET_COLORS[index % BUDGET_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                {t('home', 'expenseRatio')}: {expenseRatio}%
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Typography variant="body2">
                  {expenseRatio}% {t('home', 'used')}
                </Typography>
                <Box sx={{ width: '70%', height: 10, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 5 }}>
                  <Box 
                    sx={{ 
                      width: `${expenseRatio}%`, 
                      height: '100%', 
                      bgcolor: Number(expenseRatio) > 80 ? 'error.main' : Number(expenseRatio) > 60 ? 'warning.main' : 'success.main',
                      borderRadius: 5
                    }} 
                  />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper 
            elevation={1} 
            sx={{ 
              borderRadius: '24px',
              p: 3,
              height: '100%',
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 14px rgba(0, 0, 0, 0.3)'
                : '0 4px 14px rgba(0,0,0,0.05)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              {t('home', 'expensesByCategory')}
            </Typography>
            
            {categoryPieData.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <Typography variant="body1" color="text.secondary">
                  {t('home', 'noExpenses')}
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryPieData}
                        cx="50%"
                        cy="45%"
                        labelLine={true}
                        label={renderCategoryLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" useFlexGap>
                    {categoryPieData.map((category, index) => (
                      <Chip
                        key={index}
                        label={`${category.name}: ${category.value.toLocaleString(language === 'tr' ? 'tr-TR' : language === 'ru' ? 'ru-RU' : 'en-US')}₺`}
                        sx={{ 
                          bgcolor: alpha(CATEGORY_COLORS[index % CATEGORY_COLORS.length], 0.15), 
                          color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                          fontWeight: 500,
                          my: 0.5
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
