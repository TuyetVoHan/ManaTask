import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { ArrowLeft, Mail, Lock, CheckCircle2 } from 'lucide-react';

type ResetStep = 'email' | 'code' | 'password';

interface ResetPasswordPageProps {
  onNavigateToSignIn: () => void;
}

export default function ResetPasswordPage({ onNavigateToSignIn }: ResetPasswordPageProps) {
  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Mock: Send reset code to email
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('code');
      // In a real app, this would send an email with the code
      console.log('Reset code sent to:', email);
    }, 1000);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('Please enter the 6-character code');
      return;
    }

    // Mock: Verify code
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, this would verify the code with the backend
      // For demo, accept any 6-character code
      setStep('password');
      console.log('Code verified:', code);
    }, 1000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Mock: Reset password
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, this would update the password in the backend
      console.log('Password reset successful for:', email);
      // Show success and redirect to sign-in
      alert('Password reset successful! Please sign in with your new password.');
      onNavigateToSignIn();
    }, 1000);
  };

  const handleBack = () => {
    setError('');
    if (step === 'code') {
      setStep('email');
      setCode('');
    } else if (step === 'password') {
      setStep('code');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      onNavigateToSignIn();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1868DB]/10 rounded-full mb-4">
              <Lock className="w-8 h-8 text-[#1868DB]" />
            </div>
            <h1 className="text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600 text-sm">
              {step === 'email' && 'Enter your email to receive a reset code'}
              {step === 'code' && 'Enter the 6-character code sent to your email'}
              {step === 'password' && 'Create a new password for your account'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  step === 'email'
                    ? 'bg-[#1868DB] text-white'
                    : 'bg-green-500 text-white'
                }`}
              >
                {step === 'email' ? '1' : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <span className="text-xs text-gray-600">Email</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2">
              <div
                className={`h-full transition-all ${
                  step === 'code' || step === 'password'
                    ? 'bg-[#1868DB] w-full'
                    : 'bg-gray-200 w-0'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  step === 'code'
                    ? 'bg-[#1868DB] text-white'
                    : step === 'password'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step === 'password' ? <CheckCircle2 className="w-5 h-5" /> : '2'}
              </div>
              <span className="text-xs text-gray-600">Code</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2">
              <div
                className={`h-full transition-all ${
                  step === 'password' ? 'bg-[#1868DB] w-full' : 'bg-gray-200 w-0'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  step === 'password'
                    ? 'bg-[#1868DB] text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                3
              </div>
              <span className="text-xs text-gray-600">Reset</span>
            </div>
          </div>

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-[#1868DB] hover:bg-[#1557b0]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Code'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={onNavigateToSignIn}
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Code Verification */}
          {step === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <p className="text-xs text-gray-500 mb-4">
                  We sent a code to <span className="font-medium">{email}</span>
                </p>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={(value: any) => setCode(value)}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-[#1868DB] hover:underline"
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      setIsLoading(false);
                      alert('A new code has been sent to your email');
                    }, 1000);
                  }}
                  disabled={isLoading}
                >
                  Didn't receive the code? Resend
                </button>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-[#1868DB] hover:bg-[#1557b0]"
                  disabled={isLoading || code.length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-[#1868DB] hover:bg-[#1557b0]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <button
              onClick={onNavigateToSignIn}
              className="text-[#1868DB] hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
