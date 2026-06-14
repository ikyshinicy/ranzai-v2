# RanzAI Restructure Report

Yang sudah dilakukan:

1. Struktur halaman dipindah ke `pages/`.
2. Script global dipindah ke `scripts/core/`.
3. Script halaman inline diekstrak ke `scripts/pages/`.
4. Tool dipindah dari folder lama `tool/*-ranzai/` ke `tools/<nama>/`.
5. Account tool script dipindah ke `scripts/account/`.
6. Asset dirapikan: `assets/icon` → `assets/icons`, `assets/font` → `assets/fonts`.
7. CSS global dipecah menjadi base, components, pages, tools, fixes, archive.
8. Route publik diperbarui lewat `vercel.json` agar URL tetap profesional.
9. Backend Supabase tidak diubah.
10. Logic tool utama tidak ditulis ulang, hanya path dan lokasi file yang disesuaikan.

Yang perlu dites manual setelah upload ke repo baru:

- Landing page `/`
- Login `/login`
- Register `/register`
- Dashboard `/dashboard`
- Hash route tools: `/dashboard#design`, `/dashboard#write`, `/dashboard#gel`, `/dashboard#cut`, `/dashboard#convert`, `/dashboard#doc`, `/dashboard#vector`
- Payment/topup
- Contact review
- Supabase Edge Functions

Catatan: karena ini static restructure, `vercel.json` penting. Jangan hapus.
