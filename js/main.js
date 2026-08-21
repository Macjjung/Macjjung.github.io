(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('#navdots a'));
  var progressBar = document.getElementById('progress');

  function onScroll() {
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var max = doc.scrollHeight - doc.clientHeight;
    progressBar.style.width = (max > 0 ? (scrollTop / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          dots.forEach(function (d) {
            d.classList.toggle('active', d.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.5 });
    slides.forEach(function (s) { io.observe(s); });
  }
})();
