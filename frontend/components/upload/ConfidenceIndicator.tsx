import React from 'react';

interface ConfidenceIndicatorProps {
    confidence: number;
    className?: string;
}

/**
 * Component to display a confidence score for parsed transactions
 */
const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ confidence, className = '' }) => {
    // Determine color based on confidence level
    const getColor = () => {
        if (confidence >= 0.8) return 'bg-green-500';
        if (confidence >= 0.6) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    // Determine label based on confidence level
    const getLabel = () => {
        if (confidence >= 0.8) return 'High Confidence';
        if (confidence >= 0.6) return 'Medium Confidence';
        return 'Low Confidence';
    };

    // Calculate width percentage
    const widthPercentage = Math.round(confidence * 100);

    return (
        <div className={`flex flex-col ${className}`}>
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-300">Parsing Confidence</span>
                <span className="text-sm font-medium text-gray-300">{widthPercentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                    className={`h-2.5 rounded-full ${getColor()}`}
                    style={{ width: `${widthPercentage}%` }}
                ></div>
            </div>
            <div className="mt-1">
                <span className="text-xs text-gray-400">{getLabel()}</span>
                {confidence < 0.8 && (
                    <p className="text-xs text-gray-400 mt-1">
                        Some transactions may require manual verification due to {confidence < 0.6 ? 'low' : 'medium'} confidence in parsing.
                    </p>
                )}
            </div>
        </div>
    );
};

export default ConfidenceIndicator; 