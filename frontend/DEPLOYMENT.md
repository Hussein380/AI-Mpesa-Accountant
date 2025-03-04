# Deployment Guide for AI-Pesa Landing Page

This guide provides detailed instructions for deploying the AI-Pesa landing page to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Prepare Your Project

Make sure your project is ready for deployment:

- All dependencies are listed in `package.json`
- The project builds successfully locally (`npm run build`)
- The `vercel.json` configuration file is present in the root directory

### 2. Deploy via Vercel Web Interface

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project" on your dashboard
3. Import your Git repository
   - Connect to GitHub, GitLab, or Bitbucket if you haven't already
   - Select the repository containing your AI-Pesa project
4. Configure your project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install --legacy-peer-deps`
5. Under "Environment Variables", you don't need to add any for this project
6. Click "Deploy"

### 3. Deployment Process

Vercel will now:
1. Clone your repository
2. Install dependencies using `npm install --legacy-peer-deps`
3. Build your project using `npm run build`
4. Deploy the result to their global CDN

### 4. After Deployment

Once deployment is complete:

1. Vercel will provide you with a URL (e.g., `ai-pesa.vercel.app`)
2. Test the deployed site thoroughly
3. You can add a custom domain in the Vercel project settings if needed

### 5. Continuous Deployment

By default, Vercel sets up continuous deployment:

- Any push to your main branch will trigger a new deployment
- You can configure preview deployments for pull requests
- You can set up branch deployments in the project settings

## Troubleshooting

If you encounter issues during deployment:

1. **Build Failures**: Check the build logs in Vercel for specific errors
2. **Dependency Issues**: Make sure you're using `--legacy-peer-deps` in the install command
3. **Import Errors**: Ensure all imports use the correct paths (e.g., `@/frontend/components/...`)
4. **Static Assets**: Make sure all static assets are in the `public` directory

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Custom Domain Setup](https://vercel.com/docs/concepts/projects/domains) 