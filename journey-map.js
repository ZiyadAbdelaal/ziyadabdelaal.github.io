(function () {
  var stops = document.querySelectorAll('.journey-stop');
  var panels = document.querySelectorAll('.journey-info-panel');
  if (!stops.length) return;

  function select(i) {
    stops.forEach(function (s) { s.classList.toggle('active', s.getAttribute('data-stop') === String(i)); });
    panels.forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-panel') === String(i)); });
  }

  stops.forEach(function (stop) {
    var i = stop.getAttribute('data-stop');
    stop.addEventListener('click', function () { select(i); });
    stop.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i); }
    });
  });

  select('0');
})();
