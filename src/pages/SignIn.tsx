import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const signInSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // const onSubmit = async (data: SignInFormData) => {
  //   setIsSubmitting(true);
    
  //   try {
  //     console.log("Sign in attempt:", data);
      
  //     // In real implementation, this would be:
  //     // const response = await fetch('/api/auth/signin', {
  //     //   method: 'POST',
  //     //   headers: { 'Content-Type': 'application/json' },
  //     //   body: JSON.stringify(data),
  //     // });
  //     // const result = await response.json();
  //     // localStorage.setItem('token', result.token);
      
  //     // Simulate API call delay
  //     await new Promise(resolve => setTimeout(resolve, 2000));
      
  //     // Simulate successful login
  //     const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
  //     localStorage.setItem('token', mockToken);
  //     localStorage.setItem('username', data.username);
      
  //     toast({
  //       title: "Welcome back!",
  //       description: "You have been successfully signed in.",
  //     });
      
  //     navigate('/');
  //   } catch (error) {
  //     toast({
  //       title: "Sign In Failed",
  //       description: "Invalid username or password. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
  const onSubmit = async (data: SignInFormData) => {
  setIsSubmitting(true);
  
  try {
    const response = await fetch('/api/auth/signin', {  // Proxied to localhost:8081
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Sign in failed');
    }

    const result = await response.json();  // JwtResponse: { token, username, roles }
    
    localStorage.setItem('token', result.token);
    localStorage.setItem('username', result.username);
    // Optional: Store roles if needed later (e.g., for UI conditional rendering)
    localStorage.setItem('roles', JSON.stringify(result.roles));
    
    toast({
      title: "Welcome back!",
      description: "You have been successfully signed in.",
    });
    
    navigate('/');
  } catch (error) {
    toast({
      title: "Sign In Failed",
      description: error.message || "Invalid username or password. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="bg-glass/80 backdrop-blur-glass border-glass-border shadow-glass">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-lg bg-gradient-primary w-fit shadow-glow">
              <LogIn className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <p className="text-muted-foreground">
              Sign in to access your NFTickets account
            </p>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Enter your username" 
                            className="bg-glass/30 border-glass-border pl-10"
                            {...field} 
                          />
                        </div>
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="password"
                            placeholder="Enter your password" 
                            className="bg-glass/30 border-glass-border pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign up now
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Button variant="outline" className="w-full border-glass-border bg-glass/30" asChild>
                <Link to="/signup" className="flex items-center justify-center">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create New Account
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;