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
    <div className="min-h-screen bg-[#FAFAFA] relative overflow-hidden">
      {/* Apple-style background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-100/40 via-transparent to-purple-200/30"></div>
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-purple-300/20 to-purple-400/10 rounded-full blur-3xl transform rotate-12"></div>
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Top Left Branding - Apple Style */}
      <div className="absolute top-8 left-8 z-20">
        <div className="text-2xl font-medium text-purple-900/90 tracking-tight">
          Timesheet
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Section - Date and Branding */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
          <div className="w-full max-w-md space-y-8">
            {/* Date Display - Apple Style */}
            <div className="text-center space-y-3">
              <div className="text-4xl font-medium text-purple-900/90 tracking-tight">
                Welcome back
              </div>
              <div className="text-sm font-medium text-purple-700/60 tracking-wide">
                {currentDate}
              </div>
            </div>

            {/* Login Card */}
            <Card className="bg-white/90 backdrop-blur-2xl border border-purple-100/50 shadow-xl shadow-purple-200/30 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-300/30">
              <CardContent className="p-10 space-y-7">
                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <Label 
                      htmlFor="username" 
                      className="text-sm font-medium text-purple-900/80"
                    >
                      Email or Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-14 rounded-2xl border border-purple-100 bg-white/80 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-300/30 transition-all duration-300 text-purple-900 placeholder:text-purple-300 shadow-sm hover:border-purple-200"
                      placeholder="Enter your email or username"
                    />
                  </div>
                  
                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label 
                      htmlFor="password" 
                      className="text-sm font-medium text-purple-900/80"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 rounded-2xl border border-purple-100 bg-white/80 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-300/30 transition-all duration-300 text-purple-900 placeholder:text-purple-300 shadow-sm hover:border-purple-200"
                      placeholder="Enter your password"
                    />
                  </div>

                  {/* Sign In Button */}
                  <Button
                    type="submit"
                    className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-2xl shadow-lg shadow-purple-300/30 hover:shadow-xl hover:shadow-purple-400/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border-0"
                  >
                    Continue
                  </Button>
                </form>

                {/* Additional Options */}
                <div className="pt-5 border-t border-purple-50">
                  <div className="text-center">
                    <button className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors duration-300">
                      Forgot password?
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Text */}
            <div className="text-center text-xs text-purple-500/70 space-y-2 mt-8">
              <div>Secure login with end-to-end encryption</div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                <span>Protected connection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-8 text-center">
          <div className="text-xs text-purple-400/70">
            © 2025 TimeTracker. Crafted with care.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;