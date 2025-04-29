import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { Eye, EyeOff, User, Lock, LogIn, AlertCircle } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        router.push('/');
      } else {
        setError(data.message || "Invalid username or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-400 via-blue-300 to-blue-500 overflow-hidden relative">
        {/* Decorative circles for background */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-white opacity-10 rounded-full"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-200 opacity-20 rounded-full"></div>
       
        {/* Glass card container */}
        <div className="w-full max-w-md backdrop-blur-lg bg-white/20 p-8 rounded-2xl shadow-2xl border border-white/30 z-10">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-blue-600/90 p-4 rounded-full mb-4 text-white shadow-lg">
              <LogIn size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white text-center">Welcome Back</h1>
            <p className="text-blue-100 mt-2 text-center">Please sign in to continue</p>
          </div>
         
          {error && (
            <div className="mb-6 p-3 bg-red-500/30 border border-red-500/50 rounded-lg flex items-center text-white">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
         
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-white text-sm font-medium mb-2"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-blue-100" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="bg-white/10 text-white pl-10 pr-3 py-3 w-full rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition placeholder-blue-200"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>
           
            <div>
              <label
                htmlFor="password"
                className="block text-white text-sm font-medium mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-100" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-white/10 text-white pl-10 pr-12 py-3 w-full rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition placeholder-blue-200"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-100 hover:text-white focus:outline-none"
                  tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
           
            
           
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-lg transform hover:translate-y-[-2px] active:translate-y-0 flex justify-center items-center space-x-2 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
