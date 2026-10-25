/* ===== 3D: papan bertema, kartu, HP bar animasi, koin damage, VFX ===== */
const $=id=>document.getElementById(id);
const cvs=$('cv'),scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(32,1,1.5,90),ren=new THREE.WebGLRenderer({canvas:cvs,antialias:true});
ren.setPixelRatio(Math.min(devicePixelRatio||1,2));ren.setClearColor(0x2a6fb0);
const ctex=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t};
const rr=(x,a,b,w,h,r)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()};
const FONT='ui-rounded,system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif';
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const TL=new THREE.TextureLoader(),TX={};
const cardTex=c=>{if(!TX[c.img]){const t=TL.load(IMG[c.img]);t.anisotropy=4;TX[c.img]=t}return TX[c.img]};
const BACKT=ctex(252,352,(x,w,h)=>{rr(x,0,0,w,h,16);const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#2563eb');g.addColorStop(1,'#1e1b4b');x.fillStyle=g;x.fill();rr(x,9,9,w-18,h-18,11);x.lineWidth=4;x.strokeStyle='#fde68a';x.stroke();
 x.beginPath();x.arc(w/2,h/2,48,0,7);x.lineWidth=7;x.strokeStyle='#fde68a';x.stroke();x.beginPath();x.moveTo(w/2-48,h/2);x.lineTo(w/2+48,h/2);x.stroke();x.beginPath();x.arc(w/2,h/2,13,0,7);x.fillStyle='#fde68a';x.fill()});
const GEO=new THREE.PlaneGeometry(1,1.4);
/* ---------- tata letak: HP (portrait, ala Pocket) & desktop (landscape) dipisah ---------- */
let BENCHN=5;
const L_PORT={act:m=>[0,1.55*m,1.15],ben:(i,m)=>{const n=BENCHN,big=n>5;return[(i-(n-1)/2)*(big?.74:1.2),3.62*m,big?.7:.98]},pri:(i,m)=>[-m*(2.55-(i%3)*.5),(1.18+((i/3)|0)*.64)*m,.46],dk:m=>[m*1.5,1.55*m,.7],dis:m=>[m*2.4,1.55*m,.7],stad:[-1.95,0,.55],
 W:6.3,Hg:10.9,elev:1.5,zc:.15,hs:1.3,ohs:.7,hvis:1,ovis:.45,hsp:1.05,
 labels:T=>{for(const m of[1,-1]){T('ACTIVE',0,.36*m,'center',11);T('BENCH',-2.25,2.68*m,'center',11);T('PRIZE',-2.05,.7*m,'center',10);T('DECK',1.5,2.15*m,'center',10);T('DISCARD',2.4,2.1*m,'center',9);T('TRASH',2.4,2.28*m,'center',9)}T('STADIUM',2.35,0,'center',10)}};
const L_LAND={act:m=>[0,1.6*m,1.3],ben:(i,m)=>{const n=BENCHN,big=n>5;return[(i-(n-1)/2)*(big?.99:1.32),3.72*m,big?.9:1.06]},pri:(i,m)=>[-m*(4.35-(i%2)*.58),(.95+(i>>1)*.86)*m,.56],dk:m=>[m*4.25,1.95*m,.8],dis:m=>[m*4.25,3.4*m,.8],stad:[-3.6,0,.7],
 W:10.6,Hg:10.5,elev:1.25,zc:.15,hs:1.7,ohs:.8,hvis:.64,ovis:.5,hsp:1.3,
 labels:T=>{for(const m of[1,-1]){T('ACTIVE',-1.2,1.6*m,'right',13);T('BENCH',-3.75,3.72*m,'center',13);T('PRIZE',-4.05,.5*m,'center',12);T('DECK',4.25,1.28*m,'center',12);T('DISCARD',4.25,4.12*m,'center',11);T('TRASH',4.25,4.32*m,'center',11)}T('STADIUM',4.1,0,'center',12)}};
let LAY=L_PORT,LAYMODE=null;
const Z={act:m=>LAY.act(m),ben:(i,m)=>LAY.ben(i,m),pri:(i,m)=>LAY.pri(i,m),dk:m=>LAY.dk(m),dis:m=>LAY.dis(m)};
/* ---------- tema arena ---------- */
const LMC={};const LM=c=>LMC[c]||(LMC[c]=new THREE.MeshLambertMaterial({color:c}));
scene.add(new THREE.AmbientLight(0xffffff,.85));{const dl=new THREE.DirectionalLight(0xffffff,.55);dl.position.set(4,10,6);scene.add(dl)}
function slotsAndLabels(x){
 x.strokeStyle='#ffffffd0';x.lineCap='butt';x.lineWidth=3.5;
 const dashEdge=(x0,y0,x1,y1)=>{const L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.round((L+9)/23)),d=(L-(n-1)*9)/n,ux=(x1-x0)/L,uy=(y1-y0)/L;for(let i=0;i<n;i++){const a=i*(d+9),b=a+d;x.beginPath();x.moveTo(x0+ux*a,y0+uy*a);x.lineTo(x0+ux*b,y0+uy*b);x.stroke()}};
 const P=([cx,cz,s])=>{const ww=50*s,hh=70*s,l=(cx+15)*50-ww/2,t=(cz+12)*50-hh/2;dashEdge(l,t,l+ww,t);dashEdge(l+ww,t,l+ww,t+hh);dashEdge(l+ww,t+hh,l,t+hh);dashEdge(l,t+hh,l,t)};
 for(const m of[1,-1]){P(Z.act(m));for(let i=0;i<BENCHN;i++)P(Z.ben(i,m));P(Z.dk(m));P(Z.dis(m));for(let i=0;i<6;i++)P(Z.pri(i,m))}P(LAY.stad);
 x.setLineDash([]);x.lineWidth=4;const hw=LAY.W/2+3;x.beginPath();x.moveTo((15-hw)*50,600);x.lineTo(14.2*50,600);x.moveTo(15.8*50,600);x.lineTo((15+hw)*50,600);x.stroke();x.beginPath();x.arc(750,600,34,0,7);x.stroke();x.beginPath();x.arc(750,600,10,0,7);x.stroke();
 const T=(t,X,Zz,al,sz)=>{x.font='800 '+(sz||12)*1.6+'px '+FONT;x.textAlign=al||'center';x.textBaseline='middle';x.lineWidth=4;x.strokeStyle='#0b2236cc';x.fillStyle='#ffffffe6';const px=(X+15)*50,pz=(Zz+12)*50;x.strokeText(t,px,pz);x.fillText(t,px,pz)};
 void T}
