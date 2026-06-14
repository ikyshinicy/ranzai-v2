/* Extracted from page inline <script>. */

// ─── Review System ───────────────────────────────────────────────────
    const SUPABASE_URL = 'https://cavouyzyasnuygkuwizy.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhdm91eXp5YXNudXlna3V3aXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjQzMDIsImV4cCI6MjA5NDQ0MDMwMn0.P9TepO4RLhxHv03ybUlwGMefCwkdjCnDwNpfqzAS2lo';

    async function submitReview(e) {
      e.preventDefault();
      
      const form = document.getElementById('reviewForm');
      const name = document.getElementById('reviewName').value.trim();
      const email = document.getElementById('reviewEmail').value.trim();
      const rating = document.querySelector('input[name="rating"]:checked')?.value;
      const comment = document.getElementById('reviewComment').value.trim();
      
      // Clear errors
      document.querySelectorAll('.review-error').forEach(el => el.style.display = 'none');
      
      let valid = true;
      if (!name) {
        document.getElementById('nameError').textContent = 'Nama wajib diisi';
        document.getElementById('nameError').style.display = 'block';
        valid = false;
      }
      if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
        document.getElementById('emailError').textContent = 'Email tidak valid';
        document.getElementById('emailError').style.display = 'block';
        valid = false;
      }
      if (!rating) {
        document.getElementById('ratingError').textContent = 'Pilih rating terlebih dahulu';
        document.getElementById('ratingError').style.display = 'block';
        valid = false;
      }
      if (!comment || comment.length < 10) {
        document.getElementById('commentError').textContent = 'Komentar minimal 10 karakter';
        document.getElementById('commentError').style.display = 'block';
        valid = false;
      }
      
      if (!valid) return;
      
      const submitBtn = document.getElementById('submitReview');
      const msgEl = document.getElementById('submitMessage');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Mengirim...';
      msgEl.style.display = 'block';
      msgEl.style.color = 'var(--muted)';
      msgEl.textContent = 'Mengirim review...';
      
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-review`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            name,
            email,
            rating: parseInt(rating),
            comment
          })
        });
        
        if (!response.ok) throw new Error('Gagal mengirim review');
        
        msgEl.style.color = '#4ade80';
        msgEl.textContent = '✓ Review berhasil dikirim! Terima kasih telah berbagi.';
        form.reset();
        await loadReviews();
        
        setTimeout(() => {
          msgEl.style.display = 'none';
        }, 4000);
      } catch (error) {
        msgEl.style.color = '#d32f2f';
        msgEl.textContent = 'Error: ' + (error.message || 'Terjadi kesalahan');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kirim Review';
      }
    }
    
    async function loadReviews() {
      const reviewsList = document.getElementById('reviewsList');
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/reviews?order=created_at.desc`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
          }
        );
        
        if (!response.ok) throw new Error('Gagal memuat review');
        const reviews = await response.json();
        
        if (reviews.length === 0) {
          reviewsList.innerHTML = '<div style="text-align:center;color:var(--muted);padding:20px;font-size:14px">Belum ada review. Jadilah yang pertama! 🎉</div>';
          return;
        }
        
        reviewsList.innerHTML = reviews.map(review => `
          <div style="padding:16px;background:#fff;border:1px solid rgba(26,107,255,.12);border-radius:16px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px">
              <div>
                <div style="font-size:14px;font-weight:900;color:var(--ink)">${escapeHtml(review.name)}</div>
                <div style="font-size:12px;color:var(--muted);margin-top:2px">${new Date(review.created_at).toLocaleDateString('id-ID')}</div>
              </div>
              <div style="font-size:16px">${'⭐'.repeat(review.rating)}</div>
            </div>
            <div style="font-size:13px;line-height:1.6;color:var(--ink)">${escapeHtml(review.comment)}</div>
          </div>
        `).join('');
      } catch (error) {
        reviewsList.innerHTML = '<div style="text-align:center;color:#d32f2f;padding:20px;font-size:14px">Gagal memuat review</div>';
      }
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    document.getElementById('reviewForm').addEventListener('submit', submitReview);
    loadReviews();
