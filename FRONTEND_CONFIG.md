# Updating Frontend Configuration for Vercel Deployment

This guide provides instructions for updating your frontend configuration to use the Vercel-deployed backend.

## Update Environment Variables

After deploying your backend to Vercel, you need to update your frontend to use the new backend URL.

### For Local Development

1. Update your `.env.local` file in the frontend directory:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
   ```

2. Restart your development server:
   ```
   npm run dev
   ```

### For Production Deployment

1. In the Vercel dashboard, go to your frontend project

2. Click on "Settings" > "Environment Variables"

3. Add or update the `NEXT_PUBLIC_API_URL` variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
   ```

4. Click "Save"

5. Redeploy your frontend by clicking "Deployments" > "..." > "Redeploy"

## Update CORS Configuration in Backend

Make sure your backend allows requests from your frontend domain:

1. In your backend's `src/index.js` file, the CORS configuration should include your frontend URL:
   ```javascript
   app.use(cors({
     origin: ['https://ai-mpesa-accountant.vercel.app', 'http://localhost:3000'],
     credentials: true
   }));
   ```

2. If you need to update this, redeploy your backend

## Verify the Connection

1. Open your frontend application in the browser

2. Try to log in or register a new user

3. Check the browser's developer tools (F12) > Network tab to see if the API requests are successful

4. If you encounter any issues, check the following:
   - CORS errors in the browser console
   - Network requests failing in the Network tab
   - Backend logs in the Vercel dashboard

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. Verify that your backend's CORS configuration includes your frontend URL
2. Make sure you're using the correct protocol (https://)
3. Check for any typos in the domain name

### Authentication Issues

If login or registration doesn't work:

1. Check that the JWT secret is properly set in your backend environment variables
2. Verify that the token is being stored correctly in localStorage
3. Make sure the token is being sent in the Authorization header for authenticated requests

### API Connection Issues

If API requests are failing:

1. Verify that the `NEXT_PUBLIC_API_URL` is set correctly
2. Check that your backend is running (visit the health check endpoint)
3. Look for any network errors in the browser's developer tools

## Next Steps

1. Set up a custom domain for your frontend (if not already done)
2. Configure automatic deployments from your Git repository
3. Set up monitoring and analytics for your frontend 