const THEMES=[
 {n:'Meja Sekolah',clear:0x8f6236,draw:(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#bf8a53');g.addColorStop(1,'#a56d3a');x.fillStyle=g;x.fillRect(0,0,w,h);const r=rng(7);
   for(let i=0;i<280;i++){x.strokeStyle=`rgba(90,50,20,${.04+r()*.08})`;x.lineWidth=1+r()*2;const y=r()*h;x.beginPath();x.moveTo(0,y);x.bezierCurveTo(w*.3,y+r()*16-8,w*.6,y+r()*16-8,w,y+r()*12-6);x.stroke()}
   x.fillStyle='#3f7d5a';rr(x,750-340,600-440,680,880,26);x.fill();x.strokeStyle='#e6f3e9aa';x.lineWidth=3;x.setLineDash([12,9]);rr(x,750-328,600-428,656,856,20);x.stroke();x.setLineDash([]);
   x.strokeStyle='rgba(255,255,255,.07)';x.lineWidth=2;for(let i=0;i<w;i+=50){x.beginPath();x.moveTo(i,150);x.lineTo(i,h-150);x.stroke()}}},
 {n:'Papan Tulis',clear:0x1d3329,draw:(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#2b4a3e');g.addColorStop(1,'#1d3329');x.fillStyle=g;x.fillRect(0,0,w,h);const r=rng(13);
   for(let i=0;i<260;i++){const px=r()*w,py=r()*h;if(Math.abs((px-750)/50)<6.6&&Math.abs((py-600)/50)<7.8){r();r();r();continue}x.fillStyle=`rgba(255,255,255,${.015+r()*.04})`;x.beginPath();x.ellipse(px,py,30+r()*140,6+r()*18,r()*3,0,7);x.fill()}
   x.fillStyle='rgba(255,255,255,.2)';x.font='700 60px "Comic Sans MS",ui-rounded,system-ui';const doodles=['E = mc²','2 + 2 = 4','★','a² + b² = c²','π ≈ 3.14','✎','10 × 10','♪'];for(let i=0;i<22;i++){const px=r()<.5?r()*330:w-r()*330,py=r()*h;x.save();x.translate(px,py);x.rotate((r()-.5)*.4);x.fillText(doodles[i%doodles.length],0,0);x.restore()}
   x.strokeStyle='#8a5a2d';x.lineWidth=46;x.strokeRect(0,0,w,h)}},
 {n:'Meja Cafe',clear:0xcfa87a,draw:(x,w,h)=>{x.fillStyle='#f5ecdc';x.fillRect(0,0,w,h);x.fillStyle='rgba(200,70,60,.22)';for(let i=0;i<w;i+=75)x.fillRect(i,0,37,h);for(let j=0;j<h;j+=75)x.fillRect(0,j,w,37);
   const g=x.createRadialGradient(750,600,200,750,600,900);g.addColorStop(0,'rgba(255,240,210,.0)');g.addColorStop(1,'rgba(120,70,30,.28)');x.fillStyle=g;x.fillRect(0,0,w,h)}},
 {n:'Lantai Rumah',clear:0xb98a55,draw:(x,w,h)=>{const r=rng(31),cols=['#c89a62','#bb8c55','#d1a672','#c29259'];
   for(let j=0,ph=0;j<h;j+=100,ph++){let px=-(ph%3)*140;while(px<w){const pw=300+r()*180;x.fillStyle=cols[(r()*4)|0];x.fillRect(px,j,pw-3,97);x.strokeStyle='rgba(70,40,15,.18)';x.lineWidth=2;x.strokeRect(px,j,pw-3,97);px+=pw}}
   x.fillStyle='#ece0c9';rr(x,750-360,600-450,720,900,40);x.fill();x.strokeStyle='#cdbb98';x.lineWidth=10;rr(x,750-340,600-430,680,860,30);x.stroke();x.lineWidth=3;for(let i=-3;i<=3;i++){x.beginPath();x.moveTo(750-330,600+i*120);x.lineTo(750+330,600+i*120);x.stroke()}}},
 {n:'Mode Latihan',clear:0x0e1626,draw:(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0e1626');g.addColorStop(.5,'#1a2742');g.addColorStop(1,'#0e1626');x.fillStyle=g;x.fillRect(0,0,w,h);
   x.strokeStyle='rgba(80,220,255,.16)';x.lineWidth=2;for(let i=0;i<=w;i+=100){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke()}for(let j=0;j<=h;j+=100){x.beginPath();x.moveTo(0,j);x.lineTo(w,j);x.stroke()}
   x.strokeStyle='rgba(80,220,255,.34)';x.lineWidth=4;for(let i=0;i<=w;i+=500){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke()}for(let j=0;j<=h;j+=400){x.beginPath();x.moveTo(0,j);x.lineTo(w,j);x.stroke()}
   x.strokeStyle='rgba(255,160,60,.2)';x.lineWidth=6;x.beginPath();x.arc(750,600,330,0,7);x.stroke();x.beginPath();x.arc(750,600,500,0,7);x.stroke();
   x.fillStyle='rgba(120,230,255,.1)';x.font='900 120px ui-rounded,system-ui,sans-serif';x.textAlign='center';x.fillText('TRAINING',750,140);x.fillText('TRAINING',750,1110)}}];
const mat=new THREE.Mesh(new THREE.PlaneGeometry(30,24),new THREE.MeshBasicMaterial({polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:2}));mat.rotation.x=-Math.PI/2;scene.add(mat);
let propsG=null,themeCur=0;
function buildProps(k,seed){
 const g=new THREE.Group(),r=rng(seed);
 const ok=(x,z)=>Math.abs(x)>5.9||Math.abs(z)>7.4;
 const spot=(n,fn,xr=14,zr=11)=>{let c=0,t=0;while(c<n&&t++<n*40){const x=(r()*2-1)*xr,z=(r()*2-1)*zr;if(ok(x,z)){fn(x,z);c++}}};
 const add=(geo,m,x,y,z,rx,ry,rz)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);if(rx)o.rotation.x=rx;if(ry)o.rotation.y=ry;if(rz)o.rotation.z=rz;g.add(o);return o};
 const BM=c=>new THREE.MeshBasicMaterial({color:c});
 if(k==='Meja Sekolah'){
  spot(8,(x,z)=>{const a=r()*3;add(new THREE.CylinderGeometry(.07,.07,1.7,6),LM([0xf4c430,0x4aa3df,0xe0566b][r()*3|0]),x,.07,z,0,a,Math.PI/2);add(new THREE.ConeGeometry(.07,.25,6),LM(0xe8c9a0),x+Math.cos(a)*.98,.07,z-Math.sin(a)*.98,0,a,-Math.PI/2)});
  spot(5,(x,z)=>add(new THREE.BoxGeometry(.7,.22,.38),LM(0xf49ac2),x,.11,z,0,r()*3));
  spot(3,(x,z)=>add(new THREE.BoxGeometry(3,.05,.45),LM(0xe9e2cf),x,.03,z,0,r()*3));
  spot(3,(x,z)=>add(new THREE.BoxGeometry(1.9,.14,2.5),LM(r()<.5?0x3b6fb6:0xc2453d),x,.07,z,0,r()*.8-.4))}
 else if(k==='Papan Tulis'){
  spot(10,(x,z)=>add(new THREE.CylinderGeometry(.07,.07,.7,8),LM([0xffffff,0xffb3c7,0x9ed8ff,0xfff29a][r()*4|0]),x,.07,z,0,r()*3,Math.PI/2));
  spot(3,(x,z)=>{add(new THREE.BoxGeometry(1,.26,.5),LM(0x555a60),x,.13,z,0,r()*3);add(new THREE.BoxGeometry(1.02,.06,.52),LM(0x2c2f33),x,.02,z,0,0)})}
 else if(k==='Meja Cafe'){
  spot(4,(x,z)=>{add(new THREE.CylinderGeometry(.62,.5,.06,20),LM(0xffffff),x,.03,z);add(new THREE.CylinderGeometry(.34,.28,.42,16),LM(0xffffff),x,.28,z);add(new THREE.CylinderGeometry(.3,.3,.02,16),LM(0x4a2c17),x,.49,z);add(new THREE.TorusGeometry(.14,.04,6,12),LM(0xffffff),x+.4,.3,z,0,0,0)});
  spot(4,(x,z)=>{add(new THREE.CylinderGeometry(.75,.75,.04,20),LM(0xf8e3b8),x,.02,z);add(new THREE.CylinderGeometry(.22,.22,.08,10),LM(0xb8793a),x,.08,z)});
  spot(3,(x,z)=>{add(new THREE.CylinderGeometry(.3,.22,.38,10),LM(0xb5603a),x,.19,z);add(new THREE.SphereGeometry(.34,10,8),LM(0x3d9a54),x,.55,z)})}
 else if(k==='Lantai Rumah'){
  spot(9,(x,z)=>{const s=.4+r()*.25;add(new THREE.BoxGeometry(s,s,s),LM([0xe8564a,0x3b82f6,0xfacc15,0x34d399][r()*4|0]),x,s/2,z,0,r()*3)});
  spot(3,(x,z)=>add(new THREE.SphereGeometry(.4,12,10),LM(0xff7a45),x,.4,z));
  spot(2,(x,z)=>{add(new THREE.BoxGeometry(.9,.16,.4),LM(0x6a7bd1),x,.08,z,0,r()*3)})}
 else{
  spot(8,(x,z)=>{add(new THREE.ConeGeometry(.28,.6,12),LM(0xff7a1a),x,.3,z);add(new THREE.CylinderGeometry(.34,.34,.04,12),LM(0x222a3a),x,.02,z)});
  for(const sx of[-1,1])add(new THREE.BoxGeometry(.14,.05,14),BM(0x39e3ff),sx*7.6,.03,0);
  for(const sz of[-1,1])add(new THREE.BoxGeometry(18,.05,.14),BM(0x39e3ff),0,.03,sz*8.4)}
 return g}
