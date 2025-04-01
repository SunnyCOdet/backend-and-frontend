import React, { useState, useEffect } from 'react';
import api from '../utils/api'; // Adjust path as needed
import { Users, KeyRound, Trash2, PlusCircle, Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  license?: License | null; // Include license info if available from backend
}

interface License {
    id: number;
    license_key: string;
    hwid: string | null;
    user_id: number;
}


const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);

  const [loadingAction, setLoadingAction] = useState<Record<number, boolean>>({}); // Track loading state per user ID
  const [errorAction, setErrorAction] = useState<Record<number, string | null>>({}); // Track errors per user ID
  const [successAction, setSuccessAction] = useState<Record<number, string | null>>({}); // Track success per user ID


  const fetchUsers = async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      // Assuming an admin endpoint exists to fetch all users and their licenses
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setErrorUsers(err.response?.data?.message || 'Failed to fetch user data.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (userId: number, action: 'generate' | 'revoke') => {
    setLoadingAction(prev => ({ ...prev, [userId]: true }));
    setErrorAction(prev => ({ ...prev, [userId]: null }));
    setSuccessAction(prev => ({ ...prev, [userId]: null }));

    try {
      let response;
      if (action === 'generate') {
        response = await api.post(`/license/generate`, { userId }); // Assuming endpoint takes userId in body
        setSuccessAction(prev => ({ ...prev, [userId]: `License generated successfully!` }));
      } else if (action === 'revoke') {
         // Find the license ID associated with the user
         const user = users.find(u => u.id === userId);
         const licenseId = user?.license?.id;
         if (!licenseId) {
             throw new Error("Cannot revoke: No license found for this user.");
         }
        response = await api.delete(`/license/revoke/${licenseId}`); // Assuming endpoint takes license ID in URL
        setSuccessAction(prev => ({ ...prev, [userId]: 'License revoked successfully!' }));
      }
      // Refresh users list to show updated license status
      await fetchUsers();

    } catch (err: any) {
      console.error(`Error performing action ${action} for user ${userId}:`, err);
      const message = err.response?.data?.message || err.message || `Failed to ${action} license.`;
      setErrorAction(prev => ({ ...prev, [userId]: message }));
    } finally {
      setLoadingAction(prev => ({ ...prev, [userId]: false }));
      // Clear success/error messages after a delay
      setTimeout(() => {
          setErrorAction(prev => ({ ...prev, [userId]: null }));
          setSuccessAction(prev => ({ ...prev, [userId]: null }));
      }, 4000);
    }
  };

  // Add function to delete user (optional)
  // const handleDeleteUser = async (userId: number) => { ... }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
        <Users className="mr-3" size={32} /> Admin Panel - User Management
      </h1>

      {loadingUsers && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading users...</span>
        </div>
      )}

      {errorUsers && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold mr-2">Error:</strong>
          <span className="block sm:inline">{errorUsers}</span>
        </div>
      )}

      {!loadingUsers && !errorUsers && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Key</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HWID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {user.license ? (
                        <span title={user.license.license_key} className="truncate block max-w-[150px]">{user.license.license_key}</span>
                    ) : (
                        <span className="text-gray-400 italic">None</span>
                    )}
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                     {user.license?.hwid ? (
                        <span title={user.license.hwid} className="truncate block max-w-[150px]">{user.license.hwid}</span>
                     ) : (
                        <span className="text-gray-400 italic">Not Bound</span>
                     )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {/* Action Buttons */}
                    {!user.license ? (
                      <button
                        onClick={() => handleAction(user.id, 'generate')}
                        disabled={loadingAction[user.id]}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                        title="Generate License"
                      >
                        {loadingAction[user.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle size={18} />}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(user.id, 'revoke')}
                        disabled={loadingAction[user.id]}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                        title="Revoke License"
                      >
                         {loadingAction[user.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={18} />}
                      </button>
                    )}
                    {/* Optional: Add Edit/Delete User buttons here */}
                    {/* Status Indicators */}
                    {errorAction[user.id] && <AlertTriangle size={18} className="inline text-red-500 ml-1" title={errorAction[user.id] || 'Error'} />}
                    {successAction[user.id] && <CheckCircle size={18} className="inline text-green-500 ml-1" title={successAction[user.id] || 'Success'} />}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
