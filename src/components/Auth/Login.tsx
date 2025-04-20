import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { login } from '../../services/auth';
import { TextField, Button, Box, Alert, Grid, Typography, useTheme, alpha } from '@mui/material';
import { styled, StyledComponentProps } from '@mui/material/styles';


interface LoginFormValues {
  email: string;
  password: string;
}

const schema = yup.object().shape({
  email: yup.string().email('Geçersiz e-posta adresi').required('E-posta adresi zorunludur.'),
  password: yup.string().required('Şifre zorunludur.'),
});

const LoginContainer = styled(Grid)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundImage: `url('/19061936-autumn-dreams.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});

const LoginForm = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  width: '400px',
}));

interface TypographyProps extends StyledComponentProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'overline' | 'inherit';
  component?: React.ElementType;
}
const LoginTitle = styled(Typography)<TypographyProps>({});

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    try {
      const response = await login(data);
      console.log('Giriş Başarılı:', response);
      localStorage.setItem('token', response.token);
      navigate('/');
    } catch (error: any) {
      console.error('Giriş Hatası:', error);
      setLoginError(error);
    }
  };

  return (
    <LoginContainer container>
      <LoginForm>
        <LoginTitle variant="h5" component="h1" sx={{ marginBottom: 3, textAlign: 'center', fontWeight: 'bold', fontSize: '2.5rem', color: theme.palette.primary.main }}>
          Giriş Yap
        </LoginTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-posta Adresi"
            autoComplete="email"
            autoFocus
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Şifre"
            type="password"
            id="password"
            autoComplete="current-password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} style={{ backgroundColor: theme.palette.primary.main }}>
            Giriş
          </Button>
          {loginError && <Alert severity="error">{loginError}</Alert>}
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Hesabınız yok mu? <Link to="/register" style={{ textDecoration: 'none', color: theme.palette.primary.main }}>Kayıt Olun</Link>
          </Typography>
        </Box>
      </LoginForm>
    </LoginContainer>
  );
};

export default Login;