let themeNow='';
function redrawMat(){const T=THEMES[themeCur%THEMES.length],old=mat.material.map;mat.material.map=ctex(1500,1200,(x,w,h)=>{T.draw(x,w,h);slotsAndLabels(x)});mat.material.needsUpdate=true;if(old&&old.dispose)old.dispose();ren.setClearColor(T.clear)}
function setTheme(i){themeCur=i%THEMES.length;const T=THEMES[themeCur];themeNow=T.n;redrawMat();if(propsG)scene.remove(propsG);propsG=buildProps(T.n,i*977+Date.now()%1000);scene.add(propsG);return T.n}
const SP=new Float32Array(90*3);for(let i=0;i<90;i++){SP[i*3]=(Math.random()-.5)*11;SP[i*3+1]=Math.random()*5;SP[i*3+2]=(Math.random()-.5)*15}
const spk=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(SP,3)),new THREE.PointsMaterial({size:.07,color:0xffffff,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(spk);
/* ---------- kamera tetap (satu sudut, tanpa zoom; HP datar dari atas seperti Pocket) ---------- */
let ELEV=1.5,cd=0,ct=0,cdT=0,ctT=0,camMode='all',TURNG=null;
const portrait=()=>innerWidth/innerHeight<1.15;
function fit(){const w=innerWidth,h=innerHeight,a=w/h,land=a>=1.15;
 if(land!==LAYMODE){LAYMODE=land;LAY=land?L_LAND:L_PORT;ELEV=LAY.elev;redrawMat();if(G&&G.p)sync()}
 const f=Math.tan(cam.fov*Math.PI/360),sE=Math.sin(ELEV);ren.setSize(w,h,false);cam.aspect=a;cam.updateProjectionMatrix();
 cdT=Math.max(LAY.W/(2*f*a),LAY.Hg*sE/(2*f));ctT=LAY.zc;if(!cd){cd=cdT;ct=ctT}
 const hd=f*cdT/sE,hw=f*cdT*a,upx=h/(2*hd),zb=ctT+hd,zt=ctT-hd,hh=1.4*LAY.hs,oh=1.4*LAY.ohs;
 const hudM=(land?0:64/upx);const bb=Math.abs(LAY.ben(0,1)[1])+.7*LAY.ben(0,1)[2];LAY.handZ=Math.max(zb-hudM-LAY.hvis*hh+hh/2,bb+.18+hh/2);LAY.ohandZ=Math.min(zt+(land?0:40/upx)+LAY.ovis*oh-oh/2,-(bb+.18+oh/2));
 if(TURNG){TURNG[0].position.x=-(hw-1.1);TURNG[1].position.x=hw-1.1}
 if(G&&G.p)sync()}
const setCam=()=>{};
/* zoom sinematik sesaat (pita serangan ala Pocket) + guncangan benturan; sudut kamera tetap, selalu kembali ke 1x. Mati bila reduced-motion */
const RMO=matchMedia('(prefers-reduced-motion: reduce)').matches;let czm=1,czmT=1,czo=0,czoT=0,CSH=0;
const camFx=(k=1,z=ctT)=>{if(RMO)return;czmT=1/k;czoT=z-ctT},shake=a=>{if(!RMO)CSH=Math.max(CSH,a)};
function camUpd(){cd+=(cdT-cd)*.1;ct+=(ctT-ct)*.1;czm+=(czmT-czm)*.08;czo+=(czoT-czo)*.08;const d=cd*czm,z=ct+czo;cam.position.set(0,Math.sin(ELEV)*d,Math.cos(ELEV)*d+z);cam.lookAt(0,0,z);
 if(CSH>.003){cam.position.x+=(Math.random()-.5)*CSH;cam.position.z+=(Math.random()-.5)*CSH;CSH*=.86}}
addEventListener('resize',fit);

/* ---------- kartu ---------- */
const M=new Map(),PX=new Map(),OV=new Map(),PXM=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide});let LI=new Map(),hov=null;
function newCardMesh(){const bm=()=>new THREE.MeshBasicMaterial({map:BACKT,alphaTest:.5}),g=new THREE.Group(),f=new THREE.Mesh(GEO,bm()),b=new THREE.Mesh(GEO,bm());b.rotation.y=Math.PI;
 const lab=new THREE.Mesh(new THREE.PlaneGeometry(.92,.17),new THREE.MeshBasicMaterial({transparent:true,depthWrite:false}));lab.position.z=.003;lab.visible=false;g.add(f,b,lab);g.userData={f,lab,off:{x:0,z:0},sh:0,fl:0,key:'',lk:'',t:null,pop:0};return g}
