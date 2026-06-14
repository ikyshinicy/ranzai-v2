# CSS Guide RanzAI

## Entry Point

Setiap halaman utama cukup panggil:

```html
<link rel="stylesheet" href="/styles/main.css">
```

Lalu tambah CSS khusus halaman:

```html
<link rel="stylesheet" href="/styles/pages/dashboard.css">
```

## Pembagian CSS

- `styles/base/global.css`: font, token warna, reset, body, layout helper.
- `styles/components/`: button, card, form, navbar, footer, modal, toast.
- `styles/pages/`: landing, dashboard, auth, contact, legal, topup.
- `styles/tools/`: shared tool CSS dan CSS khusus tool.
- `styles/fixes/`: patch kecil yang memang lintas halaman.
- `styles/archive/`: CSS lama yang tidak dipakai langsung, disimpan untuk referensi.

## Aturan

Jangan taruh style khusus halaman di `base/global.css`. Jangan taruh style tool di CSS halaman. Kalau ada tool baru, buat file di `tools/` dan CSS di `styles/tools/`.
