import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { loginUser } from "@/features/auth/authSlice";
import { toast } from "sonner";
import useSmoothScrollToTop from "@/hooks/useSmoothScrollToTop";
import { User, Lock, LogIn, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const signInSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
  useSmoothScrollToTop();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, currentUser } = useAppSelector((state) => state.auth);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: SignInFormData) => {
    dispatch(loginUser(data));
  };

  useEffect(() => {
    if (currentUser) {
      toast.success("Welcome back!", {
        description: "You have been successfully signed in.",
      });
      
      // Check if there's a redirect path stored (e.g., user was trying to purchase a ticket)
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin'); // Clean up
        navigate(redirectPath);
      } else {
        navigate('/'); 
      }
    }
    if (error) {
      toast.error("Sign In Failed", {
        description: error || "Invalid username or password. Please try again.",
      });
    }
  }, [currentUser, error, navigate]);

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
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
