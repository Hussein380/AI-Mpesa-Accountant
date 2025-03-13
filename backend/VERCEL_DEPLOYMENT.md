# Deploying AI-Pesa Backend to Vercel

This guide provides step-by-step instructions for deploying the AI-Pesa backend to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. [Vercel CLI](https://vercel.com/cli) installed (optional, but recommended)
3. A MongoDB Atlas account (for cloud database)

## Setup MongoDB Atlas

1. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account if you don't have one
2. Create a new cluster
3. Set up a database user with read/write permissions
4. Configure network access (IP whitelist) to allow connections from anywhere (0.0.0.0/0)
5. Get your connection string from the "Connect" button in the Atlas dashboard

## Prepare Your Backend for Deployment

The following files have already been modified for Vercel deployment:

1. `vercel.json` - Configuration for Vercel deployment
2. `src/index.js` - Modified to export the Express app for serverless functions
3. `src/middleware/upload.middleware.js` - Modified to use memory storage in production
4. `src/controllers/statement.controller.js` - Modified to handle file uploads in memory

## Deploy to Vercel

### Option 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI if you haven't already:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Navigate to the backend directory:
   ```
   cd backend
   ```

4. Deploy to Vercel:
   ```
   vercel
   ```

5. Follow the prompts to configure your project:
   - Set up and deploy "Y"
   - Which scope (select your account)
   - Link to existing project? "N"
   - What's your project's name? "ai-pesa-backend" (or any name you prefer)
   - In which directory is your code located? "./" (current directory)
   - Want to override the settings? "Y"
   - Which settings would you like to override?
     - Environment Variables: "Y" (add all variables from .env.example)

### Option 2: Using Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Log in to the [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "New Project"

4. Import your Git repository

5. Configure your project:
   - Framework Preset: "Other"
   - Root Directory: "./backend" (if your backend is in a subdirectory of your repo)
   - Build Command: Leave empty
   - Output Directory: Leave empty
   - Install Command: "npm install"

6. Add Environment Variables:
   - Click "Environment Variables" and add all variables from `.env.example`
   - Make sure to set the correct values, especially:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string
     - `NODE_ENV`: "production"

7. Click "Deploy"

## Update Frontend Configuration

After deploying your backend, update your frontend to use the new backend URL:

1. In your frontend project, update the API URL to point to your Vercel-deployed backend:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
   ```

2. Redeploy your frontend if necessary

## Verify Deployment

1. Visit your backend URL to check if it's running:
   ```
   https://your-backend-url.vercel.app/api/health
   ```

2. You should see a JSON response with status "ok"

## Troubleshooting

1. **CORS Issues**: Make sure your backend CORS configuration includes your frontend URL
   - The `cors` middleware in `src/index.js` should include your frontend URL

2. **MongoDB Connection Issues**: Verify your MongoDB Atlas connection string
   - Check if the username, password, and cluster name are correct
   - Make sure your IP is whitelisted in MongoDB Atlas

3. **File Upload Issues**: Remember that Vercel doesn't support persistent file storage
   - For production, consider using a cloud storage service like AWS S3 or Firebase Storage

4. **Environment Variables**: Make sure all required environment variables are set in Vercel
   - You can check and update them in the Vercel dashboard under your project settings

5. **Logs**: Check the Vercel logs for any errors
   - In the Vercel dashboard, go to your project > Deployments > select the latest deployment > Functions > select a function to view logs

## Next Steps

1. Set up a custom domain for your backend (optional)
2. Configure automatic deployments from your Git repository
3. Set up monitoring and alerts for your backend 