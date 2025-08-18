import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roles: z.string().min(1, "Please select a role"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      roles: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
  setIsSubmitting(true);
  
  const payload = {
    username: data.username,
    email: data.email,
    password: data.password,
    roles: [data.roles.toLowerCase()], // Ensure lowercase to match backend (e.g., "admin" or "user")
  };
  
  try {
    const response = await fetch('/api/auth/signup', {  // Proxied to localhost:8081
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Registration failed');
    }

    const result = await response.text();  // Backend returns string like "User registered successfully!"
    
    toast({
      title: "Account Created Successfully!",
      description: result,
    });
    
    navigate('/signin');
  } catch (error) {
    toast({
      title: "Registration Failed",
      description: error.message || "Unable to create account. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};
  // const onSubmit = async (data: SignUpFormData) => {
  //   setIsSubmitting(true);
    
  //   try {
  //     const payload = {
  //       username: data.username,
  //       email: data.email,
  //       password: data.password,
  //       roles: [data.roles], // Convert to array as expected by backend
  //     };
      
  //     console.log("Sign up attempt:", payload);
      
  //     // In real implementation, this would be:
  //     // const response = await fetch('/api/auth/signup', {
  //     //   method: 'POST',
  //     //   headers: { 'Content-Type': 'application/json' },
  //     //   body: JSON.stringify(payload),
  //     // });
      
  //     // Simulate API call delay
  //     await new Promise(resolve => setTimeout(resolve, 2000));
      
  //     toast({
  //       title: "Account Created Successfully!",
  //       description: "Welcome to NFTickets! Please sign in to continue.",
  //     });
      
  //     // Redirect to sign in page
  //     navigate('/signin');
  //   } catch (error) {
  //     toast({
  //       title: "Registration Failed",
  //       description: "Unable to create account. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="bg-glass/80 backdrop-blur-glass border-glass-border shadow-glass">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-lg bg-gradient-primary w-fit shadow-glow">
              <UserPlus className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Join NFTickets
            </CardTitle>
            <p className="text-muted-foreground">
              Create your account and start exploring blockchain-verified events
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
                            placeholder="Choose a username" 
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="email"
                            placeholder="your@email.com" 
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
                            placeholder="Create a secure password" 
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
                  name="roles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-glass/30 border-glass-border">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User - Attend Events</SelectItem>
                          <SelectItem value="admin">Admin - Organize Events</SelectItem>
                        </SelectContent>
                      </Select>
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
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link 
                  to="/signin" 
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Button variant="outline" className="w-full border-glass-border bg-glass/30" asChild>
                <Link to="/signin" className="flex items-center justify-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In Instead
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;