/* Extracted from page inline <script>. */

let sec = 3;
const el = document.getElementById("countdown");
const interval = setInterval(() => {
  sec--;
  el.textContent = "Redirect otomatis dalam " + sec + " detik...";
  if(sec <= 0){
    clearInterval(interval);
    window.location.replace("/dashboard?topup=success");
  }
}, 1000);
