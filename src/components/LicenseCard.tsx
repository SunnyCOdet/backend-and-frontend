import React from 'react';
import { KeyRound, ClipboardCopy, CheckCircle, XCircle, Server } from 'lucide-react';

interface LicenseCardProps {
  licenseKey: string | null;
  hwid: string | null;
  onBindHwid?: () => void; // Optional: Function to trigger HWID binding
  isValid?: boolean | null; // Optional: Indicates if the license/HWID is currently validated
}

const LicenseCard: React.FC<LicenseCardProps> = ({ licenseKey, hwid, onBindHwid, isValid }) => {

  const copyToClipboard = () => {
    if (licenseKey) {
      navigator.clipboard.writeText(licenseKey)
        .then(() => alert('License key copied to clipboard!')) // Replace with a better notification system later
        .catch(err => console.error('Failed to copy text: ', err));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center">
          <KeyRound className="mr-2 text-blue-500" size={24} />
          Your License
        </h2>
        {isValid !== null && (
          isValid ? (
            <span className="flex items-center text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              <CheckCircle size={16} className="mr-1" /> Valid
            </span>
          ) : (
            <span className="flex items-center text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
              <XCircle size={16} className="mr-1" /> Invalid / Unbound
            </span>
          )
        )}
      </div>

      {licenseKey ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200">
            <span className="font-mono text-sm text-gray-600 break-all">{licenseKey}</span>
            <button
              onClick={copyToClipboard}
              title="Copy License Key"
              className="ml-2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
            >
              <ClipboardCopy size={18} />
            </button>
          </div>

          <div className="border-t pt-3 mt-3">
            <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
              <Server size={16} className="mr-1.5 text-gray-400" />
              Bound Hardware ID (HWID)
            </h3>
            {hwid ? (
              <p className="font-mono text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 break-all">{hwid}</p>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-gray-500 mb-2">No HWID bound yet.</p>
                {onBindHwid && (
                   <button
                    onClick={onBindHwid}
                    className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors duration-200"
                  >
                    Bind Current Device HWID
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">No license key found for your account.</p>
      )}
    </div>
  );
};

export default LicenseCard;
