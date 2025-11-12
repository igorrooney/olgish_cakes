# Olgish Cakes

A professional website for Olgish Cakes, featuring authentic Ukrainian cakes made in Leeds by Olga Ieromenko.

## Features

- Modern, responsive design using Material UI
- Dynamic content management with Sanity.io
- Server-side rendering with Next.js 14
- TypeScript for type safety
- Beautiful typography with Playfair Display font
- Optimized images and animations
- **Advanced SEO with structured data (Schema.org)**
- **Automated schema validation**
- **Performance monitoring and optimization**

## Tech Stack

- Next.js 14
- TypeScript
- Material UI
- Sanity.io
- Framer Motion
- Schema.org structured data

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env.local` file with required credentials:
   ```
   # Sanity CMS
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=your_token
   
   # Email (Required for contact/order forms)
   RESEND_API_KEY=your_resend_api_key
   NEXTAUTH_URL=http://localhost:3000
   CONTACT_EMAIL_TO=hello@olgishcakes.co.uk
   ```
   
   See [Email Setup Guide](docs/EMAIL_SETUP_GUIDE.md) for detailed email configuration.
4. Run the development server:
   ```bash
   pnpm run dev
   ```

## Quality Assurance

![Tests](https://github.com/igorrooney/olgish_cakes/actions/workflows/test.yml/badge.svg)

### Unit Testing
Run automated tests with coverage:
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm run test:coverage
```

### Schema Validation
Validate all structured data before deployment:
```bash
# Quick validation with mock data (fast, no Sanity required)
pnpm run validate:schemas

# Full validation with real Sanity data
pnpm run validate:schemas:real
```

This checks:
- Product schema compliance
- MPN uniqueness
- Required field presence
- Google Merchant Center requirements

### Performance Monitoring
In development mode, the console displays:
- Query timing information
- Schema generation performance
- Cache hit/miss rates
- Performance threshold warnings

## Deployment

The site is deployed on Vercel. Each push to the main branch triggers an automatic deployment.

### Pre-Deployment Checklist:
1. Run `pnpm run build` - Ensure no build errors
2. Run `pnpm run validate:schemas` - Validate structured data
3. Check performance logs in dev mode
4. Review linter output

## Documentation

- **[Structured Data Guide](docs/STRUCTURED_DATA_IMPROVEMENTS.md)** - Schema implementation
- **[Validation Guide](docs/SCHEMA_VALIDATION_GUIDE.md)** - How to validate schemas
- **[Email Setup Guide](docs/EMAIL_SETUP_GUIDE.md)** - Configure email notifications for orders and contact forms
- **[Improvements Summary](IMPROVEMENTS_SUMMARY.md)** - Recent enhancements
