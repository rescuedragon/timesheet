import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';

// Check API connection on component mount
const checkApiConnection = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/health');
    if (!response.ok) {
      throw new Error(`API health check failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('API health check:', data);
    return { success: true, data };
  } catch (error) {
    console.error('API connection error:', error);
    return { success: false, error };
  }
};

const ApiTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState<{ success: boolean, message: string } | null>(null);
  
  // Check API connection on component mount
  useEffect(() => {
    const checkApi = async () => {
      setLoading(true);
      const connectionResult = await checkApiConnection();
      if (connectionResult.success) {
        setApiStatus({ 
          success: true, 
          message: `API is running. Server time: ${connectionResult.data.timestamp}` 
        });
      } else {
        setApiStatus({ 
          success: false, 
          message: `API is not responding. Make sure the server is running on port 3002.` 
        });
      }
      setLoading(false);
    };
    
    checkApi();
  }, []);

  const testGetProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const projects = await apiService.getProjects();
      setResult({ projects });
      console.log('Projects:', projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const testGetTimeLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const timeLogs = await apiService.getTimeLogs();
      setResult({ timeLogs });
      console.log('Time logs:', timeLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching time logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const testCreateTimeLog = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get the first project and subproject
      const projects = await apiService.getProjects();
      if (projects.length === 0) {
        throw new Error('No projects found');
      }
      
      const project = projects[0];
      if (project.subprojects.length === 0) {
        throw new Error('No subprojects found');
      }
      
      const subproject = project.subprojects[0];
      
      // Create a new time log
      const newTimeLog = {
        projectId: project.id,
        subprojectId: subproject.id,
        projectName: project.name,
        subprojectName: subproject.name,
        duration: 1800, // 30 minutes in seconds
        description: 'Test time log from API test component',
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00:00',
        endTime: '14:30:00'
      };
      
      const createdTimeLog = await apiService.createTimeLog(newTimeLog);
      setResult({ createdTimeLog });
      console.log('Created time log:', createdTimeLog);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error creating time log:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">API Test</h2>
      
      {/* API Status */}
      {apiStatus && (
        <div className={`p-3 mb-4 rounded ${apiStatus.success ? 'bg-green-100 border border-green-300 text-green-700' : 'bg-red-100 border border-red-300 text-red-700'}`}>
          <strong>API Status:</strong> {apiStatus.message}
          
          {!apiStatus.success && (
            <div className="mt-2">
              <p>To start the server, run these commands in your terminal:</p>
              <pre className="bg-gray-800 text-white p-2 rounded mt-1">
                cd server{'\n'}
                npm start
              </pre>
            </div>
          )}
        </div>
      )}
      
      <div className="flex gap-2 mb-4">
        <button 
          onClick={testGetProjects}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading || !apiStatus?.success}
        >
          Test Get Projects
        </button>
        
        <button 
          onClick={testGetTimeLogs}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={loading || !apiStatus?.success}
        >
          Test Get Time Logs
        </button>
        
        <button 
          onClick={testCreateTimeLog}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          disabled={loading || !apiStatus?.success}
        >
          Test Create Time Log
        </button>
      </div>
      
      {loading && <p className="text-gray-600">Loading...</p>}
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Result:</h3>
          <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-60">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;