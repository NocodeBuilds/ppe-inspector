
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggler } from '@/components/ThemeToggler';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LogoIcon from '@/components/common/LogoIcon';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  const { resetPassword, isLoading } = useAuth();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);
    
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Failed to send reset password email');
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
      <div className="absolute top-4 right-4">
        <ThemeToggler />
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <LogoIcon size="lg" className="mx-auto" withText={true} />
          </div>
          
          <div className="glass-card rounded-lg p-6 sm:p-8 shadow-lg border border-border/20 mt-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success ? (
              <div className="text-center">
                <Alert className="mb-4 bg-success/10 text-success border-success/20">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Reset password link has been sent to your email.</AlertDescription>
                </Alert>
                <p className="text-muted-foreground mb-4">
                  Please check your email for further instructions.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-base sm:text-lg font-medium">Email address</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-background p-6"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full py-6 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></span>
                      Sending...
                    </div>
                  ) : 'Send Reset Link'}
                </Button>
                
                <div className="text-center mt-4">
                  <Link to="/login" className="text-base text-muted-foreground hover:text-foreground">
                    ← Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
