(function(){
  const STORAGE_KEY = 'dp_page2_config_v1';
  const DEFAULT_STATE = {
    general: {
      businessName: 'Dinamita Gym',
      tagline: 'Explota tu potencial',
      welcomeText: 'Entrena, mejora y crece con nosotros con una página modular lista para evolucionar.',
    },
    banners: {
      heroImage: '',
      secondaryImage: '',
    },
    catalogo: {
      featuredLimit: 6,
      catalogLimit: 8,
    },
    categorias: {
      items: ['Suplementos','Bebidas','Accesorios','Membresías'],
    },
    promociones: {
      title: 'Promoción de la semana',
      text: 'Activa aquí tus promos principales sin romper la página completa.',
    },
    contacto: {
      whatsapp: '',
      phone: '',
      address: '',
      facebook: '',
      instagram: '',
    }
  };

  let state = loadState();

  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }
  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return clone(DEFAULT_STATE);
      return mergeDeep(clone(DEFAULT_STATE), JSON.parse(raw));
    }catch(e){
      console.warn('No se pudo cargar Página 2.0', e);
      return clone(DEFAULT_STATE);
    }
  }
  function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function mergeDeep(target, source){
    Object.keys(source||{}).forEach(k=>{
      const sv = source[k];
      if(sv && typeof sv === 'object' && !Array.isArray(sv)){
        target[k] = mergeDeep(target[k] || {}, sv);
      }else{
        target[k] = sv;
      }
    });
    return target;
  }

  const refs = {
    tabs: Array.from(document.querySelectorAll('.page2-tab')),
    panels: Array.from(document.querySelectorAll('.page2-panel')),
    preview: document.getElementById('page2Preview'),
    saveBtn: document.getElementById('page2SaveBtn'),
    resetBtn: document.getElementById('page2ResetBtn'),
    businessName: document.getElementById('page2BusinessName'),
    tagline: document.getElementById('page2Tagline'),
    welcomeText: document.getElementById('page2WelcomeText'),
    heroImage: document.getElementById('page2HeroImage'),
    secondaryImage: document.getElementById('page2SecondaryImage'),
    featuredLimit: document.getElementById('page2FeaturedLimit'),
    catalogLimit: document.getElementById('page2CatalogLimit'),
    categories: document.getElementById('page2Categories'),
    promoTitle: document.getElementById('page2PromoTitle'),
    promoText: document.getElementById('page2PromoText'),
    whatsapp: document.getElementById('page2Whatsapp'),
    phone: document.getElementById('page2Phone'),
    address: document.getElementById('page2Address'),
    facebook: document.getElementById('page2Facebook'),
    instagram: document.getElementById('page2Instagram'),
  };

  function bindTabs(){
    refs.tabs.forEach(tab=>tab.addEventListener('click', ()=>{
      refs.tabs.forEach(x=>x.classList.toggle('active', x===tab));
      refs.panels.forEach(p=>p.classList.toggle('active', p.dataset.panel===tab.dataset.tab));
    }));
  }

  function bindInputs(){
    const pairs = [
      ['businessName',['general','businessName']],
      ['tagline',['general','tagline']],
      ['welcomeText',['general','welcomeText']],
      ['heroImage',['banners','heroImage']],
      ['secondaryImage',['banners','secondaryImage']],
      ['featuredLimit',['catalogo','featuredLimit']],
      ['catalogLimit',['catalogo','catalogLimit']],
      ['categories',['categorias','items'],'csv'],
      ['promoTitle',['promociones','title']],
      ['promoText',['promociones','text']],
      ['whatsapp',['contacto','whatsapp']],
      ['phone',['contacto','phone']],
      ['address',['contacto','address']],
      ['facebook',['contacto','facebook']],
      ['instagram',['contacto','instagram']],
    ];

    pairs.forEach(([refKey,path,mode])=>{
      const el = refs[refKey];
      if(!el) return;
      el.addEventListener('input', ()=>{
        let value = el.value;
        if(mode === 'csv') value = value.split(',').map(x=>x.trim()).filter(Boolean);
        if(el.type === 'number') value = Number(value || 0);
        setByPath(state, path, value);
        renderPreview();
      });
    });

    refs.saveBtn?.addEventListener('click', ()=>{
      saveState();
      alert('Página 2.0 guardada.');
    });

    refs.resetBtn?.addEventListener('click', ()=>{
      if(!confirm('¿Restablecer la base de Página 2.0?')) return;
      state = clone(DEFAULT_STATE);
      hydrate();
      renderPreview();
      saveState();
    });
  }

  function setByPath(obj, path, value){
    let cursor = obj;
    for(let i=0;i<path.length-1;i++){
      const key = path[i];
      if(!cursor[key]) cursor[key] = {};
      cursor = cursor[key];
    }
    cursor[path[path.length-1]] = value;
  }

  function hydrate(){
    refs.businessName.value = state.general.businessName || '';
    refs.tagline.value = state.general.tagline || '';
    refs.welcomeText.value = state.general.welcomeText || '';
    refs.heroImage.value = state.banners.heroImage || '';
    refs.secondaryImage.value = state.banners.secondaryImage || '';
    refs.featuredLimit.value = state.catalogo.featuredLimit || 6;
    refs.catalogLimit.value = state.catalogo.catalogLimit || 8;
    refs.categories.value = (state.categorias.items || []).join(', ');
    refs.promoTitle.value = state.promociones.title || '';
    refs.promoText.value = state.promociones.text || '';
    refs.whatsapp.value = state.contacto.whatsapp || '';
    refs.phone.value = state.contacto.phone || '';
    refs.address.value = state.contacto.address || '';
    refs.facebook.value = state.contacto.facebook || '';
    refs.instagram.value = state.contacto.instagram || '';
  }

  function renderPreview(){
    refs.preview.innerHTML = `
      <div class="page2-site">
        ${renderHeader()}
        ${renderHero()}
        ${renderCategorias()}
        ${renderDestacados()}
        ${renderContacto()}
        ${renderFooter()}
      </div>
    `;
  }

  function initials(text){
    return String(text||'DG').split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase() || 'DG';
  }
  function renderHeader(){
    return `
      <header class="page2-siteHeader">
        <div class="page2-siteBrand">
          <div class="page2-siteLogo">${initials(state.general.businessName)}</div>
          <div>
            <div class="page2-siteName">${escapeHtml(state.general.businessName)}</div>
            <div class="page2-siteTag">${escapeHtml(state.general.tagline)}</div>
          </div>
        </div>
        <div class="page2-siteActions">
          <a href="#contacto" class="page2-btnGhost">Contacto</a>
          <a href="#" class="page2-btnPrimary">Entrenar ahora</a>
        </div>
      </header>
    `;
  }
  function renderHero(){
    const bg = state.banners.heroImage ? `style="background-image:url('${escapeAttr(state.banners.heroImage)}')"` : '';
    return `
      <section class="page2-hero">
        <div class="page2-heroCopy">
          <h1>${escapeHtml(state.general.tagline)}</h1>
          <p>${escapeHtml(state.general.welcomeText)}</p>
        </div>
        <div class="page2-heroMedia" ${bg}>${state.banners.heroImage ? '' : 'Banner principal'}</div>
      </section>
    `;
  }
  function renderCategorias(){
    const cats = state.categorias.items || [];
    return `
      <section class="page2-section">
        <h4>Categorías base</h4>
        <div class="page2-chipRow">
          ${cats.map(cat=>`<span class="page2-chip">${escapeHtml(cat)}</span>`).join('') || '<span class="page2-chip">Sin categorías</span>'}
        </div>
      </section>
    `;
  }
  function renderDestacados(){
    const cards = [
      {title:'Productos destacados', text:`Límite actual: ${Number(state.catalogo.featuredLimit||0)} productos.`},
      {title:'Catálogo visible', text:`Límite actual: ${Number(state.catalogo.catalogLimit||0)} productos.`},
      {title: state.promociones.title || 'Promoción activa', text: state.promociones.text || 'Configura aquí tus campañas principales.'},
    ];
    return `
      <section class="page2-section">
        <h4>Bloques preparados</h4>
        <div class="page2-cards">
          ${cards.map(card=>`<article class="page2-card"><h5>${escapeHtml(card.title)}</h5><p>${escapeHtml(card.text)}</p></article>`).join('')}
        </div>
      </section>
    `;
  }
  function renderContacto(){
    return `
      <section class="page2-section" id="contacto">
        <h4>Contacto</h4>
        <div class="page2-contact">
          <div class="page2-contactItem"><strong>WhatsApp</strong><span>${escapeHtml(state.contacto.whatsapp || 'Pendiente')}</span></div>
          <div class="page2-contactItem"><strong>Teléfono</strong><span>${escapeHtml(state.contacto.phone || 'Pendiente')}</span></div>
          <div class="page2-contactItem"><strong>Dirección</strong><span>${escapeHtml(state.contacto.address || 'Pendiente')}</span></div>
          <div class="page2-contactItem"><strong>Redes</strong><span>${escapeHtml(compactSocials())}</span></div>
        </div>
      </section>
    `;
  }
  function compactSocials(){
    const arr = [];
    if(state.contacto.facebook) arr.push('Facebook');
    if(state.contacto.instagram) arr.push('Instagram');
    return arr.join(' · ') || 'Pendiente';
  }
  function renderFooter(){
    return `<footer class="page2-footer">Página 2.0 base modular · Dinamita POS</footer>`;
  }

  function escapeHtml(v){ return String(v??'').replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s])); }
  function escapeAttr(v){ return String(v??'').replace(/"/g,'&quot;'); }

  bindTabs();
  bindInputs();
  hydrate();
  renderPreview();
})();
