import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

const features = [
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: 'Compliance Made Easy',
    description: 'Streamline inspections with digital checklists that ensure regulatory compliance and worker safety.',
  },
  {
    icon: <Zap className="h-10 w-10 text-primary" />,
    title: 'Work Offline',
    description: 'Complete inspections anywhere with full offline support. Data syncs automatically when you reconnect.',
  },
  {
    icon: <CheckCircle2 className="h-10 w-10 text-primary" />,
    title: 'Real-time Insights',
    description: 'Access inspection history, track equipment status, and generate reports instantly.',
  },
];

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate({ to: '/dashboard' });
    }
  }, [user, navigate]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
            PPE Inspector
          </h1>
          <p className="max-w-[42rem] text-body-lg leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            The modern solution for managing and tracking Personal Protective Equipment inspections.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/auth/login">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/auth/register">
                Create Account
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 lg:py-16">
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="mb-2">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-body-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-8 md:py-12 lg:py-16">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to improve your PPE inspection process?</CardTitle>
            <CardDescription className="text-primary-foreground/90">
              Join organizations that trust PPE Inspector for safety compliance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body">
              Our digital solution makes it easy to conduct thorough inspections, track equipment status,
              and ensure worker safety. Get started today and see the difference.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" asChild>
              <Link to="/auth/login">
                Sign In Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}

export default HomePage;
