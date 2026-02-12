import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AuthNavbar from "@/components/landing/AuthNavbar";

// Hardcoded API URLs for testing
const API_URLS = [
  'http://127.0.0.1:5000',
  'http://localhost:5000',
  'http://192.168.0.103:5000'
];

export const LoginPage = () => {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<{url: string, status: string}[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Test all API URLs
  const testApiConnections = async () => {
    const status = [];
    
    for (const url of API_URLS) {
      try {
        const response = await fetch(`${url}/health`, { 
          method: 'GET',
          mode: 'cors',
          signal: AbortSignal.timeout(3000)
        });
        const data = await response.json();
        status.push({
          url, 
          status: response.ok ? `✅ Working (${data.num_models} models)` : '❌ Failed'
        });
      } catch (error) {
        status.push({
          url, 
          status: `❌ Error: ${error.message.slice(0, 30)}...`
        });
      }
    }
    
    setApiStatus(status);
  };

  // Test API connections on mount
  React.useEffect(() => {
    testApiConnections();
  }, []);

  const handleLogin = async (e: React.FormEvent, apiUrl: string) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔗 Attempting login to:', apiUrl);
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password ? '[HIDDEN]' : '[EMPTY]');

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('📊 Response data:', data);

      if (data.success) {
        toast({
          title: "Welcome back! 🌱",
          description: `Successfully logged in as ${data.user.fullName}`,
        });

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('apiUrl', apiUrl); // Remember working API

        console.log('✅ Login successful, redirecting to dashboard...');
        navigate("/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: data.error || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      toast({
        title: "Connection error",
        description: `Could not connect to server: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const bypassLogin = () => {
    console.log('🚪 Bypassing login...');
    const user = {
      email: 'test@example.com',
      fullName: 'Test Farmer',
      phone: '1234567890',
      address: null,
      profilePictureUrl: null
    };
    localStorage.setItem('user', JSON.stringify(user));
    toast({
      title: "Login Bypassed! 🚪",
      description: "Using test user account",
    });
    navigate("/dashboard");
  };

  return (
    <>
      <AuthNavbar />

      <div className="min-h-screen flex items-center justify-center p-4 gradient-earth pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-2xl space-y-6 relative z-10">
          {/* API Status Card */}
          <Card className="shadow-2xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                API Connection Status
              </CardTitle>
              <CardDescription>
                Test which backend URL is working from your browser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                {apiStatus.map((status, index) => (
                  <div key={index} className={`p-2 rounded ${status.status.includes('✅') ? 'bg-green-50' : 'bg-red-50'}`}>
                    {status.url}: {status.status}
                  </div>
                ))}
              </div>
              <Button 
                onClick={testApiConnections} 
                variant="outline" 
                size="sm" 
                className="mt-4"
              >
                Test Again
              </Button>
            </CardContent>
          </Card>

          {/* Login Forms - Multiple API Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {API_URLS.map((apiUrl) => (
              <Card key={apiUrl} className="shadow-2xl border-border/50">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">Login via {apiUrl}</CardTitle>
                </CardHeader>
                <form onSubmit={(e) => handleLogin(e, apiUrl)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`email-${apiUrl}`}>Email Address</Label>
                      <Input
                        id={`email-${apiUrl}`}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`password-${apiUrl}`}>Password</Label>
                      <div className="relative">
                        <Input
                          id={`password-${apiUrl}`}
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Leaf className="mr-2 h-4 w-4" />
                          Login
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            ))}
          </div>

          {/* Bypass Button */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  If login doesn't work, try the bypass:
                </p>
                <Button 
                  onClick={bypassLogin} 
                  variant="outline"
                  className="bg-yellow-100 hover:bg-yellow-200"
                >
                  🚪 Bypass to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};