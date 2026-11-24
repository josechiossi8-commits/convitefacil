// Protótipo de laboratório; não pronto para produção.
const enc = new TextEncoder();
export const HEADERS = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export const reply = (data, status=200) => new Response(JSON.stringify(data), {status,headers:HEADERS});
export function guard(request, env) {
  const secret=env.TEST_ACCESS_SECRET, token=env.MP_TEST_ACCESS_TOKEN_PAI;
  if (typeof secret !== 'string' || secret.length < 32 || typeof token !== 'string' || !token || secret === token || env.MP_TEST_CONFIRMED !== 'yes') return reply({error:'Teste não configurado'},503);
  if (request.headers.get('Origin') !== new URL(request.url).origin || !/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') || '')) return reply({error:'Origem ou formato inválido'},403);
  return null;
}
export async function authorized(request, env) {
  // Comparar hashes de comprimento fixo antes de liberar o endpoint.
  const given = request.headers.get('Authorization') || '';
  const expected = 'Bearer '+env.TEST_ACCESS_SECRET;
  const [a,b]=await Promise.all([crypto.subtle.digest('SHA-256',enc.encode(given)),crypto.subtle.digest('SHA-256',enc.encode(expected))]);
  const x=new Uint8Array(a), y=new Uint8Array(b); let diff=0; for(let i=0;i<x.length;i++) diff|=x[i]^y[i]; return diff===0;
}
export async function readJson(request) {
  const text=await request.text(); if(text.length>4096) throw new Error('oversize');
  const data=JSON.parse(text); if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('invalid'); return data;
}
const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
export async function sign(env, id, ref) {
  const msg=b64url(enc.encode(JSON.stringify({id,ref}))); const key=await crypto.subtle.importKey('raw',enc.encode(env.TEST_ACCESS_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return msg+'.'+b64url(new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(msg))));
}
export async function verify(env, receipt) {
  try { if(typeof receipt!=='string'||receipt.length>1024) return null; const [msg,sig,extra]=receipt.split('.'); if(extra||!msg||!sig) return null;
    const key=await crypto.subtle.importKey('raw',enc.encode(env.TEST_ACCESS_SECRET),{name:'HMAC',hash:'SHA-256'},false,['verify']);
    const raw=Uint8Array.from(atob(sig.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
    if(!await crypto.subtle.verify('HMAC',key,raw,enc.encode(msg))) return null;
    const o=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(msg.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))));
    return validId(o.id)&&validRef(o.ref)?o:null;
  } catch{return null;}
}
export const validId = id => typeof id==='string' && /^ORD[A-Za-z0-9_-]{3,90}$/.test(id);
export const validRef = ref => typeof ref==='string' && /^cftest-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ref);
export const validMoney = o => typeof o.total_amount==='string' && /^5(?:\.0{1,2})?$/.test(o.total_amount) && o.currency==='BRL';
export function validCheckout(value) { try { const u=new URL(value); return u.protocol==='https:' && u.hostname==='www.mercadopago.com.br' && !u.port && !u.username && !u.password && u.pathname==='/checkout/v1/redirect'; } catch {return false;} }
