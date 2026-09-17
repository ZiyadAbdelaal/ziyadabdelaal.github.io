document.getElementById('year').textContent = new Date().getFullYear();

// theme: init from saved choice, else system preference
var root = document.documentElement;
var themeBtn = document.getElementById('themeToggle');
var iconSun = document.getElementById('iconSun');
var iconMoon = document.getElementById('iconMoon');
function applyTheme(t){
  root.setAttribute('data-theme', t);
  iconSun.style.display = t === 'light' ? 'inline-block' : 'none';
  iconMoon.style.display = t === 'light' ? 'none' : 'inline-block';
}
(function initTheme(){
  var saved = null;
  try{ saved = localStorage.getItem('theme'); }catch(e){}
  if(saved === 'light' || saved === 'dark'){ applyTheme(saved); return; }
  var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(prefersLight ? 'light' : 'dark');
})();
themeBtn.addEventListener('click', function(){
  var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  applyTheme(next);
  try{ localStorage.setItem('theme', next); }catch(e){}
});

// mobile nav toggle
var toggle = document.getElementById('navToggle');
var links = document.getElementById('navLinks');
toggle.addEventListener('click', function(){
  var open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
links.querySelectorAll('a').forEach(function(a){
  a.addEventListener('click', function(){ links.classList.remove('open'); });
});

// scroll progress bar
var progress = document.getElementById('progress');
window.addEventListener('scroll', function(){
  var h = document.documentElement;
  var pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progress.style.width = pct + '%';
});

// nav active state — file-based for separate pages, anchor-based for same-page sections
var navA = document.querySelectorAll('.navlinks a');
var currentFile = location.pathname.split('/').pop() || 'index.html';
navA.forEach(function(a){
  var href = a.getAttribute('href');
  if(href.indexOf('#') !== 0){
    var hrefFile = href.split('#')[0] || 'index.html';
    if(hrefFile === currentFile) a.classList.add('active');
  }
});

var sections = document.querySelectorAll('main section, header.hero');
var obs = new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){
      var id = '#' + e.target.id;
      navA.forEach(function(a){
        if(a.getAttribute('href').indexOf('#') === 0){
          a.classList.toggle('active', a.getAttribute('href') === id);
        }
      });
    }
  });
}, {rootMargin:'-40% 0px -50% 0px'});
sections.forEach(function(s){ if(s.id) obs.observe(s); });

// animated stat counters
var counters = document.querySelectorAll('.stat .num');
var counted = false;
var countObs = new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting && !counted){
      counted = true;
      counters.forEach(function(el){
        var target = parseInt(el.getAttribute('data-count'), 10);
        var start = 0;
        var duration = 900;
        var startTime = null;
        function step(ts){
          if(!startTime) startTime = ts;
          var progressT = Math.min((ts - startTime) / duration, 1);
          el.textContent = Math.floor(progressT * (target - start) + start);
          if(progressT < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
      });
    }
  });
}, {threshold:0.4});
if(counters.length) countObs.observe(counters[0].closest('.stats'));

// experience tabs
var expTabs = document.querySelectorAll('.exp-tab');
expTabs.forEach(function(tab){
  tab.addEventListener('click', function(){
    expTabs.forEach(function(t){ t.classList.remove('active'); });
    tab.classList.add('active');
    document.querySelectorAll('.exp-panel').forEach(function(p){ p.classList.remove('active'); });
    document.getElementById('panel-' + tab.getAttribute('data-panel')).classList.add('active');
  });
});

// research/projects filter
var filterBtns = document.querySelectorAll('.filter-btn');
var cards = document.querySelectorAll('#research .research-card');
filterBtns.forEach(function(btn){
  btn.addEventListener('click', function(){
    filterBtns.forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    var f = btn.getAttribute('data-filter');
    cards.forEach(function(c){
      c.classList.toggle('hidden', f !== 'all' && c.getAttribute('data-cat') !== f);
    });
  });
});

// back-to-top floating button
(function(){
  var btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>';
  document.body.appendChild(btn);
  window.addEventListener('scroll', function(){
    btn.classList.toggle('visible', window.scrollY > 500);
  });
  btn.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// toast + copy-to-clipboard
(function(){
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  var toastTimer;
  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toast.classList.remove('visible'); }, 1800);
  }
  document.querySelectorAll('.copy-btn[data-copy]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      var text = btn.getAttribute('data-copy');
      function done(ok){ showToast(ok ? 'Copied to clipboard!' : "Couldn't copy — copy it manually."); }
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){ done(true); }, function(){ done(false); });
      } else {
        try{
          var ta = document.createElement('textarea');
          ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          done(true);
        }catch(e){ done(false); }
      }
    });
  });
  document.querySelectorAll('.copy-bibtex[data-bibtex]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      var text = btn.getAttribute('data-bibtex');
      function done(ok){ showToast(ok ? 'BibTeX copied!' : "Couldn't copy — copy it manually."); }
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){ done(true); }, function(){ done(false); });
      } else {
        try{
          var ta = document.createElement('textarea');
          ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          done(true);
        }catch(e){ done(false); }
      }
    });
  });
})();

