
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggler } from '@/components/ThemeToggler';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  const { signIn, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if coming from successful registration
    if (location.state?.registrationSuccess) {
      toast({
        title: 'Registration successful',
        description: 'Please login with your new account',
        variant: 'default',
      });
      
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
    
    // Redirect if already logged in
    if (user) {
      navigate('/');
    }
    
    // Set a timeout to prevent the page loading indicator from flickering
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user, navigate, location.state, toast]);
  
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
      navigate('/');
    } catch (error: any) {
      // The toast is already shown in the AuthContext, so just set the form error
      setError(error.message || 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isPageLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-14 backdrop-blur-sm bg-opacity-80">
        <div className="flex items-center justify-between h-full px-4">
          <h1 className="text-xl font-bold">
            <span>
              <span className="text-primary">PPE</span> Inspector
            </span>
          </h1>
          <ThemeToggler />
        </div>
      </header>
      
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 pt-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">RENEW</h1>
            <p className="text-muted-foreground">PPE Inspection Portal</p>
          </div>
          
          <div className="glass-card rounded-lg p-6 shadow-lg border border-border/20">
            {location.state?.registrationSuccess && (
              <Alert className="mb-4 bg-success/10 text-success border-success/20">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Registration successful! Please login.</AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
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
                  disabled={isSubmitting}
                  className="bg-background"
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
                  disabled={isSubmitting}
                  className="bg-background"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-success hover:bg-success/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></span>
                    Signing in...
                  </div>
                ) : 'Sign in'}
              </Button>
              
              <div className="text-center space-y-2 mt-4">
                <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground block">
                  Forgot your password?
                </Link>
                <div className="block text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary hover:underline">
                    Sign up
                  </Link>
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
