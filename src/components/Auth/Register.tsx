import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { registerApi } from '../../services/auth';
import { TextField, Button, Box, Alert, Grid, Typography, useTheme, alpha, Snackbar } from '@mui/material'; 
import { styled, StyledComponentProps } from '@mui/material/styles';


interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  monthlySalary: number;
}

const schema = yup.object().shape({
  username: yup.string().required('Kullanıcı adı zorunludur.'),
  email: yup.string().email('Geçersiz e-posta adresi').required('E-posta adresi zorunludur.'),
  password: yup.string().min(6, 'Şifre en az 6 karakter olmalıdır.').required('Şifre zorunludur.'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), undefined], 'Şifreler eşleşmelidir.')
    .required('Şifre tekrarı zorunludur.'),
  monthlySalary: yup.number().required('Aylık maaş zorunludur.').positive('Aylık maaş pozitif bir sayı olmalıdır.'),
});

const RegisterContainer = styled(Grid)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundImage: `url('/loginbackground.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});

const RegisterForm = styled(Box)(({ theme }) => ({
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
const RegisterTitle = styled(Typography)<TypographyProps>({});

const Register: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: yupResolver(schema),
  });
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false); 
  const navigate = useNavigate();
  const theme = useTheme();

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    try {
      const response = await registerApi(data);
      console.log('Kayıt Başarılı:', response);
      setRegisterSuccess(true); 
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Kayıt Hatası:', error);
      setRegisterError(error);
    }
  };

  const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setRegisterSuccess(false);
  };

  return (
    <RegisterContainer container>
      <RegisterForm>
        <RegisterTitle variant="h5" component="h1" sx={{ marginBottom: 3, textAlign: 'center', fontWeight: 'bold', fontSize: '2.5rem', color: theme.palette.primary.main }}>
          Kayıt Ol
        </RegisterTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
          {/* Form alanları aynı kalır */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Kullanıcı Adı"
            autoFocus
            {...register('username')}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-posta Adresi"
            autoComplete="email"
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
            autoComplete="new-password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Şifre Tekrarı"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Aylık Maaş"
            type="number"
            id="monthlySalary"
            {...register('monthlySalary', { valueAsNumber: true })}
            error={!!errors.monthlySalary}
            helperText={errors.monthlySalary?.message}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} style={{ backgroundColor: theme.palette.primary.main }}>
            Kayıt Ol
          </Button>
          {registerError && <Alert severity="error">{registerError}</Alert>}
        </Box>
      </RegisterForm>
      <Snackbar
        open={registerSuccess}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message="Kayıt Başarılı! Giriş sayfasına yönlendiriliyorsunuz..."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </RegisterContainer>
  );
};

export default Register;