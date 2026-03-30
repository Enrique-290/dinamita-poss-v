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
    },
    ui: {
      search: '',
      selectedCategory: 'all'
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

    refs.preview?.addEventListener('input', (e)=>{
      const target = e.target;
      if(target?.matches('[data-page2-search]')){
        state.ui.search = target.value || '';
        renderPreview();
      }
    });

    refs.preview?.addEventListener('click', (e)=>{
      const categoryBtn = e.target.closest('[data-page2-category]');
      if(categoryBtn){
        state.ui.selectedCategory = categoryBtn.dataset.page2Category || 'all';
        renderPreview();
        return;
      }
      const cta = e.target.closest('[data-page2-cta]');
      if(cta){
        e.preventDefault();
        const kind = cta.dataset.page2Cta;
        if(kind === 'wa'){
          const msg = cta.dataset.page2Msg || 'Hola, me interesa información del gimnasio';
          alert('Base V24R.2: aquí irá la salida a WhatsApp en la siguiente versión.\n\nMensaje preparado:\n' + msg);
        } else if(kind === 'ver') {
          alert('Base V24R.2: el detalle de producto se activará en la siguiente versión.');
        }
      }
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

  function getTPVProducts(){
    try{
      const st = (typeof dpGetState === 'function') ? dpGetState() : null;
      const list = Array.isArray(st?.products) ? st.products : [];
      return list.map((p, idx)=>({
        id: p.id || ('P'+idx),
        name: p.name || 'Producto',
        price: Number(p.price || 0),
        stock: Number(p.stock || 0),
        category: normalizeCategory(p.category || p.name || 'General'),
        image: p.image || '',
        sku: p.sku || '',
        barcode: p.barcode || ''
      }));
    }catch(e){
      console.warn('No se pudo leer catálogo TPV', e);
      return [];
    }
  }

  function normalizeCategory(cat){
    const c = String(cat||'').trim();
    if(!c) return 'General';
    return c.charAt(0).toUpperCase() + c.slice(1);
  }

  function getCategoryList(products){
    const fromProducts = [...new Set(products.map(p=>p.category).filter(Boolean))];
    const manual = (state.categorias.items || []).map(normalizeCategory);
    const merged = [...new Set([...fromProducts, ...manual])];
    return merged.length ? merged : ['General'];
  }

  function filterProducts(products){
    const q = String(state.ui.search || '').trim().toLowerCase();
    const cat = state.ui.selectedCategory || 'all';
    return products.filter(p=>{
      const catOk = cat === 'all' || p.category === cat;
      const qOk = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || String(p.sku).toLowerCase().includes(q);
      return catOk && qOk;
    });
  }

  function buildWhatsAppMessage(product){
    return `Hola, me interesa:\n${product.name}\nPrecio: ${money(product.price)}\nCategoría: ${product.category}`;
  }

  function money(n){
    try{ return Number(n||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'}); }
    catch(e){ return `$${Number(n||0).toFixed(2)}`; }
  }

  function renderPreview(){
    const products = getTPVProducts();
    const categories = getCategoryList(products);
    if(!categories.includes(state.ui.selectedCategory)) state.ui.selectedCategory = 'all';

    refs.preview.innerHTML = `
      <div class="page2-site">
        ${renderHeader()}
        ${renderHero()}
        ${renderCategorias(categories)}
        ${renderDestacados(products)}
        ${renderCatalogo(products, categories)}
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
          <a href="#" class="page2-btnPrimary" data-page2-cta="wa" data-page2-msg="Hola, me interesa información del gimnasio">Entrenar ahora</a>
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
  function renderCategorias(categories){
    return `
      <section class="page2-section">
        <div class="page2-sectionHead">
          <h4>Categorías</h4>
          <span class="page2-muted">Filtra el catálogo por tipo de producto</span>
        </div>
        <div class="page2-chipRow">
          <button class="page2-chip ${state.ui.selectedCategory==='all'?'active':''}" type="button" data-page2-category="all">Todo</button>
          ${categories.map(cat=>`<button class="page2-chip ${state.ui.selectedCategory===cat?'active':''}" type="button" data-page2-category="${escapeAttr(cat)}">${escapeHtml(cat)}</button>`).join('')}
        </div>
      </section>
    `;
  }
  function renderDestacados(products){
    const featured = products.slice(0, Number(state.catalogo.featuredLimit||6));
    return `
      <section class="page2-section">
        <div class="page2-sectionHead">
          <h4>Productos destacados</h4>
          <span class="page2-muted">Conectados al catálogo real de la TPV</span>
        </div>
        <div class="page2-productGrid page2-productGrid--featured">
          ${featured.length ? featured.map(renderProductCard).join('') : '<div class="page2-empty">No hay productos en el catálogo todavía.</div>'}
        </div>
      </section>
    `;
  }

  function renderCatalogo(products){
    const filtered = filterProducts(products).slice(0, Number(state.catalogo.catalogLimit||8));
    return `
      <section class="page2-section">
        <div class="page2-sectionHead">
          <h4>Catálogo</h4>
          <span class="page2-muted">Vista base conectada al inventario</span>
        </div>
        <div class="page2-toolbar">
          <input class="input page2-search" data-page2-search placeholder="Buscar producto por nombre, categoría o SKU" value="${escapeAttr(state.ui.search || '')}">
          <div class="page2-toolbarMeta">Mostrando ${filtered.length} de ${products.length} producto(s)</div>
        </div>
        <div class="page2-productGrid">
          ${filtered.length ? filtered.map(renderProductCard).join('') : '<div class="page2-empty">No hay resultados con este filtro.</div>'}
        </div>
      </section>
    `;
  }

  function renderProductCard(product){
    const img = product.image
      ? `<img class="page2-productImg" src="${escapeAttr(product.image)}" alt="${escapeAttr(product.name)}">`
      : `<div class="page2-productImg page2-productFallback">${initials(product.name)}</div>`;
    return `
      <article class="page2-productCard">
        ${img}
        <div class="page2-productBody">
          <div class="page2-productCategory">${escapeHtml(product.category)}</div>
          <h5>${escapeHtml(product.name)}</h5>
          <div class="page2-productMeta">Stock: ${product.stock}</div>
          <div class="page2-productPrice">${money(product.price)}</div>
          <div class="page2-productActions">
            <button class="page2-btnMini" type="button" data-page2-cta="ver">Ver</button>
            <button class="page2-btnMini primary" type="button" data-page2-cta="wa" data-page2-msg="${escapeAttr(buildWhatsAppMessage(product))}">WhatsApp</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderContacto(){
    return `
      <section class="page2-section" id="contacto">
        <div class="page2-sectionHead">
          <h4>Contacto</h4>
          <span class="page2-muted">Base preparada para enlaces y acciones</span>
        </div>
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
    return `<footer class="page2-footer">Página 2.0 modular · V24R.2 catálogo real base · Dinamita POS</footer>`;
  }

  function escapeHtml(v){ return String(v??'').replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s])); }
  function escapeAttr(v){ return String(v??'').replace(/"/g,'&quot;'); }

  bindTabs();
  bindInputs();
  hydrate();
  renderPreview();
})();
