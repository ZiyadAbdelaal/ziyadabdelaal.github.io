(function () {
  var el = document.getElementById('molViewer');
  if (!el) return;

  var loadingEl = document.getElementById('molLoading');
  var pdbUrl = el.getAttribute('data-pdb');

  if (typeof $3Dmol === 'undefined') {
    if (loadingEl) loadingEl.textContent = "Couldn't load the 3D viewer (offline?). Structure file: " + pdbUrl;
    return;
  }

  var viewer = $3Dmol.createViewer(el, { backgroundColor: '#0d1319' });
  var spinning = false;
  var ligandSel = { resn: 'UNL' };
  var proteinSel = { resn: 'UNL', invert: true };

  function applyStyles(styleName) {
    viewer.setStyle({}, {});
    viewer.setStyle(proteinSel, { cartoon: { color: 'spectrum' } });
    if (styleName === 'surface') {
      viewer.addSurface($3Dmol.SurfaceType.VDW, { opacity: 0.82, color: 'white' }, proteinSel);
    }
    viewer.setStyle(ligandSel, { stick: { colorscheme: 'yellowCarbon', radius: 0.18 } });
    viewer.render();
  }

  fetch(pdbUrl)
    .then(function (res) {
      if (!res.ok) throw new Error('fetch failed');
      return res.text();
    })
    .then(function (pdbText) {
      viewer.addModel(pdbText, 'pdb');
      applyStyles('cartoon');
      viewer.zoomTo();
      viewer.render();
      if (loadingEl) loadingEl.remove();

      var buttons = document.querySelectorAll('[data-mol-style]');
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          buttons.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          viewer.removeAllSurfaces();
          applyStyles(btn.getAttribute('data-mol-style'));
        });
      });

      var spinBtn = document.getElementById('molSpin');
      if (spinBtn) {
        spinBtn.addEventListener('click', function () {
          spinning = !spinning;
          viewer.spin(spinning ? 'y' : false);
          spinBtn.classList.toggle('active', spinning);
        });
      }

      var resetBtn = document.getElementById('molReset');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          viewer.zoomTo();
          viewer.render();
        });
      }
    })
    .catch(function () {
      if (loadingEl) loadingEl.textContent = "Couldn't load the structure file.";
    });
})();
