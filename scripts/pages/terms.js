/* Extracted from page inline <script>. */

function setLang(lang) {
    document.body.className = 'lang-' + lang;
    document.getElementById('btn-id').classList.toggle('active', lang === 'id');
    document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  }
