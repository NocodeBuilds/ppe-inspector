
import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { ThemeToggler } from '@/components/ThemeToggler';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { useLoginForm } from '@/hooks/useLoginForm';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import LogoIcon from '@/components/common/LogoIcon';

const Login = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const {
    form,
    error,
    setError,
    isSubmitting,
    onSubmit
  } = useLoginForm();
  const {
    isLoading,
    user
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.registrationSuccess) {
      toast({
        title: 'Registration successful',
        description: 'Please login with your new account',
        variant: 'default'
      });

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    console.log("Auth state in Login:", {
      user,
      isLoading
    });

    if (user) {
      navigate('/');
      return;
    }

    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [user, navigate]);

  if (isLoading || isPageLoading) {
    return <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>;
  }

  return <div className="flex flex-col min-h-screen bg-background overflow-y-auto">
      <div className="absolute top-4 right-4">
        <ThemeToggler />
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 w-full">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <LogoIcon size="lg" className="mx-auto" withText={true} />
          </div>
          
          <div className="glass-card rounded-lg p-6 sm:p-8 shadow-lg border border-border/20 mt-4">
            {location.state?.registrationSuccess && <Alert className="mb-4 bg-success/10 text-success border-success/20">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Registration successful! Please login.</AlertDescription>
              </Alert>}
            
            {error && <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="email" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-base sm:text-lg">Email address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Your email address" disabled={isSubmitting} className="bg-background text-base p-6" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                <FormField control={form.control} name="password" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-base sm:text-lg">Your Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Your password" disabled={isSubmitting} className="bg-background text-base p-6" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6 text-lg" disabled={isSubmitting}>
                  {isSubmitting ? <div className="flex items-center justify-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></span>
                      Signing in...
                    </div> : 'Sign in'}
                </Button>
                
                <div className="text-center space-y-3 mt-6">
                  <Link to="/forgot-password" className="text-base text-muted-foreground hover:text-foreground block">
                    Forgot your password?
                  </Link>
                  <div className="block text-base pt-2">
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
    </div>;
};

export default Login;
