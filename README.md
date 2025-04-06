# Olgish Cakes

A professional website for Olgish Cakes, featuring authentic Ukrainian cakes made in Leeds by Olga Ieromenko.

## Features

- Modern, responsive design using Material UI
- Dynamic content management with Sanity.io
- Server-side rendering with Next.js 14
- TypeScript for type safety
- Beautiful typography with Playfair Display font
- Optimized images and animations

## Tech Stack

- Next.js 14
- TypeScript
- Material UI
- Sanity.io
- Framer Motion

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your Sanity credentials:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=your_token
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

The site is deployed on Vercel. Each push to the main branch triggers an automatic deployment.
