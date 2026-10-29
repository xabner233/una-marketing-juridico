/* Renovo Tapeçaria & Estofados — interações do site.
   O número do WhatsApp e as mensagens já estão gravados nos links do HTML
   (funcionam mesmo sem JavaScript). Para trocar o número, veja o LEIA-ME. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* Ano do rodapé */
  const ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();

  /* Menu mobile */
  const toggle = $('.menu-toggle'), menu = $('#menu');
  toggle.hidden = false;
  const setMenu = open => { menu.classList.toggle('open', open); toggle.setAttribute('aria-expanded', String(open)); document.body.classList.toggle('menu-open', open); };
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); toggle.focus(); } });

  /* Cabeçalho compacto + botão flutuante após o topo */
  const header = $('header'), hero = $('#inicio');
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle('scrolled', y > 40);
    document.body.classList.toggle('past-hero', y > hero.offsetTop + hero.offsetHeight - 200);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Item ativo no menu conforme a seção visível */
  const links = $$('nav > a[href^="#"]');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));

    /* Entrada suave dos blocos */
    if (!reduceMotion) {
      const rev = new IntersectionObserver(entries => entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); }
      }), { rootMargin: '0px 0px -8% 0px' });
      $$('.reveal').forEach(el => { el.classList.add('pre'); rev.observe(el); });
    }
  }

  /* Filtro do portfólio */
  const filters = $('.filters'), projects = $$('[data-category]'), videos = $$('.video-grid video');
  filters.hidden = false;
  const applyFilter = f => {
    $$('button', filters).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === f)));
    projects.forEach(p => { p.hidden = f !== 'todos' && p.dataset.category !== f; if (!p.hidden) p.classList.add('in'); });
    videos.forEach(v => { if (v.closest('[data-category]').hidden) v.pause(); });
  };
  $$('button', filters).forEach(b => b.addEventListener('click', () => applyFilter(b.dataset.filter)));
  $$('a[href="#hospitalar"],a[href="#trabalhos"],a[href="#antes-depois"]').forEach(a => a.addEventListener('click', () => applyFilter('todos')));

  /* Apenas um vídeo tocando por vez */
  videos.forEach(v => v.addEventListener('play', () => videos.forEach(o => { if (o !== v) o.pause(); })));

  /* Galeria ampliada com navegação (setas, teclado e deslize) */
  const dialog = $('#lightbox'), img = $('#lightbox-image'), cap = $('#lightbox-caption'), count = $('#lightbox-count');
  let group = [], index = 0, opener = null;
  const visibleItems = () => $$('.portfolio [data-image]').filter(el => !el.closest('[hidden]') && !el.classList.contains('brochure'));
  const show = i => {
    index = (i + group.length) % group.length;
    const el = group[index];
    img.src = el.dataset.image; img.alt = el.dataset.caption || '';
    cap.textContent = el.dataset.caption || '';
    count.textContent = group.length > 1 ? `${index + 1} / ${group.length}` : '';
    dialog.classList.toggle('single', group.length < 2);
  };
  $$('[data-image]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault(); opener = el;
    group = el.classList.contains('brochure') ? [el] : visibleItems();
    show(Math.max(0, group.indexOf(el)));
    dialog.showModal(); document.body.classList.add('lb-open');
  }));
  dialog.addEventListener('close', () => { document.body.classList.remove('lb-open'); img.removeAttribute('src'); opener && opener.focus(); });
  $('.close-dialog', dialog).addEventListener('click', () => dialog.close());
  $('.lb-prev', dialog).addEventListener('click', () => show(index - 1));
  $('.lb-next', dialog).addEventListener('click', () => show(index + 1));
  dialog.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(index - 1); if (e.key === 'ArrowRight') show(index + 1); });
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  let x0 = null;
  dialog.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 45 && group.length > 1) show(index + (dx < 0 ? 1 : -1)); x0 = null; });
})();
