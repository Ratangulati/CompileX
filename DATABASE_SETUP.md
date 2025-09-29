# MongoDB Database Setup for CompileX

This document explains how to set up MongoDB for the CompileX application.

## Prerequisites

1. **MongoDB Installation**
   - Install MongoDB locally or use MongoDB Atlas (cloud)
   - For local installation: https://docs.mongodb.com/manual/installation/

2. **Node.js Dependencies**
   - The required packages are already installed: `mongoose` and `dotenv`

## Setup Instructions

### Option 1: Local MongoDB

1. **Install MongoDB locally**
   ```bash
   # On macOS with Homebrew
   brew install mongodb-community
   
   # On Ubuntu/Debian
   sudo apt-get install mongodb
   
   # On Windows
   # Download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB service**
   ```bash
   # On macOS
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   # MongoDB should start automatically after installation
   ```

3. **Create environment file**
   ```bash
   # Create .env file in the project root
   echo "MONGODB_URI=mongodb://localhost:27017/compilex" > .env
   echo "PORT=3000" >> .env
   echo "NODE_ENV=development" >> .env
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Create MongoDB Atlas account**
   - Go to https://www.mongodb.com/atlas
   - Create a free account

2. **Create a cluster**
   - Create a new cluster (free tier available)
   - Choose your region

3. **Get connection string**
   - Go to "Connect" → "Connect your application"
   - Copy the connection string

4. **Create environment file**
   ```bash
   # Create .env file in the project root
   echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/compilex" > .env
   echo "PORT=3000" >> .env
   echo "NODE_ENV=development" >> .env
   ```
   Replace `username`, `password`, and `cluster` with your actual values.

## Database Schema

### Room Model
- **roomId**: Unique identifier for each room
- **members**: Array of users in the room
- **files**: Array of open files in the editor
- **folders**: Array of folders in the explorer
- **explorerFiles**: Array of all files in the file system
- **expandedFolders**: Array of expanded folder IDs
- **activeFile**: Index of currently active file
- **currentLanguage**: Currently selected programming language
- **currentCode**: Current code content
- **outputDetails**: Compilation output details

### File Schema
- **id**: Unique file identifier
- **name**: File name
- **content**: File content
- **language**: Programming language object
- **isWelcome**: Boolean for welcome page
- **folderId**: Parent folder ID (null for root files)

### Folder Schema
- **id**: Unique folder identifier
- **name**: Folder name
- **files**: Array of files in this folder
- **parentFolderId**: Parent folder ID for nested folders

### Member Schema
- **username**: User's username
- **socketId**: Socket.io connection ID
- **joinedAt**: When user joined
- **lastActive**: Last activity timestamp

## Running the Application

1. **Start MongoDB** (if using local installation)
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

2. **Start the application**
   ```bash
   npm run server:dev
   ```

3. **Verify database connection**
   - Check console for "✅ MongoDB connected successfully"
   - If you see connection errors, verify your MONGODB_URI in .env

## Features Enabled by Database

1. **Persistent Rooms**: Room data persists across server restarts
2. **Shared State**: All users in a room see the same files and folders
3. **Real-time Collaboration**: Changes are synchronized across all users
4. **Member Management**: Track who's in each room
5. **File System**: Complete file and folder management
6. **Language Persistence**: Each file remembers its programming language

## Troubleshooting

### Connection Issues
- Verify MongoDB is running: `mongosh` (should connect)
- Check MONGODB_URI in .env file
- Ensure firewall allows MongoDB connections

### Permission Issues
- Make sure MongoDB user has read/write permissions
- For Atlas, check network access settings

### Data Issues
- Database is created automatically when first room is created
- Collections are created automatically
- No manual database setup required

## Environment Variables

```bash
# Required
MONGODB_URI=mongodb://localhost:27017/compilex

# Optional
PORT=3000
NODE_ENV=development
```

## Production Considerations

1. **Use MongoDB Atlas** for production
2. **Set up proper authentication**
3. **Configure network security**
4. **Set up database backups**
5. **Monitor database performance**

## Development vs Production

- **Development**: Use local MongoDB or Atlas free tier
- **Production**: Use MongoDB Atlas with proper security and scaling
- **Environment**: Set NODE_ENV=production in production

