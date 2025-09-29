import React, { useState } from 'react';
import { LuRefreshCw, LuPlus } from 'react-icons/lu';

const VSOutputPanel = ({ outputDetails }) => {
    const [activeTab, setActiveTab] = useState('output');

    const tabs = [
        { id: 'output', label: 'Output' },
        { id: 'console', label: 'Console' },
        { id: 'problems', label: 'Problems' }
    ];

    const renderOutputContent = () => {
        if (!outputDetails) {
            return (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    Click "Run" to execute your code and see the output here.
                </div>
            );
        }

        if (outputDetails.status?.id === 3) {
            // Success
            const output = outputDetails.stdout ? atob(outputDetails.stdout) : '';
            return (
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Output</span>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <LuRefreshCw className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="text-gray-700 dark:text-gray-300">&gt; Running code...</div>
                        {output && (
                            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                {output}
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                            <span>Execution completed successfully</span>
                        </div>
                    </div>
                </div>
            );
        } else if (outputDetails.status?.id === 6) {
            // Compilation Error
            const error = outputDetails.compile_output ? atob(outputDetails.compile_output) : 'Compilation failed';
            return (
                <div className="p-4">
                    <div className="text-red-600 dark:text-red-400 text-sm">
                        <div className="font-semibold mb-2">Compilation Error:</div>
                        <div className="whitespace-pre-wrap">{error}</div>
                    </div>
                </div>
            );
        } else if (outputDetails.status?.id === 5) {
            // Time Limit Exceeded
            return (
                <div className="p-4">
                    <div className="text-red-600 dark:text-red-400 text-sm">
                        <div className="font-semibold">Time Limit Exceeded</div>
                        <div>Your code took too long to execute.</div>
                    </div>
                </div>
            );
        } else {
            // Runtime Error
            const error = outputDetails.stderr ? atob(outputDetails.stderr) : 'Runtime error occurred';
            return (
                <div className="p-4">
                    <div className="text-red-600 dark:text-red-400 text-sm">
                        <div className="font-semibold mb-2">Runtime Error:</div>
                        <div className="whitespace-pre-wrap">{error}</div>
                    </div>
                </div>
            );
        }
    };

    const renderConsoleContent = () => {
        return (
            <div className="p-4 text-gray-500 dark:text-gray-400 text-sm">
                Console output will appear here...
            </div>
        );
    };

    const renderProblemsContent = () => {
        return (
            <div className="p-4 text-gray-500 dark:text-gray-400 text-sm">
                No problems detected.
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'output':
                return renderOutputContent();
            case 'console':
                return renderConsoleContent();
            case 'problems':
                return renderProblemsContent();
            default:
                return renderOutputContent();
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900">
            {/* Tab Bar - directly without top icons */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab.id
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default VSOutputPanel;