// publications: live search + author filter
(function(){
  var pubs = document.querySelectorAll('#publications .pub');
  if(!pubs.length) return;
  var searchInput = document.getElementById('pubSearch');
  var shownEl = document.getElementById('pubShown');
  var emptyEl = document.getElementById('pubEmpty');
  var pubFilterBtns = document.querySelectorAll('#pubFilters .filter-btn');
  var activeFilter = 'all';

  function apply(){
    var q = (searchInput ? searchInput.value : '').trim().toLowerCase();
    var shown = 0;
    pubs.forEach(function(p){
      var matchesFilter = activeFilter === 'all' || p.getAttribute('data-author') === activeFilter;
      var matchesSearch = !q || (p.getAttribute('data-search') || '').indexOf(q) !== -1;
      var visible = matchesFilter && matchesSearch;
      p.classList.toggle('hidden', !visible);
      if(visible) shown++;
    });
    if(shownEl) shownEl.textContent = shown;
    if(emptyEl) emptyEl.style.display = shown === 0 ? 'block' : 'none';
  }

  if(searchInput) searchInput.addEventListener('input', apply);
  pubFilterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      pubFilterBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      apply();
    });
  });
})();

// contact form -> mailto (static site, no backend)
var cf = document.getElementById('contactForm');
if(cf){
  cf.addEventListener('submit', function(e){
    e.preventDefault();
    var name = cf.name.value.trim();
    var email = cf.email.value.trim();
    var affiliation = cf.affiliation.value.trim();
    var purpose = cf.purpose.value;
    var message = cf.message.value.trim();
    var subject = encodeURIComponent('[' + (purpose || 'Inquiry') + '] Message from ' + name);
    var bodyLines = [
      'Name: ' + name,
      'Email: ' + email,
      affiliation ? 'Affiliation: ' + affiliation : null,
      'Purpose: ' + purpose,
      '',
      message
    ].filter(Boolean);
    var body = encodeURIComponent(bodyLines.join('\n'));
    window.location.href = 'mailto:ziyadabdelaal1@gmail.com?subject=' + subject + '&body=' + body;
  });
}

// awards/competitions/volunteering carousels
document.querySelectorAll('.carousel-wrap').forEach(function(wrap){
  var track = wrap.querySelector('.carousel-track');
  var prev = wrap.querySelector('.carousel-nav.prev');
  var next = wrap.querySelector('.carousel-nav.next');
  if(!track) return;
  function scrollByCard(dir){
    var card = track.querySelector('.carousel-card');
    var step = card ? card.getBoundingClientRect().width + 16 : 280;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  }
  if(prev) prev.addEventListener('click', function(){ scrollByCard(-1); });
  if(next) next.addEventListener('click', function(){ scrollByCard(1); });

  // click-and-drag to scroll (grab cursor)
  var isDown = false, moved = false, startX = 0, startScroll = 0;
  track.addEventListener('mousedown', function(e){
    isDown = true; moved = false;
    track.classList.add('dragging');
    startX = e.pageX;
    startScroll = track.scrollLeft;
  });
  window.addEventListener('mousemove', function(e){
    if(!isDown) return;
    var dx = e.pageX - startX;
    if(Math.abs(dx) > 4) moved = true;
    track.scrollLeft = startScroll - dx;
  });
  window.addEventListener('mouseup', function(){
    if(!isDown) return;
    isDown = false;
    track.classList.remove('dragging');
  });
  track.addEventListener('mouseleave', function(){
    if(isDown){ isDown = false; track.classList.remove('dragging'); }
  });
  // suppress accidental clicks on cards right after a drag
  track.addEventListener('click', function(e){
    if(moved){ e.preventDefault(); e.stopPropagation(); moved = false; }
  }, true);
});

// staggered reveal for carousel cards as each row scrolls into view
document.querySelectorAll('.carousel-track').forEach(function(track){
  var cards = track.querySelectorAll('.carousel-card');
  var revealed = false;
  var revealObs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting && !revealed){
        revealed = true;
        cards.forEach(function(card, i){
          setTimeout(function(){ card.classList.add('in-view'); }, i * 70);
        });
      }
    });
  }, {threshold:0.2});
  revealObs.observe(track);
});
