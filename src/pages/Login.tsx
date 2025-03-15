
import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggler } from '@/components/ThemeToggler';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { useLoginForm } from '@/hooks/useLoginForm';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import LogoIcon from '@/components/common/LogoIcon';

const Login = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { form, error, setError, isSubmitting, onSubmit } = useLoginForm();
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
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
  }, [location.state]);
  
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
      <div className="absolute top-4 right-4">
        <ThemeToggler />
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 pt-20 w-full">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <LogoIcon size="xl" withText={false} />
            </div>
            <p className="text-xl font-medium mb-1">PPE Inspector</p>
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
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-5 text-lg"
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
