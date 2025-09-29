// In-memory storage fallback when MongoDB is not available
class InMemoryStorage {
    constructor() {
        this.rooms = new Map();
        this.isConnected = false;
    }

    // Mock Room.findOrCreate method
    async findOrCreate(roomId) {
        if (!this.rooms.has(roomId)) {
            const room = {
                roomId,
                members: [],
                files: [{
                    id: Date.now(),
                    name: 'Welcome',
                    content: 'Welcome to CodeEditor Pro!\n\nTo get started:\n1. Create a new file using the + button in the explorer\n2. Select your programming language\n3. Start coding!\n\nThis welcome page will be automatically removed when you create your first file.',
                    language: { value: 'javascript', label: 'JavaScript', name: 'JavaScript' },
                    isWelcome: true
                }],
                folders: [{
                    id: Date.now(),
                    name: 'My Project',
                    files: []
                }],
                explorerFiles: [],
                expandedFolders: [],
                activeFile: 0,
                currentLanguage: { value: 'javascript', label: 'JavaScript', name: 'JavaScript' },
                currentCode: '',
                outputDetails: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            this.rooms.set(roomId, room);
        }
        return this.rooms.get(roomId);
    }

    // Mock Room.findOne method
    async findOne({ roomId }) {
        return this.rooms.get(roomId) || null;
    }

    // Mock Room methods
    async save() {
        // In-memory, no persistence needed
        return this;
    }

    async addMember(username, socketId) {
        // Remove existing member with same username or socketId
        this.members = this.members.filter(member => 
            member.username !== username && member.socketId !== socketId
        );
        
        // Add new member
        this.members.push({
            username,
            socketId,
            joinedAt: new Date(),
            lastActive: new Date()
        });
        
        return this.save();
    }

    async removeMember(username) {
        this.members = this.members.filter(member => member.username !== username);
        return this.save();
    }

    async updateMemberSocket(username, socketId) {
        const member = this.members.find(m => m.username === username);
        if (member) {
            member.socketId = socketId;
            member.lastActive = new Date();
            return this.save();
        }
        return this.save();
    }

    async updateState(stateData) {
        if (stateData.files) this.files = stateData.files;
        if (stateData.folders) this.folders = stateData.folders;
        if (stateData.explorerFiles) this.explorerFiles = stateData.explorerFiles;
        if (stateData.expandedFolders) this.expandedFolders = stateData.expandedFolders;
        if (stateData.activeFile !== undefined) this.activeFile = stateData.activeFile;
        if (stateData.currentLanguage) this.currentLanguage = stateData.currentLanguage;
        if (stateData.currentCode !== undefined) this.currentCode = stateData.currentCode;
        if (stateData.outputDetails !== undefined) this.outputDetails = stateData.outputDetails;
        
        this.updatedAt = new Date();
        return this.save();
    }

    // Static methods
    static async findOrCreate(roomId) {
        const storage = new InMemoryStorage();
        return await storage.findOrCreate(roomId);
    }

    static async findOne({ roomId }) {
        const storage = new InMemoryStorage();
        return await storage.findOne({ roomId });
    }
}

// Create a singleton instance
const inMemoryStorage = new InMemoryStorage();

// Mock mongoose connection
const mockConnection = {
    readyState: 1, // Connected state
    on: () => {},
    close: () => Promise.resolve()
};

// Export mock Room model
export const Room = InMemoryStorage;

// Export mock mongoose
export const mockMongoose = {
    connection: mockConnection,
    connect: () => Promise.resolve(mockConnection)
};

export default inMemoryStorage;

