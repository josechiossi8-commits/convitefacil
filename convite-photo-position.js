(()=>{
const preview=document.getElementById('preview'), photo=document.getElementById('previewPhoto'), spacer=document.getElementById('photoSpacer'), controls=document.getElementById('photoControls'), xInput=document.getElementById('photoX'), yInput=document.getElementById('photoY');
let px=50,py=30,pointer=null,dx=0,dy=0;
function apply(x,y){
 if(photo.hidden)return;
 const p=preview.getBoundingClientRect(), f=photo.getBoundingClientRect();
 if(!p.width||!p.height)return;
 const rx=Math.min(50,f.width/p.width*50),ry=Math.min(50,f.height/p.height*50);
 px=Math.max(rx,Math.min(100-rx,Number(x)));py=Math.max(ry,Math.min(100-ry,Number(y)));
 photo.style.left=px+'%';photo.style.top=py+'%';xInput.value=Math.round(px);yInput.value=Math.round(py);
 document.getElementById('result').hidden=true;
}
function reset(){const p=preview.getBoundingClientRect(),s=spacer.getBoundingClientRect();if(p.width&&p.height)apply((s.left+s.width/2-p.left)/p.width*100,(s.top+s.height/2-p.top)/p.height*100)}
window.setupPhotoPosition=()=>{spacer.hidden=false;controls.hidden=false;reset()};
window.clearPhotoPosition=()=>{spacer.hidden=true;controls.hidden=true;photo.style.left='';photo.style.top='';px=50;py=30};
xInput.addEventListener('input',()=>apply(xInput.value,py));yInput.addEventListener('input',()=>apply(px,yInput.value));document.getElementById('resetPhotoPosition').addEventListener('click',reset);
photo.addEventListener('dragstart',e=>e.preventDefault());
photo.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();pointer=e.pointerId;const r=photo.getBoundingClientRect();dx=e.clientX-(r.left+r.width/2);dy=e.clientY-(r.top+r.height/2);photo.setPointerCapture(pointer)});
photo.addEventListener('pointermove',e=>{if(pointer!==e.pointerId)return;const p=preview.getBoundingClientRect();apply((e.clientX-dx-p.left)/p.width*100,(e.clientY-dy-p.top)/p.height*100)});
function stop(e){if(pointer===e.pointerId)pointer=null}photo.addEventListener('pointerup',stop);photo.addEventListener('pointercancel',stop);
if(window.ResizeObserver)new ResizeObserver(()=>apply(px,py)).observe(preview);
})();