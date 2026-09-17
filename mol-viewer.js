(function () {
  var el = document.getElementById('molViewer');
  if (!el) return;

  var loadingEl = document.getElementById('molLoading');
  var pdbUrl = el.getAttribute('data-pdb');

  if (typeof $3Dmol === 'undefined') {
    if (loadingEl) loadingEl.textContent = "Couldn't load the 3D viewer (offline?). Structure file: " + pdbUrl;
    return;
  }

  function bgForTheme() {
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    return light ? '#eef1ee' : '#212b34';
  }

  var viewer = $3Dmol.createViewer(el, { backgroundColor: bgForTheme() });
  var spinning = false;
  var ligandSel = { resn: 'UNL' };
  var proteinSel = { resn: 'UNL', invert: true };

  function applyStyles(styleName) {
    viewer.setStyle({}, {});
    viewer.removeAllSurfaces();
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
      viewer.resize();
      viewer.zoomTo();
      viewer.render();
      if (loadingEl) loadingEl.remove();

      window.addEventListener('resize', function () {
        viewer.resize();
        viewer.render();
      });

      var themeObserver = new MutationObserver(function () {
        viewer.setBackgroundColor(bgForTheme());
        viewer.render();
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

      // hover a residue to see its name/number/chain
      viewer.setHoverable({}, true, function (atom, v) {
        if (!atom.label) {
          atom.label = v.addLabel(
            (atom.resn || '') + ' ' + (atom.resi || '') + (atom.chain ? ' · chain ' + atom.chain : ''),
            {
              position: { x: atom.x, y: atom.y, z: atom.z },
              backgroundColor: '#12181c', backgroundOpacity: 0.85,
              fontColor: '#eef1ee', fontSize: 12, borderRadius: 4, padding: 4
            }
          );
        }
      }, function (atom, v) {
        if (atom.label) { v.removeLabel(atom.label); delete atom.label; }
      });

      var buttons = document.querySelectorAll('[data-mol-style]');
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          buttons.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
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

      var focusBtn = document.getElementById('molFocus');
      if (focusBtn) {
        focusBtn.addEventListener('click', function () {
          spinning = false;
          viewer.spin(false);
          if (spinBtn) spinBtn.classList.remove('active');
          viewer.zoomTo(ligandSel);
          viewer.zoom(1.4, 600);
          viewer.render();
        });
      }

      var snapshotBtn = document.getElementById('molSnapshot');
      if (snapshotBtn) {
        snapshotBtn.addEventListener('click', function () {
          var uri = viewer.pngURI();
          var a = document.createElement('a');
          a.href = uri;
          a.download = 'als3-4LEB-view.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
      }
    })
    .catch(function () {
      if (loadingEl) loadingEl.textContent = "Couldn't load the structure file.";
    });
})();
