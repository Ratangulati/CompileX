# CompileX Deployment Guide for Render

## Prerequisites
1. A Render account (free tier available)
2. A MongoDB Atlas account (free tier available)
3. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your MongoDB Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster or use an existing one
3. Create a database named `compilex`
4. Get your connection string (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/compilex`)

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Blueprint"
4. Connect your repository
5. Render will automatically detect the `render.yaml` file and deploy

### Option B: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your repository
4. Configure the service:
   - **Name**: `compilex` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run server:prod`
   - **Plan**: Free

## Step 3: Environment Variables

In your Render service settings, add these environment variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/compilex
VITE_BACKEND_URL=https://your-app-name.onrender.com
```

**Important**: Replace `your-app-name` with your actual Render app name.

## Step 4: Update Frontend Configuration

After deployment, update the `VITE_BACKEND_URL` environment variable in Render to match your actual app URL.

## Step 5: Test Your Deployment

1. Visit your Render app URL
2. Create a new room
3. Test real-time collaboration
4. Check the health endpoint: `https://your-app-name.onrender.com/api/health`

## Troubleshooting

### Common Issues:

1. **Build Fails**: Make sure all dependencies are in `package.json`
2. **Database Connection Issues**: Verify your MongoDB URI is correct
3. **Socket.IO Issues**: Check that CORS is properly configured
4. **Environment Variables**: Ensure all required variables are set in Render

### Health Check:
Your app should respond with `{"status":"OK","timestamp":"..."}` at `/api/health`

## Production Optimizations

1. **Database Indexing**: Add indexes to your MongoDB collections for better performance
2. **Caching**: Consider adding Redis for session management
3. **CDN**: Use a CDN for static assets
4. **Monitoring**: Set up error tracking and performance monitoring

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to your repository
2. **CORS**: Configure CORS properly for production
3. **Rate Limiting**: Consider adding rate limiting for API endpoints
4. **HTTPS**: Render provides HTTPS by default

## Scaling

- **Free Tier**: 750 hours/month, sleeps after 15 minutes of inactivity
- **Paid Plans**: Always-on instances, custom domains, more resources
- **Database**: MongoDB Atlas free tier supports up to 512MB storage

## Support

If you encounter issues:
1. Check Render logs in the dashboard
2. Verify environment variables
3. Test locally with production environment variables
4. Check MongoDB Atlas connection logs
