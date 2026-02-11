import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import supabase from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAvailable, setUserAvailable] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!mounted) return;
        if (error) {
          setUserAvailable(false);
        } else {
          setUserAvailable(Boolean(data?.user));
        }
      } catch (err) {
        console.error('Error checking user session for reset:', err);
        if (mounted) setUserAvailable(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password should be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        console.error('Update password error:', error);
        toast.error(error.message || 'Unable to update password');
        return;
      }
      toast.success('Password updated. You can now sign in with your new password.');
      navigate('/account/login');
    } catch (err) {
      console.error('Unexpected error updating password:', err);
      toast.error('Unable to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800">
              NEC<span className="text-orange-500">TA</span>
            </h1>
            <h2 className="mt-4 text-xl font-semibold text-gray-800">Reset your password</h2>
            <p className="mt-2 text-gray-600">Use the form below to set a new password.</p>
          </div>

          {userAvailable === false && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-300 text-yellow-800">
              The reset link appears invalid or you are not signed in. Please use the link provided in your email to open this page.
            </div>
          )}

          {userAvailable === null ? (
            <div className="text-center text-gray-500">Checking session…</div>
          ) : (
            userAvailable && (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    placeholder="New password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 px-4 bg-orange-600 text-white rounded-md disabled:opacity-60"
                  >
                    {isSubmitting ? 'Saving…' : 'Save new password'}
                  </button>
                </div>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
}
