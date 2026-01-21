# wilinski.me

Personal portfolio website for Jonas Wilinski - Researcher, Developer & Founder.

## Tech Stack

- **Framework:** [Astro 5](https://astro.build/) (Static Site Generation)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Internationalization:** English & German (prefix-based routing)
- **Math Rendering:** KaTeX via remark-math & rehype-katex
- **Deployment:** Docker + nginx (optimized for Coolify)

## Project Structure

```
/
├── public/
│   ├── assets/img/       # Images and logos
│   └── assets/pdf/       # Publication PDFs
├── src/
│   ├── components/       # Astro components
│   │   ├── layout/       # Navigation, Menu
│   │   ├── sections/     # Hero, CTA, Featured
│   │   └── ui/           # Badge, Button, ImageLabel
│   ├── content/
│   │   ├── blog/en/      # English blog posts
│   │   └── publications/ # Research publications
│   ├── i18n/             # Translations (en.json, de.json)
│   ├── layouts/          # Page layouts
│   └── pages/
│       └── [lang]/       # Localized pages (en/de)
├── Dockerfile            # Production build config
└── package.json
```

## Development

```bash
# Install dependencies
npm install

# Start dev server (localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The project includes a Dockerfile for containerized deployment:

```bash
# Build Docker image
docker build -t wilinski-me .

# Run container
docker run -p 80:80 wilinski-me
```

For Coolify: Connect your GitHub repository and Coolify will auto-detect the Dockerfile.

## Pages

- `/` - Redirects to `/en/`
- `/en/` or `/de/` - Homepage
- `/en/blog/` or `/de/blog/` - Blog listing
- `/en/publications/` - Research publications
- `/en/cv/` - Professional experience
- `/en/contact/` - Contact information
- `/en/impressum/` - Legal notice

## License

All rights reserved.
