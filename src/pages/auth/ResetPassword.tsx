
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggler } from '@/components/ThemeToggler';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LogoIcon from '@/components/common/LogoIcon';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  
  useEffect(() => {
    // Check if this is indeed a password reset flow
    const verifyResetFlow = () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      if (!params.get('type') || params.get('type') !== 'recovery') {
        setError('Invalid reset password link');
      }
      setIsPageLoading(false);
    };
    
    verifyResetFlow();
  }, []);
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsSubmitting(false);
      return;
    }
    
    try {
      await updatePassword(password);
      
      // Redirect to login
      navigate('/login', { 
        state: { passwordResetSuccess: true }
      });
    } catch (error: any) {
      setError(error.message || 'Failed to update password');
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
      
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 pt-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <LogoIcon size="lg" className="mx-auto" withText={true} />
          </div>
          
          <div className="glass-card rounded-lg p-6 shadow-lg border border-border/20 mt-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm">New Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a new password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm">Confirm Password</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-background"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></span>
                    Updating Password...
                  </div>
                ) : 'Update Password'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
