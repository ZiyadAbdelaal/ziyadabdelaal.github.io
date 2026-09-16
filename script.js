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
