(() => {
  'use strict';
  const config = window.restaurantConfig;
  const $ = (selector) => document.querySelector(selector);
  const launcher=$('#host-launcher'), panel=$('#host-panel'), close=$('.host-close'), back=$('.host-back'), cartButton=$('.host-cart-button'), empty=$('.host-empty'), count=$('.host-cart-count'), log=$('.host-messages'), form=$('.host-compose'), input=$('#host-input');
  if (!config || !launcher || !panel) return;
  const money=new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0});
  const state={stage:'home',cart:[],draft:null,mayos:[],order:{}};
  const safe=(value,limit=180)=>String(value).replace(/[<>]/g,'').replace(/\s+/g,' ').trim().slice(0,limit);
  const units=()=>state.cart.reduce((sum,item)=>sum+item.quantity,0);
  const subtotal=()=>state.cart.reduce((sum,item)=>sum+item.unitPrice*item.quantity,0);
  const delivery=()=>state.order.modality==='Reparto'&&units()===1?config.delivery.oneUnit:0;
  const whatsapp=(text)=>`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(text)}`;
  function updateCount(){count.textContent=String(units());}
  function addMessage(text,type='bot'){
    const el=document.createElement('div');el.className=`host-message ${type}`;el.textContent=text;log.appendChild(el);log.scrollTop=log.scrollHeight;return el;
  }
  function actions(items){
    const wrap=document.createElement('div');wrap.className='host-actions';
    items.forEach(([label,action,primary])=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.action=action;if(primary)button.classList.add('primary');wrap.appendChild(button);});
    log.appendChild(wrap);log.scrollTop=log.scrollHeight;
  }
  function respond(text,items=[]){
    const typing=document.createElement('div');typing.className='host-typing';typing.setAttribute('aria-label','Escribiendo');typing.append(document.createElement('i'),document.createElement('i'),document.createElement('i'));log.appendChild(typing);log.scrollTop=log.scrollHeight;
    window.setTimeout(()=>{typing.remove();addMessage(text);if(items.length)actions(items);},320);
  }
  const homeActions=()=>[['Hacer un pedido','order',true],['Ver el menú','menu'],['Consultar reparto','delivery'],['Ver promociones','promos'],['Métodos de pago','payments'],['Hablar por WhatsApp','whatsapp']];
  function home(silent=false){state.stage='home';input.placeholder='Escribe tu consulta…';if(!silent)respond('¿Qué deseas hacer?',homeActions());}
  function open(){panel.hidden=false;panel.setAttribute('aria-hidden','false');launcher.setAttribute('aria-expanded','true');input.focus();}
  function closePanel(){panel.hidden=true;panel.setAttribute('aria-hidden','true');launcher.setAttribute('aria-expanded','false');launcher.focus();}
  function productButtons(){return config.products.map(p=>[`${p.name} · ${money.format(p.price)}`,`product:${p.id}`]);}
  function showMenu(){respond(`Nuestro menú actual incluye:\n${config.products.map(p=>`• ${p.name} — ${money.format(p.price)}`).join('\n')}\n\nLas pastas se preparan frescas y a mano. Tiempo aproximado: ${config.preparationMinutes} minutos.`,[['Hacer un pedido','order',true],['Métodos de pago','payments']]);}
  function paymentText(){const p=config.payments;return `Aceptamos efectivo y transferencia.\n\nTRANSFERENCIA\nTitular: ${p.titular}\nRUT: ${p.rut}\nBanco: ${p.bank}\nTipo: ${p.accountType}\nCuenta: ${p.account}\nCorreo: ${p.email}\n\nEnvía el comprobante por WhatsApp. El pedido se confirma cuando recibimos el comprobante y validamos disponibilidad y horario.`;}
  function chooseProduct(id){
    const product=config.products.find(p=>p.id===id);state.draft={product,options:{},unitPrice:product.price};respond(`${product.name}. ${product.description}\nPrecio base: ${money.format(product.price)}.`);
    window.setTimeout(()=>{if(product.category==='pasta'){state.stage='dough';actions(config.doughs.map(d=>[d.name,`dough:${d.name}`]));}else{state.stage='protein';actions(config.proteins.map(p=>[p,`protein:${p}`]));}},350);
  }
  function quantity(){state.stage='quantity';respond('¿Cuántas unidades deseas agregar?',[['1','qty:1'],['2','qty:2'],['3','qty:3'],['4','qty:4'],['5','qty:5']]);}
  function addDraft(quantity){state.cart.push({...state.draft,quantity});state.draft=null;updateCount();state.stage='added';respond('Producto agregado al pedido. ¿Deseas agregar algo más?',[['Agregar otro producto','order'],['Ver carrito','cart'],['Continuar con mis datos','checkout',true]]);}
  function renderCart(){
    log.querySelectorAll('.host-cart').forEach(el=>el.remove());const box=document.createElement('section');box.className='host-cart';box.setAttribute('aria-label','Carrito del pedido');const title=document.createElement('h3');title.textContent='Tu pedido';box.appendChild(title);
    if(!state.cart.length){const p=document.createElement('p');p.textContent='Tu pedido está vacío.';box.appendChild(p);}
    state.cart.forEach((item,index)=>{const row=document.createElement('div');row.className='host-cart-row';const info=document.createElement('div');const strong=document.createElement('strong');strong.textContent=`${item.quantity} × ${item.product.name}`;const small=document.createElement('small');small.textContent=`${Object.values(item.options).filter(Boolean).join(' · ')} · ${money.format(item.unitPrice*item.quantity)}`;info.append(strong,small);const controls=document.createElement('div');controls.className='host-cart-actions';[['−',-1],['+',1],['×',0]].forEach(([label,delta])=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.cart=String(index);b.dataset.delta=String(delta);b.setAttribute('aria-label',delta===0?`Eliminar ${item.product.name}`:`${delta>0?'Aumentar':'Disminuir'} cantidad de ${item.product.name}`);controls.appendChild(b);});row.append(info,controls);box.appendChild(row);});
    if(state.cart.length){const total=document.createElement('div');total.className='host-total';total.append(document.createTextNode('Subtotal'),document.createTextNode(money.format(subtotal())));box.appendChild(total);}log.appendChild(box);actions(state.cart.length?[['Agregar producto','order'],['Continuar','checkout',true]]:[['Hacer un pedido','order',true]]);log.scrollTop=log.scrollHeight;
  }
  function orderText(){
    const o=state.order, lines=['🍝 NUEVO PEDIDO WEB — EL PORTÓN','',`Cliente: ${o.name}`,`Modalidad: ${o.modality}`,`Dirección o sector: ${o.modality==='Reparto'?`${o.address}, ${o.sector}${o.reference?` (${o.reference})`:''}`:'Retiro por coordinar'}`,`Horario solicitado: ${o.schedule}`,'','PEDIDO:'];
    state.cart.forEach(item=>{lines.push(`• ${item.quantity} × ${item.product.name}`);Object.entries(item.options).forEach(([key,value])=>{if(value)lines.push(`- ${key}: ${value}`);});lines.push(`- Valor: ${money.format(item.unitPrice*item.quantity)}`);});
    lines.push('',`Subtotal: ${money.format(subtotal())}`,`Reparto estimado: ${money.format(delivery())}`,`TOTAL ESTIMADO: ${money.format(subtotal()+delivery())}`,'',`Forma de pago: ${o.payment}`,`Observaciones: ${o.notes||'Sin observaciones'}`,'',`Preparación aproximada: ${config.preparationMinutes} minutos. Pastas frescas elaboradas a mano.`);
    if(o.payment==='Transferencia')lines.push('',`TRANSFERENCIA`,`Titular: ${config.payments.titular}`,`RUT: ${config.payments.rut}`,`Banco: ${config.payments.bank}`,`Cuenta Vista: ${config.payments.account}`,`Correo: ${config.payments.email}`,'Envía el comprobante por este WhatsApp. El pedido se confirma después de recibirlo y validar disponibilidad y horario.');
    lines.push('',`Pedido generado desde:\n${config.siteUrl}`,'','Pendiente de confirmación por El Portón.');return lines.join('\n');
  }
  function review(){state.stage='review';respond(`Revisa antes de continuar:\n\n${orderText()}`,[['Editar pedido / carrito','cart'],['Confirmar y enviar por WhatsApp','confirm',true]]);}
  function handleText(raw){const text=safe(raw);if(!text)return;addMessage(text,'user');
    if(state.stage==='name'){state.order.name=text.slice(0,60);state.stage='modality';return respond('¿Cómo deseas coordinarlo?',[['Reparto','modality:Reparto'],['Retiro (por confirmar)','modality:Retiro']]);}
    if(state.stage==='sector'){state.order.sector=text;state.stage='address';return respond('Escribe la dirección para el reparto.');}
    if(state.stage==='address'){state.order.address=text;state.stage='reference';return respond('Agrega una referencia breve o escribe “sin referencia”.');}
    if(state.stage==='reference'){state.order.reference=/^sin/i.test(text)?'':text;state.stage='schedule';return respond(`¿Para qué horario lo deseas? Considera aproximadamente ${config.preparationMinutes} minutos de preparación artesanal.`);}
    if(state.stage==='schedule'){state.order.schedule=text;state.stage='payment';return respond('¿Cómo deseas pagar?',[['Efectivo','payment:Efectivo'],['Transferencia','payment:Transferencia']]);}
    if(state.stage==='notes'){state.order.notes=/^(no|sin)/i.test(text)?'':text;return review();}
    const normalized=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    if(/precio|valor|cuanto|menu|que venden|que tienen/.test(normalized))return showMenu();
    if(/pago|transfer|efectivo|cuenta|rut|comprobante|voucher|bauche/.test(normalized))return respond(paymentText(),[['Hacer un pedido','order',true]]);
    if(/reparto|delivery|despacho|envio/.test(normalized))return respond(`Repartimos en ${config.delivery.area}. Gratis desde 2 unidades; una unidad cuesta ${money.format(config.delivery.oneUnit)}. Cobertura sujeta a confirmación.`);
    if(/hora|demora|tarda|prepar/.test(normalized))return respond(`Cada pedido tarda aproximadamente ${config.preparationMinutes} minutos porque las pastas se hacen frescas y a mano. Nada se deja preparado de un día para otro.`);
    if(/alerg/.test(normalized))return respond('Consulta directamente al negocio antes de confirmar: puede existir contaminación cruzada.');
    if(/pedido|pedir|ordenar/.test(normalized))return handleAction('order');
    respond('No quiero darte información incorrecta. Puedo ayudarte con el menú, reparto, pagos o preparar tu pedido para WhatsApp.',homeActions());
  }
  function handleAction(action){
    if(action==='home')return home();if(action==='menu')return showMenu();if(action==='delivery')return respond(`Reparto en ${config.delivery.area}: gratis desde 2 unidades y ${money.format(config.delivery.oneUnit)} para una unidad. Tiempo de preparación aproximado: ${config.preparationMinutes} minutos.`);if(action==='promos')return respond('5% reservando el día anterior y pagando por transferencia. En el quinto pedido, 50% en un plato a elección. Condiciones sujetas a confirmación.');if(action==='payments')return respond(paymentText(),[['Hacer un pedido','order',true]]);if(action==='whatsapp')return window.open(whatsapp('Hola El Portón Pastas, quiero hacer una consulta.'),'_blank','noopener');
    if(action==='order'){state.stage='product';return respond('¿Qué deseas agregar?',productButtons());}if(action.startsWith('product:'))return chooseProduct(action.split(':')[1]);
    if(action.startsWith('dough:')){const name=action.slice(6),d=config.doughs.find(x=>x.name===name);state.draft.options.Masa=name;state.draft.unitPrice=d.price;return quantity();}
    if(action.startsWith('protein:')){state.draft.options.Proteína=action.slice(8);state.mayos=[];state.stage='mayo';return respond('El bowl incluye 2 mayonesas. Elige la primera.',config.mayos.map(m=>[m,`mayo:${m}`]));}
    if(action.startsWith('mayo:')){const mayo=action.slice(5);if(!state.mayos.includes(mayo))state.mayos.push(mayo);if(state.mayos.length<2)return respond('Ahora elige la segunda mayonesa.',config.mayos.filter(m=>!state.mayos.includes(m)).map(m=>[m,`mayo:${m}`]));state.draft.options.Mayonesas=state.mayos.join(' y ');return quantity();}
    if(action.startsWith('qty:'))return addDraft(Number(action.slice(4)));if(action==='cart')return renderCart();if(action==='checkout'){if(!state.cart.length)return respond('Tu pedido está vacío.',[['Hacer un pedido','order',true]]);state.stage='name';return respond('¿A nombre de quién preparamos la solicitud?');}
    if(action.startsWith('modality:')){state.order.modality=action.slice(9);if(state.order.modality==='Reparto'){state.stage='sector';return respond(`Escribe tu sector dentro de ${config.delivery.area}.`);}state.stage='schedule';return respond(`¿Para qué horario lo deseas? Considera aproximadamente ${config.preparationMinutes} minutos de preparación artesanal.`);}
    if(action.startsWith('payment:')){state.order.payment=action.slice(8);state.stage='notes';return respond(`${state.order.payment==='Transferencia'?paymentText()+'\n\n':''}¿Deseas agregar una observación? Escribe “no” si no tienes.`);}
    if(action==='confirm'){window.open(whatsapp(orderText()),'_blank','noopener');return addMessage('WhatsApp se abrió con tu solicitud. El pedido queda pendiente hasta recibir el comprobante cuando corresponda y confirmar disponibilidad y horario.','note');}
  }
  launcher.addEventListener('click',open);close.addEventListener('click',closePanel);back.addEventListener('click',()=>home());cartButton.addEventListener('click',renderCart);empty.addEventListener('click',()=>{if(state.cart.length&&window.confirm('¿Vaciar todo el pedido?')){state.cart=[];updateCount();renderCart();}});
  log.addEventListener('click',event=>{const button=event.target.closest('button');if(button?.dataset.action)handleAction(button.dataset.action);if(button?.dataset.cart!==undefined){const index=Number(button.dataset.cart),delta=Number(button.dataset.delta);if(delta===0)state.cart.splice(index,1);else{state.cart[index].quantity+=delta;if(state.cart[index].quantity<1)state.cart.splice(index,1);}updateCount();renderCart();}});
  form.addEventListener('submit',event=>{event.preventDefault();const value=input.value;input.value='';handleText(value);});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)closePanel();});
  addMessage('¡Hola! Soy el asistente virtual de El Portón Pastas. Puedo mostrarte nuestro menú, responder consultas y preparar tu pedido para enviarlo por WhatsApp. ¿Qué deseas hacer?');actions(homeActions());updateCount();
})();
