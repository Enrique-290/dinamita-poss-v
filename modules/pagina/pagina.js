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
      catalogLimit: 12,
      mostSoldLimit: 6,
      newLimit: 6,
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
    cart: {
      items: []
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
    heroImageFile: document.getElementById('page2HeroImageFile'),
    heroImagePreview: document.getElementById('page2HeroImagePreview'),
    heroClearBtn: document.getElementById('page2HeroClearBtn'),
    secondaryImage: document.getElementById('page2SecondaryImage'),
    secondaryImageFile: document.getElementById('page2SecondaryImageFile'),
    secondaryImagePreview: document.getElementById('page2SecondaryImagePreview'),
    secondaryClearBtn: document.getElementById('page2SecondaryClearBtn'),
    featuredLimit: document.getElementById('page2FeaturedLimit'),
    catalogLimit: document.getElementById('page2CatalogLimit'),
    mostSoldLimit: document.getElementById('page2MostSoldLimit'),
    newLimit: document.getElementById('page2NewLimit'),
    categories: document.getElementById('page2Categories'),
    promoTitle: document.getElementById('page2PromoTitle'),
    promoText: document.getElementById('page2PromoText'),
    whatsapp: document.getElementById('page2Whatsapp'),
    phone: document.getElementById('page2Phone'),
    address: document.getElementById('page2Address'),
    facebook: document.getElementById('page2Facebook'),
    instagram: document.getElementById('page2Instagram'),
    exportHtmlBtn: document.getElementById('page2ExportHtmlBtn'),
    exportJsonBtn: document.getElementById('page2ExportJsonBtn'),
    importJsonBtn: document.getElementById('page2ImportJsonBtn'),
    importJsonFile: document.getElementById('page2ImportJsonFile'),
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
      ['mostSoldLimit',['catalogo','mostSoldLimit']],
      ['newLimit',['catalogo','newLimit']],
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

    refs.exportHtmlBtn?.addEventListener('click', ()=>{
      try{
        const html = buildExportHtml();
        downloadFile(`${slugify(state.general.businessName || 'pagina')}-pagina2.html`, html, 'text/html;charset=utf-8');
      }catch(e){
        console.error(e);
        alert('No se pudo generar la página HTML.');
      }
    });

    refs.exportJsonBtn?.addEventListener('click', ()=>{
      try{
        const payload = { state, products: getTPVProducts() };
        downloadFile(`${slugify(state.general.businessName || 'pagina')}-pagina2.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
      }catch(e){
        console.error(e);
        alert('No se pudo generar el JSON.');
      }
    });

    refs.importJsonBtn?.addEventListener('click', ()=>{
      refs.importJsonFile?.click();
    });

    refs.importJsonFile?.addEventListener('change', async (e)=>{
      try{
        const file = e.target.files && e.target.files[0];
        if(!file) return;
        const text = await file.text();
        const payload = JSON.parse(text);
        const importedState = payload && typeof payload === 'object' ? (payload.state || payload) : null;
        if(!importedState || typeof importedState !== 'object'){
          throw new Error('JSON inválido');
        }
        state = mergeDeep(clone(DEFAULT_STATE), importedState);
        hydrate();
        renderPreview();
        saveState();
        alert('JSON importado correctamente en Página 2.0.');
      }catch(err){
        console.error(err);
        alert('No se pudo importar el JSON. Verifica que sea un respaldo válido de Página 2.0.');
      }finally{
        if(refs.importJsonFile) refs.importJsonFile.value = '';
      }
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



  function updateBannerPreview(el, src, label){
    if(!el) return;
    if(src){
      el.style.backgroundImage = `url('${String(src).replace(/'/g, "\'")}')`;
      el.textContent = '';
      el.classList.add('has-image');
    }else{
      el.style.backgroundImage = '';
      el.textContent = label || 'Sin imagen';
      el.classList.remove('has-image');
    }
  }

  function readImageFile(file, cb){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => cb(String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  function bindBannerUploads(){
    refs.heroImageFile?.addEventListener('change', (e)=>{
      const file = e.target.files && e.target.files[0];
      if(!file) return;
      readImageFile(file, (dataUrl)=>{
        state.banners.heroImage = dataUrl;
        refs.heroImage.value = dataUrl;
        updateBannerPreview(refs.heroImagePreview, dataUrl, 'Sin imagen');
        renderPreview();
      });
    });
    refs.secondaryImageFile?.addEventListener('change', (e)=>{
      const file = e.target.files && e.target.files[0];
      if(!file) return;
      readImageFile(file, (dataUrl)=>{
        state.banners.secondaryImage = dataUrl;
        refs.secondaryImage.value = dataUrl;
        updateBannerPreview(refs.secondaryImagePreview, dataUrl, 'Sin imagen');
        renderPreview();
      });
    });
    refs.heroClearBtn?.addEventListener('click', ()=>{
      state.banners.heroImage = '';
      refs.heroImage.value = '';
      if(refs.heroImageFile) refs.heroImageFile.value = '';
      updateBannerPreview(refs.heroImagePreview, '', 'Sin imagen');
      renderPreview();
    });
    refs.secondaryClearBtn?.addEventListener('click', ()=>{
      state.banners.secondaryImage = '';
      refs.secondaryImage.value = '';
      if(refs.secondaryImageFile) refs.secondaryImageFile.value = '';
      updateBannerPreview(refs.secondaryImagePreview, '', 'Sin imagen');
      renderPreview();
    });
  }

  function hydrate(){
    refs.businessName.value = state.general.businessName || '';
    refs.tagline.value = state.general.tagline || '';
    refs.welcomeText.value = state.general.welcomeText || '';
    refs.heroImage.value = state.banners.heroImage || '';
    refs.secondaryImage.value = state.banners.secondaryImage || '';
    updateBannerPreview(refs.heroImagePreview, state.banners.heroImage || '', 'Sin imagen');
    updateBannerPreview(refs.secondaryImagePreview, state.banners.secondaryImage || '', 'Sin imagen');
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

function getCartItems(){
  return Array.isArray(state.cart?.items) ? state.cart.items : [];
}

function findProductById(id){
  return getTPVProducts().find(p => String(p.id) === String(id));
}

function addToCart(productId){
  const product = findProductById(productId);
  if(!product) return;
  if(!state.cart || !Array.isArray(state.cart.items)) state.cart = { items: [] };
  const existing = state.cart.items.find(x => String(x.id) === String(productId));
  if(existing){
    existing.qty += 1;
  } else {
    state.cart.items.push({
      id: product.id,
      name: product.name,
      price: Number(product.price || 0),
      category: product.category || 'General',
      qty: 1
    });
  }
  renderPreview();
}

function updateCartQty(productId, delta){
  const items = getCartItems();
  const idx = items.findIndex(x => String(x.id) === String(productId));
  if(idx < 0) return;
  items[idx].qty += delta;
  if(items[idx].qty <= 0) items.splice(idx,1);
  renderPreview();
}

function removeFromCart(productId){
  const items = getCartItems();
  const idx = items.findIndex(x => String(x.id) === String(productId));
  if(idx >= 0) items.splice(idx,1);
  renderPreview();
}

function clearCart(){
  if(!state.cart) state.cart = { items: [] };
  state.cart.items = [];
  renderPreview();
}

function cartTotal(){
  return getCartItems().reduce((sum, item) => sum + (Number(item.price||0) * Number(item.qty||0)), 0);
}

function normalizeMxNumber(raw){
  const digits = String(raw || '').replace(/\D/g,'');
  if(!digits) return '';
  if(digits.startswith?.('521')) return digits;
  if(digits.startsWith('521')) return digits;
  if(digits.startsWith('52') && digits.length === 12) return '521' + digits.slice(2);
  if(digits.length === 10) return '521' + digits;
  if(digits.length === 12 && digits.startsWith('52')) return '521' + digits.slice(2);
  return digits;
}

function getWhatsappNumber(){
  return normalizeMxNumber(state.contacto.whatsapp || state.contacto.phone || '');
}

function openWhatsAppMessage(message){
  const number = getWhatsappNumber();
  if(!number){
    alert('Captura primero el WhatsApp o teléfono en la sección Contacto.');
    return;
  }
  const url = `https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function buildCartWhatsAppMessage(){
  const items = getCartItems();
  const lines = items.map(item => `- ${item.name} x${item.qty} ${money(Number(item.price||0) * Number(item.qty||0))}`);
  return `Hola, quiero hacer este pedido:
${lines.join('\n')}\n\nTotal: ${money(cartTotal())}`;
}


  function renderPreview(){
    const products = getTPVProducts();
    const categories = getCategoryList(products);
    if(!categories.includes(state.ui.selectedCategory)) state.ui.selectedCategory = 'all';

    refs.preview.innerHTML = `
      <div class="page2-site">
        ${renderHeader()}
        ${renderHero()}
        ${renderSecondaryBanner()}
        ${renderCategorias(categories)}
        ${renderDestacados(products)}
        ${renderMasVendidos(products)}
        ${renderNuevos(products)}
        ${renderCatalogo(products, categories)}
        ${renderCarrito()}
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

  function getMostSoldProducts(products){
    const most = (((window.dpGetState && dpGetState()) || {}).analytics || {}).mostSold || {};
    const ordered = products.slice().sort((a,b)=> Number(most[b.id]||0) - Number(most[a.id]||0));
    const positive = ordered.filter(p => Number(most[p.id]||0) > 0);
    return (positive.length ? positive : ordered).slice(0, Number(state.catalogo.mostSoldLimit||6));
  }

  function getNewestProducts(products){
    return products.slice().sort((a,b)=> String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||''))).slice(0, Number(state.catalogo.newLimit||6));
  }

  function renderMasVendidos(products){
    const most = getMostSoldProducts(products);
    return `
      <section class="page2-section">
        <div class="page2-sectionHead">
          <h4>Lo más vendido</h4>
          <span class="page2-muted">Productos con mayor movimiento en la TPV</span>
        </div>
        <div class="page2-productGrid page2-productGrid--featured">
          ${most.length ? most.map(p=>renderProductCard(p,'top')).join('') : '<div class="page2-empty">Todavía no hay historial de ventas suficiente para este bloque.</div>'}
        </div>
      </section>
    `;
  }

  function renderNuevos(products){
    const newest = getNewestProducts(products);
    return `
      <section class="page2-section">
        <div class="page2-sectionHead">
          <h4>Nuevos productos</h4>
          <span class="page2-muted">Lo más reciente agregado o actualizado</span>
        </div>
        <div class="page2-productGrid page2-productGrid--featured">
          ${newest.length ? newest.map(p=>renderProductCard(p,'new')).join('') : '<div class="page2-empty">No hay productos recientes para mostrar.</div>'}
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

  function renderProductCard(product, badge=''){
    const img = product.image
      ? `<img class="page2-productImg" src="${escapeAttr(product.image)}" alt="${escapeAttr(product.name)}">`
      : `<div class="page2-productImg page2-productFallback">${initials(product.name)}</div>`;
    const badgeHtml = badge==='top' ? '<span class="page2-tag hot">Más vendido</span>' : badge==='new' ? '<span class="page2-tag new">Nuevo</span>' : '';
    return `
      <article class="page2-productCard">
        <div class="page2-productMedia">${img}${badgeHtml}</div>
        <div class="page2-productBody">
          <div class="page2-productCategory">${escapeHtml(product.category)}</div>
          <h5>${escapeHtml(product.name)}</h5>
          <div class="page2-productMeta">Stock: ${product.stock}</div>
          <div class="page2-productPrice">${money(product.price)}</div>
          <div class="page2-productActions">
            <button class="page2-btnMini" type="button" data-page2-cta="ver">Ver</button>
            <button class="page2-btnMini" type="button" data-page2-cart-action="add" data-page2-product-id="${escapeAttr(product.id)}">Agregar</button>
            <button class="page2-btnMini primary" type="button" data-page2-cta="wa" data-page2-msg="${escapeAttr(buildWhatsAppMessage(product))}">WhatsApp</button>
          </div>
        </div>
      </article>
    `;
  }


function renderCarrito(){
  const items = getCartItems();
  return `
    <section class="page2-section">
      <div class="page2-sectionHead">
        <h4>Carrito</h4>
        <span class="page2-muted">Pedido rápido por WhatsApp</span>
      </div>
      <div class="page2-cartWrap">
        ${items.length ? `
          <div class="page2-cartList">
            ${items.map(item=>`
              <div class="page2-cartItem">
                <div>
                  <strong>${escapeHtml(item.name)}</strong>
                  <div class="page2-cartMeta">${escapeHtml(item.category || 'General')} · ${money(item.price)}</div>
                </div>
                <div class="page2-cartControls">
                  <button class="page2-btnMini" type="button" data-page2-cart-action="minus" data-page2-product-id="${escapeAttr(item.id)}">-</button>
                  <span class="page2-cartQty">${item.qty}</span>
                  <button class="page2-btnMini" type="button" data-page2-cart-action="plus" data-page2-product-id="${escapeAttr(item.id)}">+</button>
                  <button class="page2-btnMini" type="button" data-page2-cart-action="remove" data-page2-product-id="${escapeAttr(item.id)}">Quitar</button>
                </div>
                <div class="page2-cartLineTotal">${money(Number(item.price||0) * Number(item.qty||0))}</div>
              </div>
            `).join('')}
          </div>
          <div class="page2-cartFooter">
            <div class="page2-cartTotal">Total: <strong>${money(cartTotal())}</strong></div>
            <div class="page2-cartFooterActions">
              <button class="page2-btnMini" type="button" data-page2-cart-action="clear">Vaciar</button>
              <button class="page2-btnMini primary" type="button" data-page2-cart-action="send">Enviar por WhatsApp</button>
            </div>
          </div>
        ` : `<div class="page2-empty">Tu carrito está vacío. Agrega productos desde el catálogo.</div>`}
      </div>
    </section>
  `;
}

  function renderSecondaryBanner(){
    if(!state.banners.secondaryImage) return '';
    const bg = `style="background-image:url('${escapeAttr(state.banners.secondaryImage)}')"`;
    return `
      <section class="page2-section">
        <div class="page2-sectionHead">
          <h4>Banner secundario</h4>
          <span class="page2-muted">Imagen promocional complementaria</span>
        </div>
        <div class="page2-heroMedia page2-heroMedia--secondary" ${bg}></div>
      </section>
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
    return `<footer class="page2-footer">Página 2.0 modular · V24R.4 carrito + WhatsApp · Dinamita POS</footer>`;
  }

  function escapeHtml(v){ return String(v??'').replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s])); }
  function escapeAttr(v){ return String(v??'').replace(/"/g,'&quot;'); }




  function slugify(text){
    return String(text || 'pagina').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') || 'pagina';
  }

  function downloadFile(filename, content, mime){
    const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 1500);
  }

  function buildExportHtml(){
    const payload = {
      state,
      products: getTPVProducts(),
      categories: getCategoryList(getTPVProducts())
    };

    const safeJson = JSON.stringify(payload).replace(/<\/script/gi, '<\\/script');

    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(state.general.businessName || 'Página 2.0')}</title>
  <style>
    *{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#f6f6f6;color:#111}img{max-width:100%;display:block}
    .wrap{max-width:1180px;margin:0 auto;padding:16px}.section{background:#fff;border:1px solid #ececec;border-radius:20px;padding:18px;margin:16px 0}
    .header{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:18px;background:#fff;border:1px solid #ececec;border-radius:20px;margin:16px 0}.brand{display:flex;gap:12px;align-items:center}.logo{width:64px;height:64px;border-radius:18px;background:#c00000;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:26px}.muted{color:#666}
    .btn{display:inline-flex;align-items:center;justify-content:center;padding:10px 16px;border-radius:999px;border:1px solid #ddd;background:#fff;color:#222;font-weight:800;text-decoration:none;cursor:pointer}.btn.primary{background:#c00000;border-color:#c00000;color:#fff}.btn.whatsapp{background:#25D366;border-color:#25D366;color:#fff}
    .btn:hover{filter:brightness(.97)} .hero{display:grid;grid-template-columns:1.1fr .9fr;gap:16px;align-items:stretch}.heroMedia,.promoMedia{min-height:260px;border-radius:18px;background:#eee center/cover no-repeat;display:flex;align-items:center;justify-content:center;font-weight:800;color:#666;overflow:hidden}
    .hero h1{font-size:54px;line-height:1.05;margin:0 0 10px}.hero p{font-size:20px;color:#555;max-width:620px}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
    .chips{display:flex;gap:10px;flex-wrap:wrap}.chip{padding:10px 16px;border:1px solid #ddd;border-radius:999px;background:#fff;font-weight:800;cursor:pointer}.chip.active{background:#c00000;border-color:#c00000;color:#fff}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}.grid.featured{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
    .product{border:1px solid #ececec;border-radius:18px;padding:14px;background:#fff}.pmedia{position:relative;border-radius:14px;background:#f1f1f1;min-height:160px;display:flex;align-items:center;justify-content:center;overflow:hidden}.pmedia img{width:100%;height:160px;object-fit:cover}.fallback{font-size:40px;font-weight:900;color:#999}
    .tag{position:absolute;top:10px;right:10px;padding:6px 10px;border-radius:999px;background:#fff3f3;color:#b30000;font-size:12px;font-weight:800}.tag.new{background:#eef8ee;color:#0f7b27}
    .cat{display:inline-block;padding:6px 10px;border-radius:999px;background:#f3f3f3;color:#666;font-size:12px;font-weight:800;margin:12px 0 8px}.price{color:#c00000;font-size:36px;font-weight:900;margin:8px 0}.small{font-size:13px;color:#666}.pactions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
    .toolbar{display:flex;gap:12px;justify-content:space-between;align-items:center;flex-wrap:wrap}.search{padding:12px 14px;border:1px solid #ddd;border-radius:14px;min-width:260px;flex:1}
    .promos{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.promo{padding:16px;border:1px solid #f2caca;background:#fff7f7;border-radius:18px}.promo .k{color:#b35555;font-weight:900;font-size:13px}
    .contact{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center}.contactGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.contactItem{padding:14px;border:1px solid #eee;border-radius:16px;background:#fff}.footer{padding:22px;text-align:center;color:#666}
    .cart{position:sticky;bottom:12px}.cartWrap{background:#fff;border:1px solid #ececec;border-radius:18px;padding:14px}.cartList{display:flex;flex-direction:column;gap:10px}.cartItem{display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;border-bottom:1px solid #f0f0f0;padding-bottom:10px}.cartItem:last-child{border-bottom:0;padding-bottom:0}.cartControls{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.qty{min-width:18px;text-align:center;font-weight:800}.cartFooter{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-top:12px;padding-top:12px;border-top:1px solid #eee}.empty{padding:16px;border:1px dashed #ddd;border-radius:16px;background:#fafafa;color:#666}
    .floatingWa{position:fixed;right:18px;bottom:18px;z-index:30}
    .detailOverlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;align-items:center;justify-content:center;padding:20px;z-index:40}.detailOverlay.open{display:flex}.detailCard{background:#fff;border-radius:20px;padding:20px;max-width:920px;width:min(100%,920px);display:grid;grid-template-columns:1fr 1fr;gap:18px}.detailMedia{border-radius:18px;background:#f0f0f0;min-height:280px;display:flex;align-items:center;justify-content:center;overflow:hidden}.detailMedia img{width:100%;height:100%;object-fit:cover}.detailClose{position:absolute;top:14px;right:14px}
    @media (max-width: 860px){.hero{grid-template-columns:1fr}.hero h1{font-size:42px}.contact{grid-template-columns:1fr}.detailCard{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    const PAGE_DATA = ${safeJson};
    let pageState = JSON.parse(JSON.stringify(PAGE_DATA.state));
    const products = PAGE_DATA.products || [];
    function money(n){ try{return Number(n||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'});}catch(e){return '$'+Number(n||0).toFixed(2);} }
    function esc(v){ return String(v??'').replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s])); }
    function initials(text){ return (String(text||'DG').split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()) || 'DG'; }
    function normalizeMxNumber(raw){ const digits=String(raw||'').replace(/\D/g,''); if(!digits) return ''; if(digits.startsWith('521')) return digits; if(digits.startsWith('52')&&digits.length===12) return '521'+digits.slice(2); if(digits.length===10) return '521'+digits; return digits; }
    function waNumber(){ return normalizeMxNumber(pageState.contacto.whatsapp || pageState.contacto.phone || ''); }
    function openWa(message){ const num=waNumber(); if(!num){ alert('Captura primero WhatsApp o teléfono antes de exportar.'); return; } const url='https://api.whatsapp.com/send?phone='+num+'&text='+encodeURIComponent(message); window.open(url,'_blank','noopener,noreferrer'); }
    function cartItems(){ return Array.isArray(pageState.cart?.items) ? pageState.cart.items : []; }
    function cartTotal(){ return cartItems().reduce((s,i)=>s+Number(i.price||0)*Number(i.qty||0),0); }
    function categories(){ return Array.isArray(PAGE_DATA.categories) ? PAGE_DATA.categories : []; }
    function selectedCategory(){ return pageState.ui?.selectedCategory || 'all'; }
    function filteredProducts(){ const q=String(pageState.ui?.search||'').toLowerCase().trim(); return products.filter(p=>{ const catOk=selectedCategory()==='all' || (p.category||'Sin categoría')===selectedCategory(); const qOk=!q || [p.name,p.category,p.sku].some(v=>String(v||'').toLowerCase().includes(q)); return catOk && qOk; }); }
    function featured(){ return products.slice(0, Number(pageState.catalogo?.featuredLimit||6)); }
    function mostSold(){ return products.slice(0, Number(pageState.catalogo?.mostSoldLimit||6)); }
    function newest(){ return products.slice(0, Number(pageState.catalogo?.newLimit||6)); }
    function findProduct(id){ return products.find(x=>String(x.id)===String(id)); }
    function addToCart(id){ const p=findProduct(id); if(!p) return; if(!pageState.cart || !Array.isArray(pageState.cart.items)) pageState.cart={items:[]}; const ex=pageState.cart.items.find(x=>String(x.id)===String(id)); if(ex){ ex.qty += 1; } else { pageState.cart.items.push({id:p.id,name:p.name,price:Number(p.price||0),category:p.category||'General',qty:1}); } render(); }
    function updateQty(id,delta){ const items=cartItems(); const ex=items.find(x=>String(x.id)===String(id)); if(!ex) return; ex.qty += delta; if(ex.qty<=0) removeFromCart(id); render(); }
    function removeFromCart(id){ if(!pageState.cart || !Array.isArray(pageState.cart.items)) return; pageState.cart.items = pageState.cart.items.filter(x=>String(x.id)!==String(id)); render(); }
    function clearCart(){ if(!pageState.cart) pageState.cart={items:[]}; pageState.cart.items=[]; render(); }
    function cartMessage(){ const lines = cartItems().map(i => '- '+i.name+' x'+i.qty+' '+money(Number(i.price||0)*Number(i.qty||0))); return 'Hola, quiero hacer este pedido:\n'+lines.join('\n')+'\n\nTotal: '+money(cartTotal()); }
    function productMessage(p){ return 'Hola, me interesa el producto:\n'+p.name+'\nCategoría: '+(p.category||'General')+'\nPrecio: '+money(p.price); }
    function productCard(p, kind=''){ return '<article class="product"><div class="pmedia">'+(p.image?'<img src="'+esc(p.image)+'" alt="'+esc(p.name)+'">':'<div class="fallback">'+esc(initials(p.name))+'</div>')+(kind==='top'?'<span class="tag">Más vendido</span>':'')+(kind==='new'?'<span class="tag new">Nuevo</span>':'')+'</div><div class="cat">'+esc(p.category||'General')+'</div><h3>'+esc(p.name)+'</h3><div class="price">'+money(p.price)+'</div><div class="small">Stock: '+Number(p.stock||0)+'</div><div class="pactions"><button class="btn" data-action="detail" data-id="'+esc(p.id)+'">Ver detalle</button><button class="btn primary" data-action="add" data-id="'+esc(p.id)+'">Agregar</button><button class="btn whatsapp" data-action="wa" data-id="'+esc(p.id)+'">WhatsApp</button></div></article>'; }
    function render(){ const app=document.getElementById('app'); const detail = findProduct(pageState.ui?.detailId || ''); const heroStyle = pageState.banners?.heroImage ? 'style="background-image:url(\''+String(pageState.banners.heroImage).replace(/'/g, "\'")+'\')"' : ''; const sec = pageState.banners?.secondaryImage ? '<section class="section"><div class="promoMedia" style="background-image:url(\''+String(pageState.banners.secondaryImage).replace(/'/g, "\'")+'\')"></div></section>' : '';
      app.innerHTML = '<div class="wrap">'+
      '<header class="header"><div class="brand"><div class="logo">'+esc(initials(pageState.general.businessName))+'</div><div><div style="font-size:18px;font-weight:900">'+esc(pageState.general.businessName||'Dinamita Gym')+'</div><div class="muted">'+esc(pageState.general.tagline||'Explota tu potencial')+'</div></div></div><div class="actions"><button class="btn" data-action="scroll-contact">Contacto</button><button class="btn primary" data-action="wa-hero">Entrenar ahora</button></div></header>'+
      '<section class="section hero"><div><h1>'+esc(pageState.general.tagline||'Explota tu potencial')+'</h1><p>'+esc(pageState.general.welcomeText||'Entrena, mejora y crece con nosotros con una página modular lista para evolucionar.')+'</p><div class="actions"><button class="btn primary" data-action="wa-hero">Escríbenos por WhatsApp</button><button class="btn" data-action="scroll-contact">Ver contacto</button></div></div><div class="heroMedia" '+heroStyle+'>'+(pageState.banners?.heroImage?'':'Banner principal')+'</div></section>'+
      sec+
      '<section class="section"><div class="toolbar"><div><h2 style="margin:0">Categorías</h2><div class="muted">Filtra el catálogo por tipo de producto</div></div></div><div class="chips" style="margin-top:12px"><button class="chip '+(selectedCategory()==='all'?'active':'')+'" data-action="cat" data-cat="all">Todo</button>'+categories().map(c=>'<button class="chip '+(selectedCategory()===c?'active':'')+'" data-action="cat" data-cat="'+esc(c)+'">'+esc(c)+'</button>').join('')+'</div></section>'+
      '<section class="section"><div class="toolbar"><div><h2 style="margin:0">Productos destacados</h2><div class="muted">Selección principal del catálogo</div></div></div><div class="grid featured" style="margin-top:12px">'+(featured().map(p=>productCard(p)).join('') || '<div class="empty">No hay productos.</div>')+'</div></section>'+
      '<section class="section"><div class="toolbar"><div><h2 style="margin:0">Lo más vendido</h2><div class="muted">Productos con mayor salida</div></div></div><div class="grid" style="margin-top:12px">'+(mostSold().map(p=>productCard(p,'top')).join('') || '<div class="empty">No hay productos.</div>')+'</div></section>'+
      '<section class="section"><div class="toolbar"><div><h2 style="margin:0">Nuevos productos</h2><div class="muted">Lo más reciente del catálogo</div></div></div><div class="grid" style="margin-top:12px">'+(newest().map(p=>productCard(p,'new')).join('') || '<div class="empty">No hay productos.</div>')+'</div></section>'+
      '<section class="section"><div class="toolbar"><div><h2 style="margin:0">Catálogo</h2><div class="muted">Vista conectada a tu inventario</div></div><input class="search" placeholder="Buscar producto por nombre, categoría o SKU" value="'+esc(pageState.ui?.search||'')+'" data-action="search"></div><div class="muted" style="margin-top:10px">Mostrando '+filteredProducts().length+' de '+products.length+' producto(s)</div><div class="grid featured" style="margin-top:14px">'+(filteredProducts().map(p=>productCard(p)).join('') || '<div class="empty">No hay resultados con este filtro.</div>')+'</div></section>'+
      '<section class="section cart"><div class="toolbar"><div><h2 style="margin:0">Carrito</h2><div class="muted">Pedido rápido por WhatsApp</div></div></div><div class="cartWrap" style="margin-top:12px">'+(cartItems().length ? '<div class="cartList">'+cartItems().map(i=>'<div class="cartItem"><div><strong>'+esc(i.name)+'</strong><div class="small">'+esc(i.category||'General')+' · '+money(i.price)+'</div></div><div class="cartControls"><button class="btn" data-action="minus" data-id="'+esc(i.id)+'">-</button><span class="qty">'+i.qty+'</span><button class="btn" data-action="plus" data-id="'+esc(i.id)+'">+</button><button class="btn" data-action="remove" data-id="'+esc(i.id)+'">Quitar</button></div><div><strong>'+money(Number(i.price||0)*Number(i.qty||0))+'</strong></div></div>').join('')+'</div><div class="cartFooter"><div>Total: <strong>'+money(cartTotal())+'</strong></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-action="clear">Vaciar</button><button class="btn whatsapp" data-action="send-cart">Enviar por WhatsApp</button></div></div>' : '<div class="empty">Tu carrito está vacío. Agrega productos desde el catálogo.</div>')+'</div></section>'+
      '<section class="section"><div class="toolbar"><div><h2 style="margin:0">Promociones</h2><div class="muted">Ideal para campañas y flyers</div></div></div><div class="promos" style="margin-top:12px"><div class="promo"><div class="k">PROMO 1</div><h3 style="margin:6px 0">'+esc(pageState.promociones?.title||'Promoción')+'</h3><p style="margin:0">'+esc(pageState.promociones?.text||'')+'</p></div><div class="promo"><div class="k">PROMO 2</div><h3 style="margin:6px 0">Creatina + shaker a precio especial</h3><p style="margin:0">Oferta sugerida para arrancar campañas rápidas.</p></div><div class="promo"><div class="k">PROMO 3</div><h3 style="margin:6px 0">Promociones activas todo el mes</h3><p style="margin:0">Configura aquí tus campañas destacadas.</p></div></div></section>'+
      '<section class="section" id="contacto"><div class="toolbar"><div><h2 style="margin:0">Contacto</h2><div class="muted">Canales directos de atención</div></div></div><div class="contact" style="margin-top:12px"><div class="contactGrid"><div class="contactItem"><strong>Dirección</strong><div class="muted">'+esc(pageState.contacto?.address||'Agrega la dirección del gym.')+'</div></div><div class="contactItem"><strong>Teléfono</strong><div class="muted">'+esc(pageState.contacto?.phone||'Agrega tu teléfono visible.')+'</div></div><div class="contactItem"><strong>WhatsApp</strong><div class="muted">'+esc(pageState.contacto?.whatsapp||'Pendiente')+'</div></div><div class="contactItem"><strong>Redes</strong><div class="muted">'+esc([(pageState.contacto?.facebook?'Facebook':''),(pageState.contacto?.instagram?'Instagram':'')].filter(Boolean).join(' · ') || 'Pendiente')+'</div></div></div><div style="display:flex;flex-direction:column;gap:10px"><button class="btn primary" data-action="wa-contact">Escríbenos por WhatsApp</button>'+(pageState.contacto?.facebook?'<a class="btn" href="'+esc(pageState.contacto.facebook)+'" target="_blank" rel="noopener">Facebook</a>':'')+(pageState.contacto?.instagram?'<a class="btn" href="'+esc(pageState.contacto.instagram)+'" target="_blank" rel="noopener">Instagram</a>':'')+'</div></div></section>'+
      '<footer class="footer">Página 2.0 exportada · Dinamita POS</footer>'+
      '<button class="btn whatsapp floatingWa" data-action="wa-contact">WhatsApp</button>'+
      '<div class="detailOverlay '+(detail?'open':'')+'" data-action="close-detail"><div class="detailCard" onclick="event.stopPropagation()" style="position:relative"><button class="btn detailClose" data-action="close-detail">Cerrar</button><div class="detailMedia">'+(detail && detail.image?'<img src="'+esc(detail.image)+'" alt="'+esc(detail.name)+'">':'<div class="fallback">'+esc(initials(detail?detail.name:'P'))+'</div>')+'</div><div><div class="cat">'+esc(detail?detail.category:'General')+'</div><h2>'+(detail?esc(detail.name):'')+'</h2><div class="price">'+(detail?money(detail.price):'')+'</div><div class="small">Stock: '+(detail?Number(detail.stock||0):0)+'</div><p class="muted">SKU: '+(detail?esc(detail.sku||'Sin SKU'):'')+'</p><div class="actions"><button class="btn" data-action="add" data-id="'+esc(detail?detail.id:'')+'">Agregar al carrito</button><button class="btn primary" data-action="wa" data-id="'+esc(detail?detail.id:'')+'">Comprar por WhatsApp</button></div></div></div></div>'+
      '</div>'; }
    document.addEventListener('click', (e)=>{ const btn=e.target.closest('[data-action]'); if(!btn) return; const action=btn.getAttribute('data-action'); const id=btn.getAttribute('data-id'); const cat=btn.getAttribute('data-cat'); if(action==='cat'){ pageState.ui.selectedCategory=cat||'all'; render(); return; } if(action==='add' && id){ addToCart(id); return; } if(action==='plus' && id){ updateQty(id,1); return; } if(action==='minus' && id){ updateQty(id,-1); return; } if(action==='remove' && id){ removeFromCart(id); return; } if(action==='clear'){ clearCart(); return; } if(action==='send-cart'){ openWa(cartMessage()); return; } if(action==='wa-hero'){ openWa('Hola, quiero información del gym y sus productos.'); return; } if(action==='wa-contact'){ openWa('Hola, quiero información del gym y sus productos.'); return; } if(action==='scroll-contact'){ document.getElementById('contacto')?.scrollIntoView({behavior:'smooth'}); return; } if(action==='wa' && id){ const p=findProduct(id); if(p) openWa(productMessage(p)); return; } if(action==='detail' && id){ pageState.ui.detailId=id; render(); return; } if(action==='close-detail'){ pageState.ui.detailId=''; render(); return; } });
    document.addEventListener('input',(e)=>{ const el=e.target.closest('[data-action="search"]'); if(!el) return; pageState.ui.search=el.value||''; render(); });
    render();
  </script>
</body>
</html>`;
  }


  function bindPreviewActions(){
    refs.preview.addEventListener('click', (e)=>{
      const categoryBtn = e.target.closest('[data-page2-category]');
      if(categoryBtn){
        e.preventDefault();
        state.ui.selectedCategory = categoryBtn.getAttribute('data-page2-category') || 'all';
        renderPreview();
        return;
      }

      const ctaBtn = e.target.closest('[data-page2-cta]');
      if(ctaBtn){
        e.preventDefault();
        const cta = ctaBtn.getAttribute('data-page2-cta');
        if(cta === 'wa'){
          openWhatsAppMessage(ctaBtn.getAttribute('data-page2-msg') || 'Hola, me interesa información.');
        } else if(cta === 'ver'){
          const card = ctaBtn.closest('.page2-productCard');
          const title = card?.querySelector('h5')?.textContent || 'Producto';
          alert(`Vista rápida: ${title}`);
        }
        return;
      }

      const cartBtn = e.target.closest('[data-page2-cart-action]');
      if(cartBtn){
        e.preventDefault();
        const action = cartBtn.getAttribute('data-page2-cart-action');
        const productId = cartBtn.getAttribute('data-page2-product-id');
        if(action === 'add' && productId) addToCart(productId);
        if(action === 'plus' && productId) updateCartQty(productId, 1);
        if(action === 'minus' && productId) updateCartQty(productId, -1);
        if(action === 'remove' && productId) removeFromCart(productId);
        if(action === 'clear') clearCart();
        if(action === 'send') openWhatsAppMessage(buildCartWhatsAppMessage());
        return;
      }
    });

    refs.preview.addEventListener('input', (e)=>{
      const search = e.target.closest('[data-page2-search]');
      if(search){
        state.ui.search = search.value || '';
        renderPreview();
      }
    });
  }

  bindTabs();
  bindInputs();
  bindBannerUploads();
  bindPreviewActions();
  hydrate();
  renderPreview();
})();
