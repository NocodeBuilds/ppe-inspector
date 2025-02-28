
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real app, we would make an API call to authenticate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful login
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-primary mb-2">RENEW</h1>
            <p className="text-muted-foreground">PPE Inspection Portal</p>
          </div>
          
          <div className="glass-card rounded-lg p-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm">Email address</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm">Your Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-success hover:bg-success/90"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
              
              <div className="text-center space-y-2 mt-4">
                <a href="#forgot" className="text-sm text-muted-foreground hover:text-foreground">
                  Forgot your password?
                </a>
                <div className="block text-sm">
                  Don't have an account?{' '}
                  <a href="#signup" className="text-primary hover:underline">
                    Sign up
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
