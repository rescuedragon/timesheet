import React from 'react';
import ApiTest from '@/components/ApiTest';

const ApiTestPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      <ApiTest />
    </div>
  );
};

export default ApiTestPage;