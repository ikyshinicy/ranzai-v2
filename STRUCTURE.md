# RanzAI Professional Structure

Struktur ini sudah dipisahkan berdasarkan alur kerja web, bukan hanya CSS.

```txt
RanzAI-CreativeSuite-professional/
├── assets/
│   ├── fonts/
│   ├── hero/
│   └── icons/
├── pages/
│   ├── landing/
│   ├── dashboard/
│   ├── tools/
│   ├── auth/
│   ├── contact/
│   ├── legal/
│   ├── system/
│   └── redirects/
├── styles/
│   ├── main.css
│   ├── base/
│   ├── components/
│   ├── pages/
│   ├── tools/
│   ├── fixes/
│   └── archive/
├── scripts/
│   ├── core/
│   ├── pages/
│   ├── account/
│   └── ui/
├── tools/
│   ├── breakdown/
│   ├── design/
│   ├── write/
│   ├── gel/
│   ├── cut/
│   ├── convert/
│   ├── doc/
│   ├── vector/
│   └── mockup/
├── supabase/
└── vercel.json
```

## Prinsip

- `pages/` hanya untuk halaman publik dan dashboard shell.
- `tools/` hanya untuk logic tool yang dimuat dashboard.
- `scripts/core/` untuk config, router dashboard, i18n, auto logout.
- `scripts/pages/` untuk script khusus halaman.
- `styles/main.css` adalah entrypoint global.
- `styles/pages/` untuk layout khusus halaman.
- `styles/tools/` untuk style tool.
- `supabase/` tetap di root supaya Supabase CLI dan Edge Functions tidak terganggu.

## Route Publik

Route diatur oleh `vercel.json`:

- `/` → `pages/landing/index.html`
- `/dashboard` → `pages/dashboard/index.html`
- `/tools` → `pages/tools/index.html`
- `/login` → `pages/auth/login.html`
- `/register` → `pages/auth/register.html`
- `/reset-password` → `pages/auth/reset-password.html`
- `/contact` → `pages/contact/index.html`
- `/privacy` → `pages/legal/privacy.html`
- `/terms` → `pages/legal/terms.html`

## Catatan

Jangan langsung overwrite produksi. Test dulu di repo/branch baru.
