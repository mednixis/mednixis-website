# Mednixis Website — Launch Guide

A complete, launch-ready static website. No build tools, no database, no framework — upload and go.

## What's inside

```
index.html                    Homepage
about.html                    About Mednixis
services.html                 Services overview
healthcare-management.html    Service division 1
branding-marketing.html       Service division 2
research-strategy.html        Service division 3
growth-digital-systems.html   Service division 4
packages.html                 Core / Elevate / Signature / Partner
strategic-projects.html       Strategic Projects
insights.html                 Insights (10 article cards, "Coming Soon")
contact.html                  Contact + consultation request form
privacy.html                  Privacy policy
favicon.svg                   Connected-N favicon
css/style.css                 All styling
js/main.js                    Navigation, scroll reveals
```

## How to launch (after buying the domain)

1. **Choose hosting.** Any of these work and connect to your domain:
   - Netlify or Vercel (free tier, easiest): drag-and-drop this folder, then add your custom domain in their dashboard.
   - Cloudflare Pages (free): upload the folder, attach the domain.
   - Traditional cPanel hosting: upload all files into `public_html` via File Manager or FTP.
2. **Point the domain.** In your domain registrar, set the DNS records your host gives you (usually an A record or CNAME).
3. **Enable HTTPS.** Netlify/Vercel/Cloudflare do this automatically; cPanel hosts usually offer free Let's Encrypt SSL in the dashboard.

## Contact form — one required step

The form on contact.html sends submissions to **Mednixis@gmail.com** via FormSubmit (free, no signup):

1. After the site is live, submit the form once yourself.
2. FormSubmit emails Mednixis@gmail.com a one-time activation link — click it.
3. All future submissions arrive in the inbox as formatted tables, with spam captcha enabled.

If you later prefer Formspree, Web3Forms, or your own backend, only the `<form action="...">` line needs to change.

## Easy edits

- **Email / phone / Instagram**: appear in contact.html and in the footer of every page. Search for `Mednixis@gmail.com` and `+20 111 999 5307` to update everywhere. (Recommended once the domain is live: create hello@mednixis.com and swap it in — a domain email reinforces the premium positioning.)
- **Colors / fonts**: all design tokens live at the top of `css/style.css`.
- **Insights articles**: each card in insights.html is a self-contained `<article>` block — when an article is written, wrap the card in a link to its page and change "Coming Soon" to "Read Article".

## Built-in by design

- Fully responsive (desktop → mobile), mobile menu included
- SEO meta titles + descriptions on every page
- Subtle scroll-reveal motion that respects "reduced motion" accessibility settings
- No public pricing, no "paid ads" wording, and the GCC project worded exactly as specified
