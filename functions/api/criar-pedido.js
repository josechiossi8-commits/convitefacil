import {guard,authorized,readJson,reply,validRef,validId,validMoney,validCheckout,sign} from '../_seguranca.js';
export async function onRequestPost({request,env}) {
  const error=guard(request,env); if(error) return error;
  if(!await authorized(request,env)) return reply({error:'Não autorizado'},401);
  let data; try { data=await readJson(request); } catch {return reply({error:'Dados inválidos'},400);}
  const ref='cftest-'+data.attempt_id; if(!validRef(ref)) return reply({error:'Tentativa inválida'},400);
  try {
    const r=await fetch('https://api.mercadopago.com/v1/orders',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+env.MP_TEST_ACCESS_TOKEN,'X-Idempotency-Key':data.attempt_id},body:JSON.stringify({type:'online',processing_mode:'manual',total_amount:'5.00',external_reference:ref,items:[{title:'Convite digital - teste',quantity:1,unit_price:'5.00'}]})});
    if(!r.ok) return reply({error:'Não foi possível criar o pedido de teste'},502);
    const order=await r.json();
    if(!validId(order.id)||order.external_reference!==ref||!validMoney(order)||!validCheckout(order.checkout_url)) return reply({error:'Resposta divergente do Mercado Pago'},502);
    return reply({checkout_url:order.checkout_url,receipt:await sign(env,order.id,ref),order_id:order.id});
  } catch {return reply({error:'Pagamento de teste indisponível'},502);}
}
