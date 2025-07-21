import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';

const ApiDebug: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing...');
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const testApi = async () => {
      try {
        setStatus('Testing API connection...');
        
        // Test health endpoint
        const healthResponse = await fetch('http://localhost:3002/api/health');
        if (!healthResponse.ok) {
          throw new Error(`Health check failed: ${healthResponse.status}`);
        }
        
        setStatus('API is responding. Testing time logs...');
        
        // Test time logs endpoint
        const logs = await apiService.getTimeLogs();
        setTimeLogs(logs);
        setStatus(`Success! Found ${logs.length} time logs`);
        
        // Debug: Log the first few time logs to see their structure
        console.log('API Debug - Time logs structure:', logs.slice(0, 2));
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('API test failed');
        console.error('API Debug Error:', err);
      }
    };

    testApi();
  }, []);

  if (!isVisible) return null;

  return (
    <div className="p-4 bg-white rounded-lg shadow relative">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <h2 className="text-lg font-bold mb-4">API Debug</h2>
      <div className="mb-4">
        <strong>Status:</strong> {status}
      </div>
      {error && (
        <div className="mb-4 text-red-600">
          <strong>Error:</strong> {error}
        </div>
      )}
      {timeLogs.length > 0 && (
        <div>
          <strong>Time Logs ({timeLogs.length}):</strong>
          <ul className="mt-2 space-y-1">
            {timeLogs.slice(0, 3).map((log, index) => (
              <li key={index} className="text-sm">
                {log.projectName} - {log.subprojectName}: {log.duration}s ({log.description})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ApiDebug; 