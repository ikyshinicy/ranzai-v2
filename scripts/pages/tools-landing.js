/* Extracted from page inline <script>. */

var sliderIdx = 0;
    var slides, dots;
    function sliderGo(n) {
      slides[sliderIdx].classList.remove('active');
      dots[sliderIdx].classList.remove('active');
      sliderIdx = (n + slides.length) % slides.length;
      slides[sliderIdx].classList.add('active');
      dots[sliderIdx].classList.add('active');
    }
    function sliderMove(dir) { sliderGo(sliderIdx + dir); }
    document.addEventListener('DOMContentLoaded', function() {
      slides = document.querySelectorAll('#heroSlider .slide');
      dots = document.querySelectorAll('#heroSlider .slider-dot');
      document.querySelector('.slider-prev').addEventListener('click', function(){ sliderMove(-1); });
      document.querySelector('.slider-next').addEventListener('click', function(){ sliderMove(1); });
      dots.forEach(function(dot, i){ dot.addEventListener('click', function(){ sliderGo(i); }); });
      setInterval(function(){ sliderMove(1); }, 4000);
    });
