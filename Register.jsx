import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, PasswordInput, Button, Paper, Title, Container, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { authService } from '../services/api';
import useAuthStore from '../store/authStore';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      username: (value) => (value.length < 3 ? 'Username must be at least 3 characters' : null),
      password: (value) => (value.length < 3 ? 'Password must be at least 3 characters' : null),
      confirmPassword: (value, values) => 
        value !== values.password ? 'Passwords do not match' : null,
    },
  });
  
  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.register(values.username, values.password);
      const { token, user } = response.data;
      setAuth(user, token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container size={420} my={40}>
      <Title ta="center">Create Account</Title>
      
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}
        
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Username"
            placeholder="Choose a username"
            required
            {...form.getInputProps('username')}
          />
          
          <PasswordInput
            label="Password"
            placeholder="Choose a password"
            required
            mt="md"
            {...form.getInputProps('password')}
          />
          
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            required
            mt="md"
            {...form.getInputProps('confirmPassword')}
          />
          
          <Button type="submit" fullWidth mt="xl" loading={loading}>
            Register
          </Button>
          
          <Button
            fullWidth
            variant="subtle"
            mt="sm"
            onClick={() => navigate('/login')}
          >
            Already have an account? Login
          </Button>
        </form>
      </Paper>
    </Container>
  );
}