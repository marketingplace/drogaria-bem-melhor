import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
const dir=await mkdtemp(path.join(os.tmpdir(),'bem-melhor-test-'));
process.env.DATA_DIR=dir;process.env.ADMIN_EMAIL='owner@example.test';process.env.ADMIN_PASSWORD=randomBytes(20).toString('hex');process.env.NO_LISTEN='1';process.env.NODE_ENV='test';
const {server}=await import('./server.mjs');await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
async function call(p,body,cookie='',other={}){const res=await fetch(origin+p,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json','Origin':origin}:{}),...(cookie?{Cookie:cookie}:{}),...other},body:body?JSON.stringify(body):undefined});const d=await res.json();return {status:res.status,data:d,cookie:res.headers.get('set-cookie')?.split(';')[0]}}
try{
let r=await call('/api/store');assert.equal(r.status,200);assert.equal(r.data.products.length,6);assert.equal((await call('/api/store?admin=1')).status,403);assert.equal((await call('/api/store',{action:'product',product:{}})).status,401);
r=await call('/api/auth',{action:'login',email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD});assert.equal(r.status,200);const owner=r.cookie;assert.ok(owner);assert.equal((await call('/api/store?admin=1',null,owner)).data.user.role,'owner');
const customerPass=randomBytes(20).toString('hex');r=await call('/api/auth',{action:'register',name:'Cliente de teste',email:'client@example.test',password:customerPass});assert.equal(r.status,200);const customer=r.cookie;
assert.equal((await call('/api/store',{action:'settings',settings:{}},customer)).status,403);
const p=(await call('/api/store')).data.products[0];r=await call('/api/store',{action:'order',customer:{name:'Cliente de teste',phone:'94999999999'},fulfillment:'pickup',payment:'Pix na entrega',items:[{id:p.id,qty:1}],total:0},customer);assert.equal(r.status,200);assert.equal(r.data.order.total,p.price);const order=r.data.order;assert.equal((await call('/api/store')).data.products.find(x=>x.id===p.id).stock,p.stock-1);assert.equal((await call('/api/store',null,customer)).data.orders.length,1);
const pass=randomBytes(20).toString('hex');r=await call('/api/store',{action:'member',member:{name:'Entregador teste',email:'courier@example.test',role:'courier',password:pass}},owner);assert.equal(r.status,200);r=await call('/api/auth',{action:'login',email:'courier@example.test',password:pass});const courier=r.cookie;
r=await call('/api/store',{action:'updateOrder',id:order.id,status:'Saiu para entrega',courier:'courier@example.test'},owner);assert.equal(r.status,200);r=await call('/api/store?admin=1',null,courier);assert.equal(r.data.orders.length,1);assert.equal(r.data.orders[0].code,undefined);assert.equal(r.data.products.length,6);assert.equal(r.data.users.length,0);
assert.equal((await call('/api/store',{action:'updateOrder',id:order.id,status:'Entregue',code:'0000'},courier)).status,400);assert.equal((await call('/api/store',{action:'updateOrder',id:order.id,status:'Entregue',code:order.code},courier)).status,200);
assert.equal((await call('/api/store',{action:'removeMember',email:'owner@example.test'},owner)).status,400);assert.equal((await call('/api/store',{action:'toggleMember',email:'courier@example.test'},owner)).status,200);assert.equal((await call('/api/store?admin=1',null,courier)).status,403);
assert.equal((await call('/api/store',{action:'deleteProduct',id:p.id},owner,{Origin:'https://evil.example'})).status,403);
const form=new FormData();form.set('file',new File([await readFile(path.join(import.meta.dirname,'public/assets/logo.png'))],'logo.png',{type:'image/png'}));let response=await fetch(origin+'/api/media',{method:'POST',headers:{Cookie:owner,Origin:origin},body:form});assert.equal(response.status,200);const media=await response.json();assert.equal((await fetch(origin+media.url)).status,200);
const limited={...p,id:'limited',name:'Estoque teste',stock:1};assert.equal((await call('/api/store',{action:'product',product:limited},owner)).status,200);const orderBody={action:'order',customer:{name:'Cliente de teste',phone:'94999999999'},fulfillment:'pickup',payment:'Dinheiro',items:[{id:'limited',qty:1}]};const responses=await Promise.all(Array.from({length:4},()=>call('/api/store',orderBody,customer)));assert.equal(responses.filter(x=>x.status===200).length,1);const placed=responses.find(x=>x.status===200).data.order;assert.equal((await call('/api/store',{action:'updateOrder',id:placed.id,status:'Cancelado'},owner)).status,200);assert.equal((await call('/api/store',{action:'updateOrder',id:placed.id,status:'Cancelado'},owner)).status,400);assert.equal((await call('/api/store')).data.products.find(x=>x.id==='limited').stock,1);
assert.equal((await fetch(origin+'/assets/logo.png')).status,200);assert.equal((await fetch(origin+'/admin')).status,200);assert.equal((await fetch(origin+'/data/bem-melhor.sqlite')).status,404);
const wellness={...p,id:'wellness-test',name:'Produto de teste da seção',category:'Emagrecimento saudável',stock:3,restricted:true,wellness:false};
assert.equal((await call('/api/store',{action:'product',product:wellness},owner)).status,200);
let fresh=(await call('/api/store')).data;assert.ok(fresh.categories.includes('Emagrecimento saudável'));assert.equal(fresh.products.find(x=>x.id==='wellness-test').wellness,true);
assert.equal((await call('/api/store',{...orderBody,items:[{id:'wellness-test',qty:1}]},customer)).status,400);
assert.equal((await call('/api/store',{action:'product',product:{...p,wellness:true}},owner)).status,200);
fresh=(await call('/api/store')).data;assert.equal(fresh.products.find(x=>x.id===p.id).wellness,true);
assert.equal((await call('/api/store',{action:'settings',settings:{...fresh.settings,wellnessEnabled:false}},owner)).status,200);assert.equal((await call('/api/store')).data.settings.wellnessEnabled,false);
console.log('PASS: login, permissões, pedidos, estoque, upload, seção de emagrecimento, publicação por categoria ou seleção, visibilidade e bloqueio de checkout para itens de consulta.');
}finally{await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true})}
