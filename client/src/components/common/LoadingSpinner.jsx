import React from 'react';

const LoadingSpinner = ({ fullScreen = false }) => {
    const spinner = (
        <div className="flex items-center justify-center gap-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 rounded-full border-t-primary-600 animate-spin"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-600 rounded-full border-t-primary-600 animate-spin delay-150"></div>
            </div>
            <span className="text-gray-600 text-sm">Loading...</span>
        </div>
    );
    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                {spinner}
            </div>
        )
    }
    return <div className="flex items-center justify-center py-12">{spinner}</div>;
}

export default LoadingSpinner;