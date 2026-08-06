import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
            <p className="text-6xl mb-4">🔍</p>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
            <p className="text-xl text-gray-600 mb-4">Page Not Found</p>
            <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
            <Link 
                to="/dashboard" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
                Go Home
            </Link>
        </div>
    );
};

export default NotFound;


