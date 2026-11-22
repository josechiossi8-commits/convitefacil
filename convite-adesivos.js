(() => {
  const preview = document.getElementById('preview');
  const list = document.getElementById('stickerList');
  const result = document.getElementById('result');
  const stickers = [];
  let sequence = 0;
  const invalidate = () => { result.hidden = true; };
  function position(item, x, y) {
    const p = preview.getBoundingClientRect(), r = item.el.getBoundingClientRect();
    if (!p.width || !p.height) return;
    const hx = Math.min(50, r.width / p.width * 50), hy = Math.min(50, r.height / p.height * 50);
    item.x = Math.max(hx, Math.min(100 - hx, x));
    item.y = Math.max(hy, Math.min(100 - hy, y));
    item.el.style.left = item.x + '%'; item.el.style.top = item.y + '%';
  }
  document.querySelectorAll('[data-sticker]').forEach(button => button.addEventListener('click', () => {
    const emoji = button.dataset.sticker, name = button.dataset.name, id = ++sequence;
    const el = document.createElement('span');
    el.className = 'sticker'; el.textContent = emoji; el.tabIndex = 0;
    el.setAttribute('role', 'img'); el.setAttribute('aria-label', name + ' ' + id + ', arraste ou use as setas para mover');
    preview.appendChild(el);
    const item = {el, emoji, x: 50, y: 20}; stickers.push(item);
    position(item, 25 + ((id - 1) % 4) * 16, 20 + Math.floor((id - 1) % 3) * 9);
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'secondary sticker-remove';
    remove.textContent = 'Remover ' + emoji + ' ' + id; remove.setAttribute('aria-label', 'Remover adesivo ' + name + ' ' + id);
    list.appendChild(remove);
    remove.addEventListener('click', () => { stickers.splice(stickers.indexOf(item), 1); el.remove(); remove.remove(); invalidate(); });
    let active = null;
    el.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault(); const r = el.getBoundingClientRect();
      active = {id:e.pointerId, dx:e.clientX-(r.left+r.width/2), dy:e.clientY-(r.top+r.height/2)};
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', e => {
      if (!active || active.id !== e.pointerId) return;
      const p = preview.getBoundingClientRect();
      position(item, (e.clientX-active.dx-p.left)/p.width*100, (e.clientY-active.dy-p.top)/p.height*100); invalidate();
    });
    const stop = e => { if (active && active.id === e.pointerId) active = null; };
    el.addEventListener('pointerup', stop); el.addEventListener('pointercancel', stop);
    el.addEventListener('keydown', e => {
      const dirs = {ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]};
      if (!dirs[e.key]) return; e.preventDefault(); position(item, item.x+dirs[e.key][0], item.y+dirs[e.key][1]); invalidate();
    });
    invalidate();
  }));
  if (window.ResizeObserver) new ResizeObserver(() => stickers.forEach(s => position(s, s.x, s.y))).observe(preview);
  window.drawPreviewStickers = (ctx, canvas) => {
    const p = preview.getBoundingClientRect(); if (!p.width || !p.height) throw Error('Prévia indisponível');
    ctx.save(); ctx.scale(canvas.width/p.width, canvas.height/p.height);
    ctx.beginPath(); ctx.rect(0, 0, p.width, p.height); ctx.clip();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const item of stickers) {
      const r = item.el.getBoundingClientRect(), style = getComputedStyle(item.el);
      ctx.font = style.fontSize + ' ' + style.fontFamily;
      ctx.fillText(item.emoji, r.left + r.width/2 - p.left, r.top + r.height/2 - p.top);
    }
    ctx.restore();
  };
})();

;(()=>{const body=document.body,loading=document.getElementById('loading-screen');body.classList.add('choosing-mode');const chooser=document.createElement('div');chooser.id='mode-screen';chooser.hidden=true;chooser.setAttribute('role','dialog');chooser.setAttribute('aria-modal','true');chooser.setAttribute('aria-labelledby','mode-title');chooser.innerHTML='<div class="mode-card"><h2 id="mode-title">Que modo você deseja?</h2><div class="mode-actions"><button type="button" id="mode-light">Claro</button><button type="button" id="mode-dark">Escuro</button></div></div>';body.appendChild(chooser);const first=document.getElementById('mode-light'),last=document.getElementById('mode-dark');let shown=false;function show(){if(!loading.hidden||shown)return;shown=true;chooser.hidden=false;first.focus()}new MutationObserver(show).observe(loading,{attributes:true,attributeFilter:['hidden']});show();function select(mode){body.dataset.mode=mode;body.classList.remove('choosing-mode');chooser.hidden=true;const title=document.querySelector('h1');title.tabIndex=-1;title.focus({preventScroll:true})}first.addEventListener('click',()=>select('light'));last.addEventListener('click',()=>select('dark'));chooser.addEventListener('keydown',e=>{if(e.key==='Tab'){if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}})})();