const labCache={};const labTex=(t,c)=>labCache[t+c]||(labCache[t+c]=ctex(256,48,(x,w,h)=>{rr(x,2,2,w-4,h-4,12);x.fillStyle=c;x.fill();x.fillStyle='#fff';x.font='800 24px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText(t,w/2,h/2+1,w-16)}));
const ETC={D:'#4c3b7a',P:'#9333ea',R:'#dc2626',C:'#64748b',G:'#16a34a',F:'#b45309',W:'#0284c7'};
const pillCache={};const pillTex=(t,c)=>pillCache[t+c]||(pillCache[t+c]=ctex(256,96,(x,w,h)=>{rr(x,4,4,w-8,h-8,40);x.fillStyle=c;x.fill();x.lineWidth=6;x.strokeStyle='#fff';x.stroke();x.fillStyle='#fff';x.font='900 46px '+FONT;x.textAlign='center';x.textBaseline='middle';x.shadowColor='#0008';x.shadowBlur=4;x.fillText(t,w/2,h/2+3,w-24)}));
const coinTex={};const coinT=v=>coinTex[v]||(coinTex[v]=ctex(128,128,(x,w,h)=>{const g=x.createRadialGradient(64,64,6,64,64,60);const c=v===100?['#f0abfc','#a21caf']:v===50?['#fdba74','#ea580c']:['#fef08a','#ca8a04'];g.addColorStop(0,c[0]);g.addColorStop(1,c[1]);x.fillStyle=g;x.beginPath();x.arc(64,64,60,0,7);x.fill();x.lineWidth=7;x.strokeStyle='#fff';x.stroke();x.fillStyle='#fff';x.strokeStyle='#0008';x.lineWidth=5;x.font='900 '+(v>=100?44:56)+'px '+FONT;x.textAlign='center';x.textBaseline='middle';x.strokeText(v,64,68);x.fillText(v,64,68)}));
const CG=new THREE.CircleGeometry(.17,28),PG=new THREE.PlaneGeometry(1,1);
const coinsFor=d=>{const r=[];while(d>=100){r.push(100);d-=100}while(d>=50){r.push(50);d-=50}while(d>=10){r.push(10);d-=10}return r};
/* HP badge kecil di sudut kanan atas (stage & nama kartu tetap terbaca) + bola energi 3D */
const ICT={},TYC2={G:'#22c55e',W:'#0ea5e9',F:'#b45309',L:'#facc15',M:'#9ca3af',N:'#7c3aed',D:'#3b2f5c',P:'#a855f7',R:'#ef4444',C:'#e5e7eb'};
const iconImg=src=>{if(!ICT[src]){const im=new Image();im.onload=()=>{for(const o of OV.values())if(o.ty&&ICONS.type[o.ty]===src)drawHp(o)};im.src=src;ICT[src]=im}return ICT[src]};
function drawHp(o){const x=o.cx,w=256,h=84,f=Math.max(0,Math.min(1,o.hpC)),dead=o.hpT<=.001&&f<.02;
 x.clearRect(0,0,w,h);rr(x,3,3,w-6,h-6,24);x.fillStyle='#0f2a43ee';x.fill();x.lineWidth=4;x.strokeStyle='#fff';x.stroke();
 const src=ICONS.type[o.ty],im=src&&iconImg(src);
 if(im&&im.complete&&im.naturalWidth)x.drawImage(im,10,7,50,50);else{x.fillStyle=TYC2[o.ty]||'#64748b';x.beginPath();x.arc(35,32,24,0,7);x.fill();x.lineWidth=3;x.strokeStyle='#fff';x.stroke()}
 const cur=Math.round(f*o.mx);x.textBaseline='middle';x.textAlign='left';x.fillStyle=dead?'#d1d5db':o.hpC-o.hpT>.004?'#f87171':'#fff';x.font='900 40px '+FONT;x.fillText(String(cur),70,31);const tw=x.measureText(String(cur)).width;x.font='800 22px '+FONT;x.fillStyle='#cbd5e1';x.fillText('/'+o.mx,70+tw+4,36);
 const col=dead?'#9ca3af':f>.55?'#22c55e':f>.28?'#facc15':'#ef4444';rr(x,12,62,w-24,12,6);x.fillStyle='#ffffff2e';x.fill();if(f>.015){rr(x,12,62,Math.max(14,(w-24)*f),12,6);x.fillStyle=col;x.fill()}
 o.tex.needsUpdate=true}
function updHp(){for(const o of OV.values()){if(o.hpC===undefined)continue;const d=o.hpT-o.hpC;if(Math.abs(d)>.002){o.hpC+=d*.07;drawHp(o)}else if(o.hpC!==o.hpT){o.hpC=o.hpT;drawHp(o)}}}
/* bola Energi 3D: sphere ber-shader (gradasi tubuh, kilap, rim, cincin tepi putih ala Pocket) + decal simbol 512px (tools/orb-sym.py)
   yang dipetakan ke permukaan bola dan selalu menghadap kamera; warna [terang, gelap] per tipe */
const ORB={D:['#4cc4cf','#0d4b58'],P:['#e19be0','#71358a'],R:['#ff8a6a','#a3141a'],C:['#ffffff','#aab4c2'],G:['#7fe070','#16712a'],F:['#fbab4c','#934304'],W:['#6cd8ff','#0961b0'],L:['#ffeb6e','#d39306'],M:['#f1f3f5','#747d87'],prism:['#ffffff','#c9c1ec']},
 orbC=k=>ORB[k]||ORB.C,AURAC=Object.fromEntries(Object.entries(ORB).map(([k,v])=>[k,new THREE.Color(v[0]).getHex()])),SG=new THREE.SphereGeometry(.115,32,20),NT={};
/* normal diputar ke bingkai "menghadap kamera" dari pusat bola, agar simbol tetap di tengah walau bola di pinggir layar */
const ORB_VS=`varying vec3 vN;void main(){vec3 f=normalize(-(modelViewMatrix*vec4(0.,0.,0.,1.)).xyz),rt=normalize(cross(vec3(0.,1.,0.),f)),up=cross(f,rt),n=normalize(normalMatrix*normal);
 vN=vec3(dot(n,rt),dot(n,up),dot(n,f));gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 ORB_FS=`uniform vec3 cA,cB;uniform sampler2D map;uniform float ir;varying vec3 vN;
void main(){vec3 n=normalize(vN);float r=min(length(n.xy),1.);vec3 L=normalize(vec3(-.45,.62,.64));
 vec3 c=mix(cB,cA,smoothstep(.12,.92,dot(n,L)*.5+.5));
 vec2 d=r>1e-4?n.xy/r*asin(r):vec2(0.);vec4 s=texture2D(map,d*.56+.5);c=mix(c,s.rgb,s.a);
 float h=max(dot(n,normalize(L+vec3(0.,0.,1.))),0.);c+=pow(h,64.)*.9+pow(h,8.)*.12;
 vec3 rim=mix(cA,.62+.38*cos(6.2832*(atan(n.y,n.x)/6.2832+vec3(0.,.33,.67))),ir);c=mix(c,rim,pow(1.-n.z,2.5)*.65);
 gl_FragColor=vec4(mix(c,vec3(1.),smoothstep(.915,.965,r)),1.);}`,
 ORB_M={},orbM=k=>ORB_M[k]||(ORB_M[k]=new THREE.ShaderMaterial({uniforms:{cA:{value:new THREE.Color(orbC(k)[0])},cB:{value:new THREE.Color(orbC(k)[1])},map:{value:TL.load(ICONS.orb[k]||ICONS.orb.C)},ir:{value:k==='prism'?1:0}},vertexShader:ORB_VS,fragmentShader:ORB_FS})),
 HALO_T=ctex(128,128,(x,w)=>{const g=x.createRadialGradient(64,64,0,64,64,64);[[0,'#fff0'],[.5,'#fff0'],[.66,'#ffffffd0'],[.8,'#ffffff40'],[1,'#fff0']].forEach(([t,c])=>g.addColorStop(t,c));x.fillStyle=g;x.fillRect(0,0,w,w)}),
 AURA_M={},auraM=k=>AURA_M[k]||(AURA_M[k]=new THREE.SpriteMaterial({map:HALO_T,color:AURAC[k]||0xffffff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})),
 SHAD_M=new THREE.MeshBasicMaterial({map:ctex(64,64,(x,w)=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#000c');g.addColorStop(.5,'#0008');g.addColorStop(1,'#0000');x.fillStyle=g;x.fillRect(0,0,w,w)}),transparent:true,depthWrite:false}),SHG=new THREE.PlaneGeometry(.34,.34);
/* aura halus Energi di kartu: cincin cahaya rapat di luar tepi bola (r>.62 tekstur), meredup ke arah atas agar teks serangan tetap terbaca.
   Lapis 0 normal (rona, terlihat di kartu terang), lapis 1 aditif (pendar, terlihat di kartu gelap, kontras teks hitam tetap). Denyut & rona Prism: glowUpd */
const orbGlowT=(fall,top)=>ctex(128,128,(x,w)=>{const d=x.createImageData(w,w),cl=v=>Math.min(1,Math.max(0,v));for(let j=0;j<w;j++)for(let i=0;i<w;i++){const u=(i+.5)/w*2-1,v=(j+.5)/w*2-1,r=Math.hypot(u,v);
  d.data.set([255,255,255,255*cl((r-.58)/.05)*Math.pow(cl(1-(r-.62)/.38),fall)*(top+(1-top)*cl((v+.85)/.65))|0],(j*w+i)*4)}x.putImageData(d,0,0)}),   // v<0 = atas layar
 GLC={D:'#2fd3dc',P:'#d46bff',R:'#ff5a3c',G:'#4ee05f',W:'#3ab4ff',L:'#ffd21f',F:'#ff9a3c',M:'#d5dde6',C:'#ffffff',prism:'#ffffff'},GT=[orbGlowT(1.7,.22),orbGlowT(3.4,.3)],GLA=[.4,.85],GLK={C:.4,M:.55},   // putih/perak diredam: pendar putih di meja/kartu berwarna terlihat seperti kabut
 
 GLOW_M={},glowM=k=>GLOW_M[k]||(GLOW_M[k]=GT.map((t,i)=>new THREE.SpriteMaterial({map:t,color:GLC[k]||'#ffffff',transparent:true,depthWrite:false,opacity:GLA[i]*(GLK[k]||1),blending:i?THREE.AdditiveBlending:THREE.NormalBlending})));
function glowUpd(s){for(const k in GLOW_M){const m=GLOW_M[k],f=.8+.2*Math.sin(s*2.4+k.charCodeAt(0));m.forEach((x,i)=>x.opacity=GLA[i]*f*(GLK[k]||1));if(k==='prism'){m[0].color.setHSL(s*.1%1,.95,.62);m[1].color.copy(m[0].color)}}}
const cntTex=n=>NT[n]||(NT[n]=ctex(64,64,(x)=>{x.beginPath();x.arc(32,32,28,0,7);x.fillStyle='#0f2a43';x.fill();x.lineWidth=5;x.strokeStyle='#fff';x.stroke();x.font='900 34px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';x.fillText(String(n),32,35)}));
function orbList(mon){if(mon.en.length<=4)return mon.en.map(e=>[e.key==='prism'?'prism':e.t,0]);const c=new Map();for(const e of mon.en){const k=e.key==='prism'?'prism':e.t;c.set(k,(c.get(k)||0)+1)}return[...c]}
function ovBuild(o,mon){
 if(!o.pill){const c=document.createElement('canvas');c.width=256;c.height=84;o.cx=c.getContext('2d');o.tex=new THREE.CanvasTexture(c);o.pill=new THREE.Mesh(PG,new THREE.MeshBasicMaterial({map:o.tex,transparent:true,depthWrite:false}));o.pill.scale.set(.6,.197,1);o.pill.position.set(.19,.595,.02);o.g.add(o.pill);o.sub=new THREE.Group();o.g.add(o.sub);o.hpC=undefined}
 o.ty=mon.card.type;o.mx=mon.card.hp;o.hpT=Math.max(0,hp(mon))/mon.card.hp;if(o.hpC===undefined)o.hpC=o.hpT;drawHp(o);
 while(o.sub.children.length)o.sub.remove(o.sub.children[0]);
 coinsFor(mon.dmg).forEach((v,i)=>{const c=new THREE.Mesh(CG,new THREE.MeshBasicMaterial({map:coinT(v),transparent:true,depthWrite:false}));const r=i>>2,cc=i%4;c.scale.setScalar(v>=50?1.2:1);c.position.set(-.3+cc*.27+(r?.1:0),.08-r*.28,.03+i*.001);o.sub.add(c)});
 const bd=[];if(mon.sp==='asleep')bd.push('💤');if(mon.sp==='confused')bd.push('😵');if(mon.sp==='paralyzed')bd.push('⚡');if(mon.poison)bd.push('☠️');if(mon.burn)bd.push('🔥');
 bd.forEach((e,i)=>{const b=new THREE.Mesh(PG,new THREE.MeshBasicMaterial({map:ctex(96,96,(x,w,h)=>{x.fillStyle='#fff';x.beginPath();x.arc(48,48,44,0,7);x.fill();x.lineWidth=4;x.strokeStyle='#0f2a43';x.stroke();x.font='54px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText(e,48,52)}),transparent:true,depthWrite:false}));b.scale.setScalar(.26);b.position.set(-.34+i*.28,.3,.03);o.sub.add(b)});
 orbList(mon).forEach(([k,n],i)=>{const px=-.375+i*.25,sg=orbMesh(k);sg.userData.slot=i;sg.position.set(px,-.55,0);o.sub.add(sg);
  if(n>1){const q=new THREE.Sprite(new THREE.SpriteMaterial({map:cntTex(n),depthWrite:false}));q.scale.setScalar(.13);q.position.set(.09,.085,.3);sg.add(q)}})}
/* satu bola Energi di titik 0,0; dipakai overlay & animasi pasang Energi. Di kartu: bayangan kontak + aura halus (di bawah permukaan bola,
   jadi tak menimpa bola tetangga); air=1 (bola terbang): halo cahaya */
function orbMesh(k,air){const sg=new THREE.Group(),b=new THREE.Mesh(SG,orbM(k)),x=air?new THREE.Sprite(auraM(k)):new THREE.Mesh(SHG,SHAD_M);b.position.z=.14;
 if(air){x.position.z=.14;x.scale.setScalar(.36)}else{x.position.set(.016,-.02,.02);for(const m of glowM(k)){const h=new THREE.Sprite(m);h.position.z=.06;h.scale.setScalar(2*.115/.62);sg.add(h)}}
 sg.add(b,x);return sg}
function sync(){
 if(!G||!G.p)return;{const bn=Math.max(bmax('p'),bmax('o'));if(bn!==BENCHN){BENCHN=bn;redrawMat()}}
 const L=lay(),seen=new Set();LI=new Map();
 for(const it of L){seen.add(it.id);LI.set(it.id,it);let g=M.get(it.id);
  if(!g){g=newCardMesh();M.set(it.id,g);scene.add(g);const m=it.sd==='o'?-1:1,dp=Z.dk(m);g.position.set(dp[0],1.5,dp[1]);g.scale.setScalar(.3);g.rotation.x=Math.PI/2}
  const d=g.userData;d.die=0;d.dest=null;d.t=it;d.id=it.id;g.visible=!it.hide;
  const sf=it.up&&it.c,key=sf?'f'+it.c.img:'b';
  if(d.key!==key){d.key=key;d.f.material.map=sf?cardTex(it.c):BACKT;d.f.material.needsUpdate=true}
  if(it.lab&&sf){const lk=it.lab+it.labc;if(d.lk!==lk){d.lk=lk;d.lab.material.map=labTex(it.lab,it.labc)}d.lab.position.y=it.laby;d.lab.visible=true}else d.lab.visible=false;
  let px=PX.get(it.id);if(!px){px=new THREE.Mesh(GEO,PXM);px.userData.id=it.id;PX.set(it.id,px);scene.add(px)}
  px.position.set(it.x,it.y,it.z);px.rotation.x=it.up?-Math.PI/2+(it.tilt||0):Math.PI/2;px.scale.setScalar(it.s);px.updateMatrixWorld();
  if(it.mon&&(it.zone==='act'||it.zone==='ben')&&it.up){let o=OV.get(it.id);if(!o){o={g:new THREE.Group(),key:''};o.g.rotation.x=-Math.PI/2;scene.add(o.g);OV.set(it.id,o)}
   o.g.visible=true;const m=it.mon,k=[m.card.type,hp(m),m.card.hp,m.sp,m.poison,m.burn,m.en.length,m.tool?1:0].join('|');if(o.key!==k){o.key=k;ovBuild(o,m)}}
  else{const o=OV.get(it.id);if(o)o.g.visible=false}
  cfSync(it.id,it.mon,!!(it.mon&&it.zone==='act'&&it.up))}
 const dest=new Map();for(const sd of['p','o']){const m=sd==='p'?1:-1;for(const c of G[sd].discard)dest.set(c.id,Z.dis(m));for(const c of G[sd].deck)dest.set(c.id,Z.dk(m))}
 for(const[id,g]of M)if(!seen.has(id)){const d=g.userData;if(!d.die){d.die=1;d.dieT=performance.now()}d.dest=dest.get(id)||null;const q=PX.get(id);if(q){scene.remove(q);PX.delete(id)};const o=OV.get(id);if(o){scene.remove(o.g);OV.delete(id)}cfDrop(id)}
 hud()}
const spin=mon=>mon.sp==='asleep'?Math.PI/2:mon.sp==='paralyzed'?-Math.PI/2:mon.sp==='confused'?Math.PI:0;
function lay(){
 const L=[],add=(id,c,o)=>L.push({id,c,up:1,y:.06,s:1,x:0,z:0,...o});
 for(const sd of['p','o']){
  const S=G[sd],m=sd==='p'?1:-1,hid=G.phase==='setup';
  const mons=[];if(S.active)mons.push([S.active,Z.act(m),'act']);S.bench.forEach((b,i)=>mons.push([b,Z.ben(i,m),'ben']));
  for(const[mon,[x0,z0,s0],zone]of mons){
   let x=x0,z=z0,s=s0,y=.12,tilt=0;const stg=UI.stage&&UI.stage.mon===mon;if(stg){x=1.1;z=(LAY.handZ||5)-1.4;s=1.5;y=1.4;tilt=.2}
   add(mon.id,mon.card,{sd,zone,mon,x,z,s,y,tilt,up:!hid,rz:stg?0:spin(mon)});
   if(stg)continue;
   const n=mon.en.length,st=Math.min(.2,.5/Math.max(n,1))*s;
   mon.en.forEach((e,i)=>add(e.id,e,{sd,zone:'att',par:mon,x,z:z-m*(i+1)*st,s,y:.09-i*.011,up:!hid}));
   if(mon.tool)add(mon.tool.id,mon.tool,{sd,zone:'att',par:mon,x:x+.14*s,z:z+m*.22*s,s,y:.08,up:!hid,lab:'🔧 '+cname(mon.tool),labc:'#0f766e',laby:-m*.63})}
  S.prizes.forEach((c,i)=>add(c.id,c,{sd,zone:'pz',x:Z.pri(i,m)[0],z:Z.pri(i,m)[1],s:Z.pri(i,m)[2],up:(UI.reveal&&UI.reveal.has(c.id))?1:0}));
  for(let i=0;i<Math.min(4,Math.ceil(S.deck.length/12));i++){const[x,z,s]=Z.dk(m);add('dk'+sd+i,null,{sd,zone:'dk',x,z,s,up:0,y:.06+i*.05})}
  const t=S.discard[S.discard.length-1];if(t){const[x,z,s]=Z.dis(m);add(t.id,t,{sd,zone:'dis',x,z,s})}
  const n=S.hand.length;
  S.hand.forEach((c,i)=>{
   if(sd==='p'){const sp=Math.min(LAY.hsp,(LAY.W-1.3)/Math.max(n-1,1));add(c.id,c,{sd,zone:'hand',idx:i,x:(i-(n-1)/2)*sp,z:LAY.handZ||5.6,s:LAY.hs,y:.95+i*.03,tilt:.15})}
   else add(c.id,c,{sd,zone:'ohand',up:0,x:(i-(n-1)/2)*Math.min(.62,(LAY.W-2)/Math.max(n,1)),z:LAY.ohandZ||-5,s:LAY.ohs,y:.4+i*.02})})}
 if(G.limbo&&UI.limbo&&UI.limbo.c===G.limbo){const l=UI.limbo,az=Z.act(l.sd==='p'?1:-1)[1];add(l.c.id,l.c,{sd:l.sd,zone:'limbo',x:1.55,z:az,s:1.05,y:1.8,up:1,hide:l.pos==='hidden'})}
 if(G.stadium){const[x,z,s]=LAY.stad;add(G.stadium.card.id,G.stadium.card,{sd:G.stadium.owner,zone:'stad',x,z,s,y:.1,up:1})}
 if(UI.attach){const ls=UI.attach.list;ls.forEach((c,i)=>add(c.id,c,{sd:'p',zone:'pend',idx:i,x:(i-(ls.length-1)/2)*1.35,z:(LAY.handZ||5)-1.9,s:1.15,y:1.5,up:1,lab:`Energi ${i+1}`,labc:ETC[c.t]||'#7c3aed',laby:.63}))}
 return L}
/* ---------- VFX ---------- */
const FXL=[],shufT={p:0,o:0};
function burst(x,z,col,n=40,up=2.2,sz=.16){const geo=new THREE.BufferGeometry(),pos=new Float32Array(n*3),vel=[];for(let i=0;i<n;i++){pos[i*3]=x;pos[i*3+1]=.5;pos[i*3+2]=z;const a=Math.random()*6.28,r=Math.random()*1.6;vel.push([Math.cos(a)*r,Math.random()*up+.6,Math.sin(a)*r])}
 geo.setAttribute('position',new THREE.BufferAttribute(pos,3));const mt=new THREE.PointsMaterial({size:sz,color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}),o=new THREE.Points(geo,mt);scene.add(o);
 FXL.push({o,t0:performance.now(),dur:1100,upd(p){const q=geo.attributes.position;for(let i=0;i<n;i++){q.array[i*3]+=vel[i][0]*.016;q.array[i*3+1]+=vel[i][1]*.016-.02*p;q.array[i*3+2]+=vel[i][2]*.016}q.needsUpdate=true;mt.opacity=1-p}})}
function ring(x,z,col){const r=new THREE.Mesh(new THREE.RingGeometry(.55,.7,40),new THREE.MeshBasicMaterial({color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));r.rotation.x=-Math.PI/2;r.position.set(x,.2,z);scene.add(r);
 FXL.push({o:r,t0:performance.now(),dur:900,upd(p){r.scale.setScalar(.6+p*3.2);r.material.opacity=1-p}})}
const RG=(()=>{const t=ctex(128,180,(x)=>{x.shadowColor='#fff';x.shadowBlur=14;rr(x,12,12,104,156,12);x.lineWidth=9;x.strokeStyle='#fff';x.stroke()});
 return Array.from({length:14},()=>{const m=new THREE.Mesh(GEO,new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,color:0xfcd34d}));m.rotation.x=-Math.PI/2;m.visible=false;scene.add(m);return m})})();
const COIN=(()=>{const face=(a,b,em,tx)=>ctex(256,256,(x)=>{const g=x.createRadialGradient(128,128,10,128,128,128);g.addColorStop(0,a);g.addColorStop(1,b);x.fillStyle=g;x.fillRect(0,0,256,256);x.beginPath();x.arc(128,128,112,0,7);x.lineWidth=10;x.strokeStyle='#fff9';x.stroke();x.textAlign='center';x.textBaseline='middle';x.font='110px '+FONT;x.fillStyle='#000';x.fillText(em,128,108);x.font='900 30px '+FONT;x.fillStyle='#5b3a00';x.fillText(tx,128,206)});
 const g=new THREE.Group(),cyl=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.14,48),new THREE.MeshBasicMaterial({color:0xb7791f})),
 top=new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshBasicMaterial({map:face('#fff2a8','#f5b301','⚡','KEPALA')})),bt=new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshBasicMaterial({map:face('#f8fafc','#94a3b8','🔴','EKOR')}));
 top.rotation.x=-Math.PI/2;top.position.y=.071;bt.rotation.x=Math.PI/2;bt.position.y=-.071;g.add(cyl,top,bt);g.scale.setScalar(1.15);g.visible=false;scene.add(g);return g})();
const DICE=[0].map(()=>{const faces=[3,4,1,6,2,5].map(v=>new THREE.MeshBasicMaterial({map:ctex(128,128,(x)=>{x.fillStyle='#fff';rr(x,4,4,120,120,22);x.fill();x.lineWidth=5;x.strokeStyle='#94a3b8';x.stroke();x.fillStyle='#10243b';
 const P={1:[[.5,.5]],2:[[.28,.28],[.72,.72]],3:[[.25,.25],[.5,.5],[.75,.75]],4:[[.28,.28],[.72,.28],[.28,.72],[.72,.72]],5:[[.26,.26],[.74,.26],[.5,.5],[.26,.74],[.74,.74]],6:[[.3,.22],[.7,.22],[.3,.5],[.7,.5],[.3,.78],[.7,.78]]}[v];P.forEach(([a,b])=>{x.beginPath();x.arc(a*128,b*128,11,0,7);x.fill()})})}));
 const d=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.3,1.3),faces);d.visible=false;scene.add(d);return d});
const DROT={1:[0,0,0],6:[Math.PI,0,0],3:[0,0,Math.PI/2],4:[0,0,-Math.PI/2],2:[-Math.PI/2,0,0],5:[Math.PI/2,0,0]};
let CS=null,DS=null;
/* ---------- VFX kondisi khusus ---------- */
const STX={};const stex=k=>STX[k]||(STX[k]=ctex(64,64,(x)=>{
 if(k==='bub'){const g=x.createRadialGradient(32,32,2,32,32,28);g.addColorStop(0,'#ffffffcc');g.addColorStop(.6,'#ffffff55');g.addColorStop(1,'#fff0');x.fillStyle=g;x.beginPath();x.arc(32,32,28,0,7);x.fill();x.lineWidth=3;x.strokeStyle='#fffa';x.beginPath();x.arc(32,32,22,0,7);x.stroke()}
 else if(k==='flame'){const g=x.createRadialGradient(32,40,2,32,36,30);g.addColorStop(0,'#fff');g.addColorStop(.35,'#ffd24a');g.addColorStop(.7,'#ff6a00aa');g.addColorStop(1,'#f000');x.fillStyle=g;x.beginPath();x.moveTo(32,2);x.quadraticCurveTo(58,34,44,54);x.quadraticCurveTo(32,66,20,54);x.quadraticCurveTo(6,34,32,2);x.fill()}
 else if(k==='z'){x.font='900 54px '+FONT;x.textAlign='center';x.textBaseline='middle';x.lineWidth=7;x.strokeStyle='#1e3a8a';x.strokeText('Z',32,34);x.fillStyle='#fff';x.fillText('Z',32,34)}
 else if(k==='star'){x.fillStyle='#fff';x.beginPath();for(let i=0;i<10;i++){const r=i%2?11:28,a=-Math.PI/2+i*Math.PI/5;x.lineTo(32+Math.cos(a)*r,32+Math.sin(a)*r)}x.closePath();x.fill()}
 else{const g=x.createRadialGradient(32,32,1,32,32,26);g.addColorStop(0,'#fff');g.addColorStop(.3,'#fff6a0');g.addColorStop(1,'#fff0');x.fillStyle=g;x.fillRect(0,0,64,64)}}));
const EMK={poison:{tex:'bub',n:26,size:.2,rate:.35,col:[.35,1,.3]},burn:{tex:'flame',n:30,size:.34,rate:.9,col:[1,.55,.1]},asleep:{tex:'z',n:6,size:.42,rate:.22,col:[.75,.88,1]},confused:{tex:'star',n:6,size:.3,rate:.4,col:[1,.9,.3]},paralyzed:{tex:'spark',n:24,size:.3,rate:2.4,col:[1,1,.55]}};
const CF=new Map();
function mkEm(kind){const k=EMK[kind],n=k.n,geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));geo.setAttribute('color',new THREE.BufferAttribute(new Float32Array(n*3),3));
 const p=new THREE.Points(geo,new THREE.PointsMaterial({size:k.size,map:stex(k.tex),vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));p.frustumCulled=false;scene.add(p);
 const o={p,kind,seed:Array.from({length:n},()=>[Math.random(),Math.random(),Math.random()])};
 if(kind==='paralyzed'){const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(3*2*8*3),3));o.bolt=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0xfff27a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));o.bolt.frustumCulled=false;scene.add(o.bolt)}
 return o}
function cfSync(id,mon,on){
 let cf=CF.get(id);const want=[];if(on){if(mon.sp)want.push(mon.sp);if(mon.poison)want.push('poison');if(mon.burn)want.push('burn')}
 if(!cf){if(!want.length)return;cf={};CF.set(id,cf)}
 for(const k of Object.keys(cf))if(!want.includes(k)){scene.remove(cf[k].p);if(cf[k].bolt)scene.remove(cf[k].bolt);delete cf[k]}
 for(const k of want)if(!cf[k])cf[k]=mkEm(k)}
function cfDrop(id){const cf=CF.get(id);if(!cf)return;for(const k of Object.keys(cf)){scene.remove(cf[k].p);if(cf[k].bolt)scene.remove(cf[k].bolt)}CF.delete(id)}
function cfUpdate(t){
 for(const[id,cf]of CF){const g=M.get(id);if(!g)continue;const s=g.scale.x,P=g.position;
  for(const kind of Object.keys(cf)){const em=cf[kind],K=EMK[kind],pos=em.p.geometry.attributes.position,col=em.p.geometry.attributes.color,n=K.n;
   for(let i=0;i<n;i++){const[a,b,c]=em.seed[i],ph=(t*K.rate+i/n)%1;let x=0,y=0,z=0,f=1;
    if(kind==='poison'){x=(a-.5)*.95;z=(b-.5)*1.35;y=.1+ph*.85;f=Math.sin(Math.PI*ph);x+=Math.sin(t*3+i)*.05}
    else if(kind==='burn'){x=(a-.5)*.85+Math.sin(t*8+i)*.04;z=.45+b*.25;y=.08+ph*.8;f=Math.min(1,(1-ph)*1.4)}
    else if(kind==='asleep'){x=.3+ph*.55+(a-.5)*.1;z=-.45-ph*.25;y=.25+ph*1.05;f=Math.sin(Math.PI*ph)}
    else if(kind==='confused'){const an=t*2.6+i*Math.PI*2/n;x=Math.cos(an)*.5;z=-.62+Math.sin(an)*.16;y=.5+Math.sin(an)*.08}
    else{const sd=a>.5?1:-1;x=sd*(.4+(b-.5)*.2)+(Math.random()-.5)*.08;z=(c-.5)*1.4;y=.12+Math.random()*.3;f=ph<.5?1:.15}
    pos.array[i*3]=P.x+x*s;pos.array[i*3+1]=P.y+.06+y*s;pos.array[i*3+2]=P.z+z*s;col.array[i*3]=K.col[0]*f;col.array[i*3+1]=K.col[1]*f;col.array[i*3+2]=K.col[2]*f}
   pos.needsUpdate=true;col.needsUpdate=true;em.p.material.size=K.size*Math.max(.6,s);
   if(em.bolt){const q=em.bolt.geometry.attributes.position;let w=0;const fl=Math.floor(t*14)%4;for(let b=0;b<3;b++){let px=(b-1)*.3,pz=-.7;for(let k=0;k<8;k++){const nx=(b-1)*.3+(Math.sin(fl*7+b*3+k*1.7)*.12),nz=-.7+(k+1)*.2;q.array[w++]=P.x+px*s;q.array[w++]=P.y+.1;q.array[w++]=P.z+pz*s;q.array[w++]=P.x+nx*s;q.array[w++]=P.y+.1;q.array[w++]=P.z+nz*s;px=nx;pz=nz}}
    q.needsUpdate=true;em.bolt.visible=fl!==3}}}}
/* ---------- cahaya giliran (ambience di sisi arena) & badge Ability ---------- */
const glowT=ctex(128,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'#ffffffff');g.addColorStop(1,'#ffffff00');x.fillStyle=g;x.fillRect(0,0,w,h)});
const mkGlow=(sx)=>{const g=new THREE.Mesh(new THREE.PlaneGeometry(2.0,16),new THREE.MeshBasicMaterial({map:glowT,color:0xffd35a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));g.rotation.x=-Math.PI/2;g.position.set(sx*5.2,.03,.3);if(sx>0)g.scale.x=-1;scene.add(g);return g};
TURNG=[mkGlow(-1),mkGlow(1)];let TURN={cur:null,t0:0};setTheme(0);fit();
function turnUpd(s,now){const c=TURN.cur==='o'?0xff4f8f:0xffd35a,tg=TURN.cur?.34+Math.sin(s*2)*.05+Math.max(0,1-(now-TURN.t0)/1800)*.3:0;for(const g of TURNG){g.material.color.setHex(c);g.material.opacity+=(tg-g.material.opacity)*.1}}
const abIcon=ctex(96,96,(x)=>{x.fillStyle='#16a34a';x.beginPath();x.arc(48,48,44,0,7);x.fill();x.lineWidth=6;x.strokeStyle='#fff';x.stroke();x.font='50px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('✨',48,52)});
const ABG=Array.from({length:6},()=>{const m=new THREE.Mesh(PG,new THREE.MeshBasicMaterial({map:abIcon,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2+.2;m.scale.set(.42,.42,1);m.visible=false;scene.add(m);return m});
/* ---------- kotak mainkan Trainer & koin damage yang diseret ---------- */
const DZ=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.3),new THREE.MeshBasicMaterial({map:ctex(512,144,(x,w,h)=>{x.fillStyle='#ffffff26';rr(x,6,6,w-12,h-12,28);x.fill();x.setLineDash([22,14]);x.lineWidth=7;x.strokeStyle='#fff';rr(x,6,6,w-12,h-12,28);x.stroke();x.setLineDash([]);x.fillStyle='#fff';x.font='900 34px '+FONT;x.textAlign='center';x.textBaseline='middle';x.shadowColor='#000a';x.shadowBlur=6;x.fillText('LEPAS DI SINI UNTUK MEMAINKAN KARTU',w/2,h/2,w-40)}),transparent:true,depthWrite:false,color:0x4dff88}));
DZ.rotation.x=-Math.PI/2;DZ.position.set(0,.24,0);DZ.visible=false;scene.add(DZ);
const dcTex=v=>ctex(256,256,(x)=>{const g=x.createRadialGradient(128,128,10,128,128,120);g.addColorStop(0,'#fef08a');g.addColorStop(1,'#ca8a04');x.fillStyle=g;x.beginPath();x.arc(128,128,120,0,7);x.fill();x.lineWidth=12;x.strokeStyle='#fff';x.stroke();x.fillStyle='#fff';x.strokeStyle='#0008';x.lineWidth=10;x.font='900 120px '+FONT;x.textAlign='center';x.textBaseline='middle';x.strokeText(String(v),128,134);x.fillText(String(v),128,134)});
const DCS=[10,10,10].map(v=>{const m=new THREE.Mesh(new THREE.CircleGeometry(.5,36),new THREE.MeshBasicMaterial({map:dcTex(v),transparent:true}));m.rotation.x=-Math.PI/2;m.visible=false;scene.add(m);return m});

const ZH=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:ctex(256,256,(x,w,h)=>{x.fillStyle='#ffffff55';rr(x,6,6,w-12,h-12,34);x.fill();x.lineWidth=9;x.strokeStyle='#ffffffe0';x.stroke()}),transparent:true,depthWrite:false,color:0x4dff88}));
ZH.rotation.x=-Math.PI/2;ZH.position.y=.22;ZH.visible=false;scene.add(ZH);
