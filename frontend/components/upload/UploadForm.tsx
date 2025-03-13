import React, { useState } from 'react';
import { Clipboard } from 'lucide-react';

interface UploadFormProps {
    onSmsProcess: (smsText: string) => Promise<void>;
    isLoading: boolean;
}

/**
 * Form for processing M-Pesa SMS messages
 */
const UploadForm: React.FC<UploadFormProps> = ({
    onSmsProcess,
    isLoading
}) => {
    const [smsText, setSmsText] = useState('');

    const handleSmsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (smsText.trim()) {
            onSmsProcess(smsText);
        }
    };

    const handlePasteFromClipboard = async () => {
        try {
            if (navigator.clipboard) {
                const text = await navigator.clipboard.readText();
                if (text) {
                    setSmsText(text);
                }
            }
        } catch (error) {
            console.error('Failed to read clipboard:', error);
            // Fallback for browsers that don't support clipboard API
            alert('Please use the paste shortcut (Ctrl+V or Cmd+V) or long-press and select paste.');
        }
    };

    return (
        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="p-6 bg-gray-900">
                <form onSubmit={handleSmsSubmit}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Paste M-Pesa SMS Message
                    </label>
                    <div className="relative">
                        <textarea
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-300"
                            rows={6}
                            value={smsText}
                            onChange={(e) => setSmsText(e.target.value)}
                            onPaste={(e) => {
                                // This helps with some mobile browsers
                                const pasteData = e.clipboardData.getData('text');
                                if (pasteData) {
                                    setSmsText(pasteData);
                                }
                            }}
                            placeholder="Paste your M-Pesa SMS message here..."
                            disabled={isLoading}
                            inputMode="text"
                            autoCapitalize="none"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            aria-label="M-Pesa SMS message text"
                        />
                        <button
                            type="button"
                            onClick={handlePasteFromClipboard}
                            className="absolute top-2 right-2 p-1.5 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Paste from clipboard"
                            disabled={isLoading}
                        >
                            <Clipboard className="h-4 w-4 text-gray-300" />
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
                        disabled={isLoading || !smsText.trim()}
                    >
                        {isLoading ? 'Processing...' : 'Process SMS'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadForm; 