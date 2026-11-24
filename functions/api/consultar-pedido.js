import {guard,authorized,readJson,reply,verify,validMoney} from '../_seguranca.js';
export async function onRequestPost({request,env}) {
  const error=guard(request,env); if(error) return error;
  if(!await authorized(request,env)) return reply({error:'Não autorizado'},401);
  let data; try {data=await readJson(request);} catch {return reply({error:'Dados inválidos'},400);}
  const saved=await verify(env,data.receipt); if(!saved) return reply({error:'Comprovante inválido'},400);
  try {
    const r=await fetch('https://api.mercadopago.com/v1/orders/'+encodeURIComponent(saved.id),{headers:{'Authorization':'Bearer '+env.MP_TEST_ACCESS_TOKEN_PAI,'Accept':'application/json'}});
    if(!r.ok) return reply({error:'Não foi possível consultar o pedido'},502);
    const order=await r.json();
    if(order.id!==saved.id||order.external_reference!==saved.ref||!validMoney(order)||typeof order.status!=='string'||!/^[a-z_]{1,40}$/.test(order.status)) return reply({error:'Dados do pedido divergentes'},502);
    return reply({order_id:order.id,status:order.status,status_detail:typeof order.status_detail==='string' && /^[a-z_]{1,40}$/.test(order.status_detail)?order.status_detail:null,total_amount:'5.00',currency:'BRL'});
  } catch {return reply({error:'Consulta de teste indisponível'},502);}
}
