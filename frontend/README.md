# AI-Pesa Frontend

A modern, responsive landing page for AI-Pesa, an AI-powered M-Pesa accountant that helps users track and manage their transactions via WhatsApp.

## Features

- Modern, responsive design with animations
- Dark mode support
- Interactive components
- WhatsApp integration

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion for animations

## Development

To run the development server:

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Deployment to Vercel

### Deploying via the Vercel Web Interface

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your repository
5. Configure your project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install --legacy-peer-deps`
6. Click "Deploy"

## Project Structure

```
frontend/
├── app/         # Next.js app router files
├── components/  # React components
│   └── ui/      # UI components
├── data/        # Data files (FAQs, etc.)
├── lib/         # Utility functions
├── public/      # Static assets
``` 