# Portfolio Website — Basic Wire-Up

A single-page (or near-single-page) static site. No backend needed. Keep the stack boring so the content does the talking.

## 1. Pick your build approach

**Option A — Your own web-components framework (recommended)**
The portfolio itself becomes a live demo of your framework. Mention this on the site — it's a strong signal for both recruiters and clients.

**Option B — Nuxt (static generation)**
Use `nuxi generate` for a fully static output. Good if you want file-based routing for `/`, `/projects`, `/contact` later.

**Option C — Plain HTML + CSS**
One `index.html`, one `styles.css`, zero build step. Fastest to ship. You can always migrate later.

> Rule of thumb: ship Option C or A this week, don't over-engineer.

## 2. Project structure (Option A/C)

```
portfolio/
├── index.html
├── styles.css
├── main.js              # component registration / small interactions
├── assets/
│   ├── ayush.jpg        # professional-ish photo (optional)
│   ├── resume.pdf       # downloadable CV
│   └── og-image.png     # 1200x630 social preview
└── favicon.svg
```

## 3. Essential head tags

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Ayush — Backend Engineer (Java · Kotlin · AWS)</title>
<meta name="description" content="Backend engineer with 4 years of experience. Spring Boot, Kotlin, AWS, AI agents. Available for freelance work." />

<!-- Social preview -->
<meta property="og:title" content="Ayush — Backend Engineer" />
<meta property="og:description" content="Spring Boot · Kotlin · AWS · AI agents. Open to roles and freelance projects." />
<meta property="og:image" content="https://yourdomain.com/assets/og-image.png" />
```

## 4. Hosting (you already know AWS — use it)

**S3 + CloudFront (recommended for you)**
1. Create an S3 bucket, enable static website hosting (or keep it private and serve via CloudFront OAC — cleaner).
2. Upload the build output (`aws s3 sync ./dist s3://your-bucket --delete`).
3. Put CloudFront in front for HTTPS + caching.
4. Point your domain via Route 53 (or your registrar's DNS) with an ACM certificate in `us-east-1`.

The fact that you self-host on AWS is itself portfolio material — add one line about it in the footer: *"This site is served from S3 + CloudFront, deployed via CI."*

**Alternatives:** GitHub Pages / Cloudflare Pages if you want zero AWS cost and instant deploys.

## 5. Deploy pipeline (optional but 30 minutes well spent)

GitHub Actions on push to `main`:

```yaml
name: deploy
on: { push: { branches: [main] } }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # - run: npm ci && npm run generate   # if using Nuxt
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::<account>:role/portfolio-deploy
          aws-region: ap-south-1
      - run: aws s3 sync ./dist s3://your-bucket --delete
      - run: aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

Use an IAM role with least privilege (S3 write on that bucket + CloudFront invalidation only) — again, worth a footnote on the site.

## 6. Domain

- `ayush.dev`, `ayushbuilds.com`, or firstname-lastname — short and spellable.
- Set up a professional email on the same domain (e.g., via a free forwarding service or SES) — matters a lot for freelance credibility.

## 7. Checklist before you share the link

- [ ] Loads in under 2s on mobile (it's static, so this should be trivial)
- [ ] Resume PDF downloads and is up to date
- [ ] Every project link works
- [ ] Contact method actually reaches you (test it)
- [ ] og-image renders correctly (paste the link in WhatsApp/LinkedIn to check)
- [ ] Looks fine at 360px width
