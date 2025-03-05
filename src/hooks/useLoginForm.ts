
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Define validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const useLoginForm = () => {
  const [error, setError] = useState<string | null>(null);
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    
    try {
      await signIn(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in');
    }
  };
  
  return {
    form,
    error,
    setError,
    isSubmitting: isLoading,
    onSubmit,
  };
};
