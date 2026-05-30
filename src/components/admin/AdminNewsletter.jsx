import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastProvider';
import { Mail, Copy, Loader2, Calendar } from 'lucide-react';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const res = await api.get('/admin/newsletter');
        setSubscribers(res.data?.data || []);
      } catch (error) {
        showToast("Failed to load subscribers", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscribers();
  }, []);

  const copyAllEmails = () => {
    const emailList = subscribers.map(sub => sub.email).join(', ');
    navigator.clipboard.writeText(emailList);
    showToast("Copied all emails to clipboard!", "success");
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Mail className="text-orange-500" />
            Newsletter Subscribers
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Total: <span className="font-bold text-gray-900">{subscribers.length}</span> active subscribers
          </p>
        </div>
        
        <button 
          onClick={copyAllEmails}
          disabled={subscribers.length === 0}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
        >
          <Copy size={16} />
          Copy All Emails
        </button>
      </div>

      {subscribers.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border-2 border-dashed rounded-lg">
          No subscribers yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 font-medium text-gray-600">Email Address</th>
                <th className="p-4 font-medium text-gray-600">Subscribed On</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub._id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">{sub.email}</td>
                  <td className="p-4 text-gray-500 flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(sub.createdAt).toLocaleDateString('en-NG', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}