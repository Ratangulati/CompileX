import React from 'react';
import Avatar from 'react-avatar';
import { LuUsers, LuUserPlus, LuCopy, LuShare2 } from 'react-icons/lu';

const MembersPanel = ({ clients, roomId, onCopyRoomId, onShare }) => {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <LuUsers className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Members</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onCopyRoomId}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Copy Room ID"
                    >
                        <LuCopy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                        onClick={onShare}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Share Room"
                    >
                        <LuShare2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Members List */}
            <div className="space-y-3">
                {clients.map((client, index) => (
                    <div
                        key={client.socketId}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="relative">
                            <Avatar
                                name={client.username}
                                size={40}
                                round="50px"
                                className="border-2 border-white dark:border-gray-800 shadow-sm"
                            />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                                {client.username}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {index === 0 ? 'Host' : 'Member'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Invite Section */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <LuUserPlus className="w-4 h-4" />
                    <span>Invite others to join</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                    <input
                        type="text"
                        value={`Room ID: ${roomId}`}
                        readOnly
                        className="flex-1 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400"
                    />
                    <button
                        onClick={onCopyRoomId}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                        Copy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MembersPanel;

