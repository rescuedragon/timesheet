import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Props interface for LoginPage component
 */
interface LoginPageProps {
  onLogin: () => void;  // Callback function when login is successful
}

/**
 * LoginPage Component
 * Renders a login form with username and password fields
 */
const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  // State management
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  /**
   * Effect: Initialize and update date display
   */
  useEffect(() => {
    updateDate();
    const interval = setInterval(updateDate, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  /**
   * Function: Format and update the current date
   */
  const updateDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    setCurrentDate(now.toLocaleDateString('en-US', options));
  };

  /**
   * Function: Handle form submission
   */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 via-transparent to-purple-600/10"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/5 w-80 h-80 bg-gradient-to-tr from-blue-400/8 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Top Left Branding */}
      <div className="absolute top-6 left-6 z-20">
        <div className="text-2xl font-semibold text-slate-800 tracking-tight">
          Timesheet
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Section - Date and Branding */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
          <div className="w-full max-w-md space-y-8">
            {/* Date Display */}
            <div className="text-center space-y-2">
              <div className="text-3xl font-light text-slate-800 tracking-tight">
                Welcome back
              </div>
              <div className="text-sm font-medium text-slate-500 tracking-wide">
                {currentDate}
              </div>
            </div>

            {/* Login Card */}
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl shadow-purple-500/10 rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <Label 
                      htmlFor="username" 
                      className="text-sm font-medium text-slate-700"
                    >
                      Email or Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-12 rounded-2xl border-2 border-slate-200 bg-white/70 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-slate-800 placeholder:text-slate-400 shadow-sm"
                      placeholder="Enter your email or username"
                    />
                  </div>
                  
                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label 
                      htmlFor="password" 
                      className="text-sm font-medium text-slate-700"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-2xl border-2 border-slate-200 bg-white/70 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-slate-800 placeholder:text-slate-400 shadow-sm"
                      placeholder="Enter your password"
                    />
                  </div>

                  {/* Sign In Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] border-0"
                  >
                    Sign In
                  </Button>
                </form>

                {/* Additional Options */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-center">
                    <button className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200">
                      Forgot your password?
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Text */}
            <div className="text-center text-xs text-slate-500 space-y-1">
              <div>Secure login powered by advanced encryption</div>
              <div className="flex items-center justify-center space-x-1">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>Protected connection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-8 text-center">
          <div className="text-xs text-slate-400">
            © 2025 TimeTracker. Designed with precision.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;