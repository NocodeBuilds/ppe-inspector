
import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggler } from '@/components/ThemeToggler';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
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

  // Check for registration success message from location state
  useEffect(() => {
    if (location.state?.registrationSuccess) {
      toast({
        title: 'Registration successful',
        description: 'Please login with your new account',
        variant: 'default'
      });

      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Handle authentication state
  useEffect(() => {
    console.log("Auth state in Login:", {
      user,
      isLoading
    });

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
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center py-12 px-8 sm:px-12 lg:px-16">
        <div className="absolute top-6 right-6">
          <ThemeToggler />
        </div>
        
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <LogoIcon size="xl" withText={true} className="transform scale-125" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>
          
          <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-border/30">
            {location.state?.registrationSuccess && (
              <Alert className="mb-6 bg-success/10 text-success border-success/20">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Registration successful! Please login.</AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive" className="mb-6">
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
                      <FormLabel className="text-foreground/80">Email address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Your email address" 
                          disabled={isSubmitting} 
                          className="h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary"
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
                      <FormLabel className="text-foreground/80">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Your password" 
                          disabled={isSubmitting} 
                          className="h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-lg rounded-xl relative overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <span className="animate-spin mr-2 h-5 w-5 border-2 border-background border-t-transparent rounded-full"></span>
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Sign in
                        <ArrowRight className="ml-2 h-5 w-5 animate-pulse" />
                      </div>
                    )}
                  </Button>
                </div>
                
                <div className="text-center space-y-3 mt-4">
                  <Link to="/forgot-password" className="block text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                    Forgot your password?
                  </Link>
                  <div className="block text-sm pt-1">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary font-medium hover:underline transition-all duration-200">
                      Create account
                    </Link>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
      
      {/* Right side - Decorative */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12">
          <div className="glass-card p-10 rounded-3xl backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 w-full max-w-xl shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 text-foreground">PPE Inspector Dashboard</h2>
            <p className="text-lg text-foreground/80 mb-8">
              Track, manage, and ensure compliance with all your safety equipment inspection needs in one place.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="text-sm text-foreground/80">Real-time tracking</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="text-sm text-foreground/80">Inspection history</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="text-sm text-foreground/80">Equipment management</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="text-sm text-foreground/80">Compliance reports</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Login;
