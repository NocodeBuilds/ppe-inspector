
import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggler } from '@/components/ThemeToggler';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useLoginForm } from '@/hooks/useLoginForm';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const Login = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { form, error, setError, isSubmitting, onSubmit } = useLoginForm();
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Check for registration success message from location state
  useEffect(() => {
    if (location.state?.registrationSuccess) {
      toast({
        title: 'Registration successful',
        description: 'Please login with your new account',
        variant: 'default',
      });
      
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);
  
  // Handle authentication state
  useEffect(() => {
    console.log("Auth state in Login:", { user, isLoading });
    
    // If authenticated, redirect to home
    if (user) {
      navigate('/');
      return;
    }
    
    // Set a timeout to prevent the page loading indicator from flickering
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user, navigate]);
  
  // Show loading spinner while checking auth state
  if (isLoading || isPageLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-y-auto">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 border-b border-border h-14 backdrop-blur-sm">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">
              <span>
                <span className="text-primary">PPE</span> Inspector
              </span>
            </h1>
          </div>
          <ThemeToggler />
        </div>
      </header>
      
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 pt-20 w-full">
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
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Your email address"
                          disabled={isSubmitting}
                          className="bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Your password"
                          disabled={isSubmitting}
                          className="bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-success hover:bg-success/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
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
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
