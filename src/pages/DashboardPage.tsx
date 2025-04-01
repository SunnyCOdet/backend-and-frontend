import React, { useState, useEffect } from 'react';
import LicenseCard from '../components/LicenseCard'; // Adjust path as needed
import { useAuth } from '../context/AuthContext'; // Adjust path as needed
import api from '../utils/api'; // Adjust path as needed
import { AlertCircle, Loader2 } from 'lucide-react';

interface LicenseData {
  license_key: string | null;
  hwid: string | null;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null); // To store validation result

  const fetchLicenseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/license/me'); // Assuming '/license/me' fetches the user's license
      setLicenseData(response.data);
      // Optionally, immediately validate if HWID exists
      if (response.data?.license_key && response.data?.hwid) {
        validateHwid(response.data.hwid); // Pass the fetched HWID
      } else {
         setIsValid(false); // No license or HWID means not valid
      }
    } catch (err: any) {
      console.error("Error fetching license data:", err);
      if (err.response?.status === 404) {
        setLicenseData({ license_key: null, hwid: null }); // Handle case where user has no license yet
      } else {
        setError(err.response?.data?.message || 'Failed to fetch license information.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to simulate getting HWID (replace with actual C# interop or method)
  const getSimulatedHwid = (): string => {
    // IMPORTANT: This is a placeholder. In a real scenario,
    // you'd need a way for the C# app to provide this HWID to the web frontend,
    // or have the C# app call the bind endpoint directly.
    // For web demo purposes, we can generate a pseudo-HWID.
    return `WEB-${navigator.userAgent.substring(0, 20)}-${Math.random().toString(36).substring(2, 15)}`;
  };


  const handleBindHwid = async () => {
    setError(null);
    const currentHwid = getSimulatedHwid(); // Get the HWID to bind
    if (!currentHwid) {
        setError("Could not retrieve Hardware ID.");
        return;
    }

    setLoading(true); // Indicate loading state for binding action
    try {
      await api.post('/license/bind', { hwid: currentHwid });
      // Refresh license data after successful binding
      await fetchLicenseData();
      alert('HWID bound successfully!'); // Replace with better notification
    } catch (err: any) {
      console.error("Error binding HWID:", err);
      setError(err.response?.data?.message || 'Failed to bind HWID.');
      setLoading(false); // Ensure loading is turned off on error
    }
    // setLoading(false) is handled in fetchLicenseData's finally block
  };

   const validateHwid = async (hwidToValidate: string) => {
    // This function might be called automatically or by a button
    // It simulates the C# app checking its HWID against the backend
    setLoading(true); // Indicate loading for validation check
    setError(null);
    try {
      // In a real app, the C# client would make this call with its *actual* HWID
      const response = await api.post('/license/validate', { hwid: hwidToValidate });
      setIsValid(response.data.isValid); // Assuming backend returns { isValid: true/false }
    } catch (err: any) {
      console.error("Error validating HWID:", err);
      setError(err.response?.data?.message || 'Failed to validate HWID.');
      setIsValid(false); // Assume invalid on error
    } finally {
       setLoading(false); // Turn off loading indicator for validation
    }
  };


  useEffect(() => {
    fetchLicenseData();
  }, []); // Fetch data on component mount

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome, {user?.username}!</h1>

      {loading && !licenseData && ( // Show initial loading spinner
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading your license...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold mr-2">Error:</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!loading && licenseData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LicenseCard
            licenseKey={licenseData.license_key}
            hwid={licenseData.hwid}
            onBindHwid={handleBindHwid} // Pass the binding function
            isValid={isValid} // Pass validation status
          />

          {/* Placeholder for other dashboard widgets */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Account Status</h2>
            <p className="text-gray-600">Role: <span className="font-medium capitalize">{user?.role}</span></p>
            {/* Add more account details or actions here */}
             {licenseData.license_key && licenseData.hwid && !loading && (
                 <button
                    onClick={() => validateHwid(getSimulatedHwid())} // Validate with current simulated HWID
                    disabled={loading}
                    className={`mt-4 px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Validating...' : 'Check License Validity'}
                </button>
             )}
          </div>
        </div>
      )}

       {/* Informational Note about HWID */}
       <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 flex items-start">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <div>
                <h3 className="font-semibold">Hardware ID (HWID) Binding</h3>
                <p className="text-sm">
                    The 'Bind HWID' button uses a simulated HWID for demonstration purposes within this web interface.
                    In a real-world scenario, your C# application would securely obtain the actual device HWID and either:
                    <br /> a) Call the `/license/bind` API endpoint directly.
                    <br /> b) Provide the HWID to this web interface through a secure channel (if applicable).
                    <br />The 'Check License Validity' button also uses a simulated HWID for the validation check in this demo. Your C# app would perform this check using its real HWID.
                </p>
            </div>
        </div>
    </div>
  );
};

export default DashboardPage;
