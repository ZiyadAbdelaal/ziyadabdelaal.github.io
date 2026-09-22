(function () {
  var container = document.getElementById('domainMap');
  if (!container || typeof d3 === 'undefined') return;

  var nodes = [
    { id: 'Als3', r: 30, color: 'coral', desc: 'Cell-surface adhesin of C. albicans \u2014 the central drug target across all projects.' },
    { id: 'Drug Discovery', r: 24, color: 'teal', desc: 'The overarching goal \u2014 turning computational hits into validated antifungal drug candidates.' },
    { id: 'Molecular Docking', r: 22, color: 'teal', desc: 'Structure-based screening of compound libraries (AutoDock Vina, Discovery Studio).' },
    { id: 'Biofilm', r: 18, color: 'sky', desc: 'Als3-driven C. albicans biofilm formation \u2014 the virulence mechanism these candidates aim to block.' },
    { id: 'DFT / Quantum Chemistry', r: 18, color: 'violet', desc: 'HOMO\u2013LUMO and electrostatic potential analysis (VeloxChem, ORCA).' },
    { id: 'MESP', r: 14, color: 'violet', desc: 'Molecular electrostatic potential mapping to visualize reactive sites and binding-relevant charge distribution.' },
    { id: 'Cheminformatics', r: 17, color: 'amber', desc: 'Scaffold classification and library analysis (RDKit, DataWarrior).' },
    { id: 'MD Simulation', r: 16, color: 'sky', desc: 'Molecular dynamics to confirm stable ligand\u2013protein binding.' },
    { id: 'ADMET', r: 15, color: 'violet', desc: 'Predicting drug-likeness and toxicity of top candidates.' }
  ];

  var links = [
    { source: 'Als3', target: 'Molecular Docking' },
    { source: 'Als3', target: 'Biofilm' },
    { source: 'Als3', target: 'Drug Discovery' },
    { source: 'Drug Discovery', target: 'Molecular Docking' },
    { source: 'Drug Discovery', target: 'Biofilm' },
    { source: 'Drug Discovery', target: 'ADMET' },
    { source: 'Molecular Docking', target: 'DFT / Quantum Chemistry' },
    { source: 'Molecular Docking', target: 'Cheminformatics' },
    { source: 'DFT / Quantum Chemistry', target: 'MESP' },
    { source: 'DFT / Quantum Chemistry', target: 'MD Simulation' },
    { source: 'Cheminformatics', target: 'ADMET' },
    { source: 'MD Simulation', target: 'ADMET' }
  ];

  var width = container.clientWidth || 800;
  var height = 340;

  var svg = d3.select(container).append('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('width', '100%')
    .attr('height', height)
    .style('display', 'block');

  var linkGroup = svg.append('g');
  var nodeGroup = svg.append('g');

  var tooltip = document.getElementById('domainMapTooltip');

  function colorVar(name) { return 'var(--' + name + '-ink)'; }

  var simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(function (d) { return d.id; }).distance(120).strength(0.55))
    .force('charge', d3.forceManyBody().strength(-420))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('x', d3.forceX(width / 2).strength(0.06))
    .force('y', d3.forceY(height / 2).strength(0.09))
    .force('collide', d3.forceCollide().radius(function (d) { return d.r + 14; }));

  var link = linkGroup.selectAll('line')
    .data(links)
    .join('line')
    .attr('class', 'domain-map-link');

  var node = nodeGroup.selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', 'domain-map-node')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  node.append('circle')
    .attr('r', function (d) { return d.r; })
    .attr('fill', function (d) { return colorVar(d.color); });

  node.append('text')
    .attr('class', 'domain-map-label')
    .attr('text-anchor', 'middle')
    .attr('y', function (d) { return d.r + 16; })
    .text(function (d) { return d.id; });

  node.on('mouseenter', function (event, d) {
    tooltip.textContent = d.desc;
    tooltip.classList.add('visible');
    positionTooltip(event);
  }).on('mousemove', positionTooltip)
    .on('mouseleave', function () {
      tooltip.classList.remove('visible');
    });

  function positionTooltip(event) {
    var rect = container.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    tooltip.style.left = x + 16 + 'px';
    tooltip.style.top = y + 8 + 'px';
  }

  simulation.on('tick', function () {
    link
      .attr('x1', function (d) { return d.source.x; })
      .attr('y1', function (d) { return d.source.y; })
      .attr('x2', function (d) { return d.target.x; })
      .attr('y2', function (d) { return d.target.y; });
    node.attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
  });

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.25).restart();
    d.fx = d.x; d.fy = d.y;
  }
  function dragged(event, d) {
    d.fx = event.x; d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null; d.fy = null;
  }

  var resetBtn = document.getElementById('domainMapReset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      nodes.forEach(function (n) { n.fx = null; n.fy = null; n.x = width / 2 + (Math.random() - 0.5) * 40; n.y = height / 2 + (Math.random() - 0.5) * 40; });
      simulation.alpha(1).restart();
    });
  }

  window.addEventListener('resize', function () {
    var w = container.clientWidth || width;
    svg.attr('viewBox', [0, 0, w, height]);
    simulation.force('center', d3.forceCenter(w / 2, height / 2));
  });
})();
