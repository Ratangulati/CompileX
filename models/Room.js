import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    content: { type: String, default: '' },
    language: {
        value: { type: String, required: true },
        label: { type: String, required: true },
        name: { type: String, required: true }
    },
    isWelcome: { type: Boolean, default: false },
    folderId: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const FolderSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    files: [FileSchema],
    parentFolderId: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const MemberSchema = new mongoose.Schema({
    username: { type: String, required: true },
    socketId: { type: String },
    joinedAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
});

const RoomSchema = new mongoose.Schema({
    roomId: { 
        type: String, 
        required: true, 
        unique: true,
        index: true
    },
    members: [MemberSchema],
    files: [FileSchema],
    folders: [FolderSchema],
    explorerFiles: [FileSchema],
    expandedFolders: [Number],
    activeFile: { type: Number, default: 0 },
    currentLanguage: {
        value: { type: String, default: 'javascript' },
        label: { type: String, default: 'JavaScript' },
        name: { type: String, default: 'JavaScript' }
    },
    currentCode: { type: String, default: '' },
    outputDetails: { type: mongoose.Schema.Types.Mixed, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
RoomSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Update updatedAt for files and folders
    this.files.forEach(file => {
        file.updatedAt = Date.now();
    });
    
    this.folders.forEach(folder => {
        folder.updatedAt = Date.now();
        folder.files.forEach(file => {
            file.updatedAt = Date.now();
        });
    });
    
    next();
});

// Static method to find or create a room
RoomSchema.statics.findOrCreate = async function(roomId) {
    try {
        let room = await this.findOne({ roomId });
        
        if (!room) {
            room = new this({
                roomId,
                files: [],
                folders: [],
                explorerFiles: [],
                expandedFolders: [],
                activeFile: 0,
                currentLanguage: { value: 'javascript', label: 'JavaScript', name: 'JavaScript' },
                currentCode: ''
            });
            await room.save();
        }
        
        return room;
    } catch (error) {
        // If there's a duplicate key error, try to find the existing room
        if (error.code === 11000) {
            return await this.findOne({ roomId });
        }
        throw error;
    }
};

// Method to add a member to the room
RoomSchema.methods.addMember = async function(username, socketId) {
    try {
        // First remove any existing members with same username or socketId
        await this.constructor.findOneAndUpdate(
            { roomId: this.roomId },
            { 
                $pull: { 
                    members: { 
                        $or: [
                            { username: username },
                            { socketId: socketId }
                        ]
                    } 
                } 
            }
        );
        
        // Then add the new member
        const result = await this.constructor.findOneAndUpdate(
            { roomId: this.roomId },
            { 
                $push: { 
                    members: {
                        username,
                        socketId,
                        joinedAt: new Date(),
                        lastActive: new Date()
                    }
                } 
            },
            { new: true }
        );
        
        return result;
    } catch (error) {
        console.error('Error adding member:', error);
        // Fallback to manual update
        this.members = this.members.filter(member => 
            member.username !== username && member.socketId !== socketId
        );
        this.members.push({
            username,
            socketId,
            joinedAt: new Date(),
            lastActive: new Date()
        });
        return await this.save();
    }
};

// Method to remove a member from the room
RoomSchema.methods.removeMember = async function(username) {
    try {
        // Use findOneAndUpdate to avoid version conflicts
        const result = await this.constructor.findOneAndUpdate(
            { roomId: this.roomId },
            { $pull: { members: { username: username } } },
            { new: true }
        );
        return result;
    } catch (error) {
        console.error('Error removing member:', error);
        // Fallback to manual update
        this.members = this.members.filter(member => member.username !== username);
        return await this.save();
    }
};

// Method to update member socket ID
RoomSchema.methods.updateMemberSocket = function(username, socketId) {
    const member = this.members.find(m => m.username === username);
    if (member) {
        member.socketId = socketId;
        member.lastActive = new Date();
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to update room state using atomic operations
RoomSchema.methods.updateState = async function(stateData) {
    try {
        const updateFields = {};
        
        if (stateData.files) updateFields.files = stateData.files;
        if (stateData.folders) updateFields.folders = stateData.folders;
        if (stateData.explorerFiles) updateFields.explorerFiles = stateData.explorerFiles;
        if (stateData.expandedFolders) updateFields.expandedFolders = stateData.expandedFolders;
        if (stateData.activeFile !== undefined) updateFields.activeFile = stateData.activeFile;
        if (stateData.currentLanguage) updateFields.currentLanguage = stateData.currentLanguage;
        if (stateData.currentCode !== undefined) updateFields.currentCode = stateData.currentCode;
        if (stateData.outputDetails !== undefined) updateFields.outputDetails = stateData.outputDetails;
        
        // Use findOneAndUpdate to avoid version conflicts
        const result = await this.constructor.findOneAndUpdate(
            { roomId: this.roomId },
            { $set: updateFields },
            { new: true }
        );
        
        return result;
    } catch (error) {
        console.error('Error updating room state:', error);
        // Fallback to manual update
        if (stateData.files) this.files = stateData.files;
        if (stateData.folders) this.folders = stateData.folders;
        if (stateData.explorerFiles) this.explorerFiles = stateData.explorerFiles;
        if (stateData.expandedFolders) this.expandedFolders = stateData.expandedFolders;
        if (stateData.activeFile !== undefined) this.activeFile = stateData.activeFile;
        if (stateData.currentLanguage) this.currentLanguage = stateData.currentLanguage;
        if (stateData.currentCode !== undefined) this.currentCode = stateData.currentCode;
        if (stateData.outputDetails !== undefined) this.outputDetails = stateData.outputDetails;
        
        return this.save();
    }
};

// Static method to clean up empty rooms (rooms with no members)
RoomSchema.statics.cleanupEmptyRooms = async function() {
    try {
        const result = await this.deleteMany({
            $or: [
                { members: { $size: 0 } },
                { members: { $exists: false } }
            ]
        });
        console.log(`Cleaned up ${result.deletedCount} empty rooms`);
        return result.deletedCount;
    } catch (error) {
        console.error('Error cleaning up empty rooms:', error);
        return 0;
    }
};

export default mongoose.model('Room', RoomSchema);

