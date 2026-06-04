import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {TextInput,PasswordInput,Button,Paper,Title,Container,Alert} from '@mantine/core';
import {useForm} from '@mantine/form';
import {authService} from '../services/api';
import useAuthStore from '../store/authStore';

export default function Login(){
  const navigate=useNavigate();
  const setAuth=useAuthStore((state)=>state.setAuth);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const form=useForm({
    initialValues:{username:'',password:'',},
    validate:{
      username:(value)=>(value.length<3?'Username must be at least 3 characters':null),
      password:(value)=>(value.length<3?'Password must be at least 3 characters':null),
    },
  });
  const handleSubmit=async(values)=>{
    setLoading(true);
    setError('');
    try{
      const response=await authService.login(values.username,values.password);
      const {token,user}=response.data;
      setAuth(user,token);
      navigate('/');
    }catch(err){
      setError(err.response?.data?.error || 'Login failed');
    }finally{
      setLoading(false);
    }
  };
  return(
    <Container size={420} my={40}>
      <Title ta="center">Welcome back!</Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Username"
            placeholder="Your username"
            required
            {...form.getInputProps('username')}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            {...form.getInputProps('password')}
          />
          <Button type="submit" fullWidth mt="xl" loading={loading}>
            Sign in
          </Button>
          <Button
            fullWidth
            variant="subtle"
            mt="sm"
            onClick={() => navigate('/register')}
          >
            Don't have an account? Register
          </Button>
        </form>
      </Paper>
    </Container>
  );
}