/* ===== 3D: papan bertema, kartu, HP bar animasi, koin damage, VFX ===== */
const $=id=>document.getElementById(id);
const cvs=$('cv'),scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(32,1,1.5,90),ren=new THREE.WebGLRenderer({canvas:cvs,antialias:true});
ren.setClearColor(0x2a6fb0);
const ctex=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t};
const rr=(x,a,b,w,h,r)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()};
const FONT='ui-rounded,system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif';
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const TL=new THREE.TextureLoader(),TX={};
const cardTex=c=>{if(!TX[c.img]){const t=TL.load(IMG[c.img],()=>{for(const o of OV.values())if(o.img===c.img)drawHp(o)});t.anisotropy=4;TX[c.img]=t}return TX[c.img]};   // panel HP mengambil warna dari gambar ini
const BACKT=ctex(252,352,(x,w,h)=>{rr(x,0,0,w,h,16);const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#2563eb');g.addColorStop(1,'#1e1b4b');x.fillStyle=g;x.fill();rr(x,9,9,w-18,h-18,11);x.lineWidth=4;x.strokeStyle='#fde68a';x.stroke();
 x.beginPath();x.arc(w/2,h/2,48,0,7);x.lineWidth=7;x.strokeStyle='#fde68a';x.stroke();x.beginPath();x.moveTo(w/2-48,h/2);x.lineTo(w/2+48,h/2);x.stroke();x.beginPath();x.arc(w/2,h/2,13,0,7);x.fillStyle='#fde68a';x.fill()});
const GEO=new THREE.PlaneGeometry(1,1.4);
/* ---------- tata letak: HP (portrait, ala Pocket) & desktop (landscape) dipisah ---------- */
let BENCHN=5;
const L_PORT={act:m=>[0,1.55*m,1.15],ben:(i,m)=>{const n=BENCHN,big=n>5;return[(i-(n-1)/2)*(big?.74:1.2),3.62*m,big?.7:.98]},pri:(i,m)=>[-m*(2.55-(i%3)*.58),(1.18+((i/3)|0)*.76)*m,.46],dk:m=>[m*1.5,1.55*m,.7],dis:m=>[m*2.4,1.55*m,.7],stad:[-1.32,0,.55],
 W:6.3,Hg:10.9,elev:1.5,zc:.15,hs:1.3,ohs:.7,hvis:.62,ovis:.45,hsp:1.05,
 labels:T=>{for(const m of[1,-1]){T('ACTIVE',0,.36*m,'center',11);T('BENCH',-2.25,2.68*m,'center',11);T('PRIZE',-2.05,.7*m,'center',10);T('DECK',1.5,2.15*m,'center',10);T('DISCARD',2.4,2.1*m,'center',9);T('TRASH',2.4,2.28*m,'center',9)}T('STADIUM',2.35,0,'center',10)}};
const L_LAND={act:m=>[0,1.6*m,1.3],ben:(i,m)=>{const n=BENCHN,big=n>5;return[(i-(n-1)/2)*(big?.9:1.32),3.72*m,big?.82:1.06]},pri:(i,m)=>{const b=BENCHN>5;return[-m*((b?4.45:4.35)-(i%2)*.7),((b?.83:.95)+(i>>1)*.92)*m,.56]},dk:m=>[m*4.25,1.95*m,.8],dis:m=>[m*4.25,3.4*m,.8],stad:[-1.45,0,.7],   // Bench 8: lebih rapat & Prize bergeser agar tak bertabrakan
 W:10.6,Hg:10.5,elev:1.25,zc:.15,hs:1.7,ohs:.8,hvis:.64,ovis:.5,hsp:1.3,
 labels:T=>{for(const m of[1,-1]){T('ACTIVE',-1.2,1.6*m,'right',13);T('BENCH',-3.75,3.72*m,'center',13);T('PRIZE',-4.05,.5*m,'center',12);T('DECK',4.25,1.28*m,'center',12);T('DISCARD',4.25,4.12*m,'center',11);T('TRASH',4.25,4.32*m,'center',11)}T('STADIUM',4.1,0,'center',12)}};
let LAY=L_PORT,LAYMODE=null;
const Z={act:m=>LAY.act(m),ben:(i,m)=>LAY.ben(i,m),pri:(i,m)=>LAY.pri(i,m),dk:m=>LAY.dk(m),dis:m=>LAY.dis(m)};
/* ---------- tema arena ---------- */
const LMC={};const LM=c=>LMC[c]||(LMC[c]=new THREE.MeshLambertMaterial({color:c}));
scene.add(new THREE.AmbientLight(0xffffff,.85));{const dl=new THREE.DirectionalLight(0xffffff,.55);dl.position.set(4,10,6);scene.add(dl)}
/* garis slot = geometri, bukan tekstur papan: tajam di semua layar (tekstur 50px/unit buram di HP) */
const SLM=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.82,depthWrite:false,side:THREE.DoubleSide}));SLM.position.y=.004;scene.add(SLM);
function drawSlots(){
 const P=[],q=(a,b,c,d,e,f,g,h)=>P.push(a,0,b,c,0,d,e,0,f,a,0,b,e,0,f,g,0,h);
 const seg=(x0,z0,x1,z1,w)=>{const L=Math.hypot(x1-x0,z1-z0),nx=(z0-z1)/L*w/2,nz=(x1-x0)/L*w/2;q(x0+nx,z0+nz,x0-nx,z0-nz,x1-nx,z1-nz,x1+nx,z1+nz)};
 const dashEdge=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round((L+.18)/.46)),d=(L-(n-1)*.18)/n,ux=(x1-x0)/L,uz=(z1-z0)/L;for(let i=0;i<n;i++){const a=i*(d+.18),b=a+d;seg(x0+ux*a,z0+uz*a,x0+ux*b,z0+uz*b,.07)}};
 const R=([cx,cz,s])=>{const l=cx-s/2,r=cx+s/2,t=cz-.7*s,b=cz+.7*s;dashEdge(l,t,r,t);dashEdge(r,t,r,b);dashEdge(r,b,l,b);dashEdge(l,b,l,t)};
 const ring=(rad,w)=>{const i=rad-w/2,o=rad+w/2;for(let k=0;k<48;k++){const a=k*Math.PI/24,b=a+Math.PI/24,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);q(ca*i,sa*i,ca*o,sa*o,cb*o,sb*o,cb*i,sb*i)}};
 for(const m of[1,-1]){R(Z.act(m));for(let i=0;i<BENCHN;i++)R(Z.ben(i,m));R(Z.dk(m));R(Z.dis(m));for(let i=0;i<6;i++)R(Z.pri(i,m))}R(LAY.stad);
 const hw=LAY.W/2+3;seg(-hw,0,-.8,0,.08);seg(.8,0,hw,0,.08);ring(.68,.08);ring(.2,.08);
 SLM.geometry.dispose();SLM.geometry=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(P,3))}
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
 {n:'Meja Biliar',clear:0x150d08,draw:(x,w,h)=>{x.fillStyle='#150d08';x.fillRect(0,0,w,h);const wd=x.createLinearGradient(0,0,w,0);wd.addColorStop(0,'#5a3418');wd.addColorStop(.5,'#3d220f');wd.addColorStop(1,'#5a3418');x.fillStyle=wd;rr(x,750-470,600-420,940,840,44);x.fill();
   const g=x.createRadialGradient(750,600,140,750,600,560);g.addColorStop(0,'#17605f');g.addColorStop(1,'#0a3133');x.fillStyle=g;x.fillRect(750-412,600-362,824,724);const r=rng(31);
   for(let i=0;i<7000;i++){x.fillStyle=r()<.5?'rgba(0,0,0,.07)':'rgba(255,255,255,.035)';x.fillRect(750-412+r()*822,600-362+r()*722,2,2)}
   x.strokeStyle='rgba(0,0,0,.4)';x.lineWidth=12;x.strokeRect(750-406,600-356,812,712);x.fillStyle='#050505';for(const a of[-1,0,1])for(const b of[-1,1]){x.beginPath();x.arc(750+a*408,600+b*358,25,0,7);x.fill()}}},
 {n:'Mode Latihan',clear:0x0e1626,draw:(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0e1626');g.addColorStop(.5,'#1a2742');g.addColorStop(1,'#0e1626');x.fillStyle=g;x.fillRect(0,0,w,h);
   x.strokeStyle='rgba(80,220,255,.16)';x.lineWidth=2;for(let i=0;i<=w;i+=100){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke()}for(let j=0;j<=h;j+=100){x.beginPath();x.moveTo(0,j);x.lineTo(w,j);x.stroke()}
   x.strokeStyle='rgba(80,220,255,.34)';x.lineWidth=4;for(let i=0;i<=w;i+=500){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke()}for(let j=0;j<=h;j+=400){x.beginPath();x.moveTo(0,j);x.lineTo(w,j);x.stroke()}
   x.strokeStyle='rgba(255,160,60,.2)';x.lineWidth=6;x.beginPath();x.arc(750,600,330,0,7);x.stroke();x.beginPath();x.arc(750,600,500,0,7);x.stroke();
   x.fillStyle='rgba(120,230,255,.1)';x.font='900 120px ui-rounded,system-ui,sans-serif';x.textAlign='center';x.fillText('TRAINING',750,140);x.fillText('TRAINING',750,1110)}}];
const mat=new THREE.Mesh(new THREE.PlaneGeometry(30,24),new THREE.MeshBasicMaterial({polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:2,depthWrite:false}));mat.rotation.x=-Math.PI/2;scene.add(mat);   // meja tak menulis depth: efek di balik kartu terangkat (sinar evolusi) tak terpotong permukaan meja
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
 else if(k==='Meja Biliar'){
  spot(9,(x,z)=>add(new THREE.SphereGeometry(.27,16,12),LM([0xf2c230,0x2156c9,0xd23b3b,0x6b3fa0,0xf07f1e,0x23874f,0x7c2525,0x151515,0xf4f1e6][r()*9|0]),x,.27,z),7.6,6.8);
  spot(2,(x,z)=>add(new THREE.BoxGeometry(.24,.2,.24),LM(0x3b82c4),x,.1,z,0,r()*3),7.6,6.8)}
 else{
  spot(8,(x,z)=>{add(new THREE.ConeGeometry(.28,.6,12),LM(0xff7a1a),x,.3,z);add(new THREE.CylinderGeometry(.34,.34,.04,12),LM(0x222a3a),x,.02,z)});
  for(const sx of[-1,1])add(new THREE.BoxGeometry(.14,.05,14),BM(0x39e3ff),sx*7.6,.03,0);
  for(const sz of[-1,1])add(new THREE.BoxGeometry(18,.05,.14),BM(0x39e3ff),0,.03,sz*8.4)}
 return g}
let themeNow='';
function setTheme(i){themeCur=i%THEMES.length;const T=THEMES[themeCur];themeNow=T.n;
 const k=ren.capabilities.maxTextureSize>=3000?2:1,old=mat.material.map;mat.material.map=ctex(1500*k,1200*k,x=>{x.scale(k,k);T.draw(x,1500,1200)});mat.material.needsUpdate=true;if(old)old.dispose();ren.setClearColor(T.clear);   // 2x (100px/unit) agar latar tak buram di HP
 if(propsG)scene.remove(propsG);propsG=buildProps(T.n,i*977+Date.now()%1000);scene.add(propsG);return T.n}
const SP=new Float32Array(90*3);for(let i=0;i<90;i++){SP[i*3]=(Math.random()-.5)*11;SP[i*3+1]=Math.random()*5;SP[i*3+2]=(Math.random()-.5)*15}
const spk=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(SP,3)),new THREE.PointsMaterial({size:.07,color:0xffffff,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(spk);
/* ---------- kamera tetap (satu sudut, tanpa zoom; HP datar dari atas seperti Pocket) ---------- */
let ELEV=1.5,cd=0,ct=0,cdT=0,ctT=0,camMode='all';
const portrait=()=>innerWidth/innerHeight<1.15;
function fit(){const w=innerWidth,h=innerHeight,a=w/h,land=a>=1.15;
 if(land!==LAYMODE){LAYMODE=land;LAY=land?L_LAND:L_PORT;ELEV=LAY.elev;drawSlots();if(G&&G.p)sync()}
 const f=Math.tan(cam.fov*Math.PI/360),sE=Math.sin(ELEV),cE=Math.cos(ELEV);ren.setPixelRatio(Math.min(devicePixelRatio||1,3));ren.setSize(w,h,false);cam.aspect=a;cam.updateProjectionMatrix();
 const hh=1.4*LAY.hs,oh=1.4*LAY.ohs,bb=Math.abs(LAY.ben(0,1)[1])+.7*LAY.ben(0,1)[2],cs=getComputedStyle(document.documentElement),sb=land?0:parseFloat(cs.paddingBottom)||0;   // HP: tanpa strip HUD bawah (info & tombol pindah ke kanan garis tengah), hanya safe-area
 cdT=Math.max(LAY.W/(2*f*a),LAY.Hg*sE/(2*f),land?0:(2*bb+LAY.hvis*hh)/(1-(sb+10)/h)*sE/(2*f));ctT=LAY.zc;   // HP: papan + tangan menyembul di tepi bawah harus muat (10px cadangan atas)
 if(land){LAY.handZ=Math.max(ctT+f*cdT/sE-LAY.hvis*hh+hh/2,bb+.18+hh/2);LAY.handW=LAY.W-1.3;
  const ry=-sE*cdT,rz=-cE*cdT-ctT;document.documentElement.style.setProperty('--mid',Math.round((1-(ry*cE-rz*sE)/((-ry*sE-rz*cE)*f))*h/2)+'px')}   // desktop juga: pita giliran & pil HUD menempel di garis tengah
 else{/* HP ala Pocket: tangan menyembul hvis di atas strip HUD bawah, baris muat selebar layar; bila sempit, papan naik sampai Bench Bot mepet pil Bot */
  const cy=sE*cdT,ndc=(y,z)=>{const ry=y-cy,rz=z-cE*cdT-ctT;return(ry*cE-rz*sE)/((-ry*sE-rz*cE)*f)},zAt=(n,y)=>cE*cdT+ctT+(y-cy)/(cE*f*n-sE)*(-cE-sE*f*n);   // NDC-y titik (0,y,z) & kebalikannya
  const zs=zAt(2*sb/h-1,1),zc=zAt(ndc(0,bb)-12/h,1),sh=Math.max(0,Math.min(zc-zs+LAY.hvis*hh,((1-ndc(0,-bb))*h/2-10)*2*f*cdT/(sE*h)));   // zs: tepi bawah layar, zc: 6px di bawah Bench (tinggi kartu tangan y≈1)
  ctT+=sh;LAY.handZ=Math.max(zs+sh-LAY.hvis*hh,zc)+hh/2;LAY.handW=2*((cy-1)*sE+(cE*cdT+ctT-LAY.handZ)*cE)*f*(a-12/h)-LAY.hs;   // lebar layar pada kedalaman tangan, margin 6px
  document.documentElement.style.setProperty('--mid',Math.round((1-ndc(0,0))*h/2)+'px')}   // posisi layar garis tengah: pil Bot/Kamu & tombol menempel di sini (CSS)
 const hd=f*cdT/sE,upx=h/(2*hd);LAY.ohandZ=Math.min(ctT-hd+(land?0:8/upx)+LAY.ovis*oh-oh/2,-(bb+.18+oh/2));
 if(!cd){cd=cdT;ct=ctT}
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
const labCache={};const labTex=(t,c,i)=>labCache[t+c+i]||(labCache[t+c+i]=ctex(256,48,(x,w,h)=>{rr(x,2,2,w-4,h-4,12);x.fillStyle=c;x.fill();x.fillStyle='#fff';x.font='800 24px '+FONT;x.textAlign='center';x.textBaseline='middle';
 const o=i?15:0,tw=Math.min(x.measureText(t).width,w-16-2*o);x.fillText(t,w/2+o,h/2+1,w-16-2*o);if(i)icDraw(x,i,w/2+o-tw/2-17,h/2,26,'#fff')}));   // i: ikon UI di kiri teks
const ETC={D:'#4c3b7a',P:'#9333ea',R:'#dc2626',C:'#64748b',G:'#16a34a',F:'#b45309',W:'#0284c7'};
const pillCache={};const pillTex=(t,c)=>pillCache[t+c]||(pillCache[t+c]=ctex(256,96,(x,w,h)=>{rr(x,4,4,w-8,h-8,40);x.fillStyle=c;x.fill();x.lineWidth=6;x.strokeStyle='#fff';x.stroke();x.fillStyle='#fff';x.font='900 46px '+FONT;x.textAlign='center';x.textBaseline='middle';x.shadowColor='#0008';x.shadowBlur=4;x.fillText(t,w/2,h/2+3,w-24)}));
/* damage counter ala kartu fisik: 10 kuning (kecil), 50 oranye, 100 merah (terbesar); 5×10 selalu digabung jadi 50 (coinsFor) */
const coinTex={};const coinT=v=>coinTex[v]||(coinTex[v]=ctex(128,128,(x,w,h)=>{const g=x.createRadialGradient(54,50,6,64,64,62);const c=v===100?['#fca5a5','#b91c1c']:v===50?['#fdba74','#ea580c']:['#fef08a','#d99a06'];g.addColorStop(0,c[0]);g.addColorStop(1,c[1]);
 x.shadowColor='#0007';x.shadowBlur=6;x.shadowOffsetY=3;x.fillStyle=g;x.beginPath();x.arc(64,62,56,0,7);x.fill();x.shadowColor='transparent';x.lineWidth=6;x.strokeStyle='#fff';x.stroke();
 x.fillStyle='#fff';x.strokeStyle='#0009';x.lineWidth=7;x.lineJoin='round';x.font='900 '+(v>=100?50:62)+'px '+FONT;x.textAlign='center';x.textBaseline='middle';x.strokeText(v,64,66);x.fillText(v,64,66)}));
const CG=new THREE.CircleGeometry(.5,28),PG=new THREE.PlaneGeometry(1,1),COINR={10:.17,50:.21,100:.25};
const coinsFor=d=>{const r=[];while(d>=100){r.push(100);d-=100}while(d>=50){r.push(50);d-=50}while(d>=10){r.push(10);d-=10}return r};
const tokXY=(i,nb)=>{const r=(i/5)|0;return[-.36+i%5*.18+(r%2?.09:0),(nb?.42-nb*.22:.12)-r*.17]};   // posisi lokal token damage ke-i di kartu: baris berisi 5, di bawah nb badge kondisi
/* panel HP di pojok kanan atas kartu: angka besar menyembul di atas kartu, bar tebal, ikon tipe; latar = warna bingkai kartu.
   HP berubah: angka menghitung naik/turun dgn ▲ hijau / ▼ merah, jejak merah muda menyusul bar yang turun, hijau muda mendahului saat pulih */
const ICT={},TYC2={G:'#22c55e',W:'#0ea5e9',F:'#b45309',L:'#facc15',M:'#9ca3af',N:'#7c3aed',D:'#3b2f5c',P:'#a855f7',R:'#ef4444',C:'#e5e7eb'};
const iconImg=src=>{if(!ICT[src]){const im=new Image();im.onload=()=>{for(const o of OV.values())if(o.ty&&ICONS.type[o.ty]===src)drawHp(o)};im.src=src;ICT[src]=im}return ICT[src]};
const HPW=544,HPH=352,HPT=96,HPK=1.7;   // kanvas digambar 1024 px/unit, dipasang ×HPK (lebih besar dari contoh agar terbaca di HP); panel x 42-416, y 102-227 (+HPT): pojok kanan atasnya = pojok kartu, sisa kanvas atas/kanan untuk angka besar & ▲/▼
const hsl=([r,g,b])=>{const M=Math.max(r,g,b),m=Math.min(r,g,b),d=M-m,l=(M+m)/510,h=!d?0:M===r?(g-b)/d%6:M===g?(b-r)/d+2:(r-g)/d+4;return[h*60,d?d/255/(1-Math.abs(2*l-1)):0,l]},
 mixc=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),rgb=c=>`rgb(${c.map(Math.round)})`,W3=[255,255,255],
 BARC={g:[[146,228,144],[116,208,116]],y:[[232,212,152],[214,188,120]],r:[[230,108,106],[204,80,80]],k:[[190,195,202],[128,134,144]]},
 NUMC={up:[[170,255,204],[104,232,158]],dn:[[255,156,140],[236,98,84]]};
/* warna bingkai = kelompok warna terbanyak di baris HP gambar kartu (teks hampir hitam/putih dilewati), digelapkan seperti contoh (L×.65);
   kartu hampir putih jadi abu netral. Gambar belum termuat: null (digambar ulang oleh cardTex); kanvas ter-taint/kosong: warna cadangan */
const FRC={};
function frameCol(img){if(img in FRC)return FRC[img];const im=TX[img]&&TX[img].image;if(!im)return null;
 try{const w=im.width,h=im.height,sw=w*.255|0,sh=h*.05|0,x=document.createElement('canvas').getContext('2d');x.canvas.width=sw;x.canvas.height=sh;x.drawImage(im,w*.7,h*.03,sw,sh,0,0,sw,sh);
  const d=x.getImageData(0,0,sw,sh).data,B={};let b=null;
  for(let i=0;i<d.length;i+=4){const l=Math.max(d[i],d[i+1],d[i+2])+Math.min(d[i],d[i+1],d[i+2]);if(l<60||l>480)continue;
   const k=d[i]>>5<<6|d[i+1]>>5<<3|d[i+2]>>5,q=B[k]||(B[k]=[0,0,0,0]);q[0]++;q[1]+=d[i];q[2]+=d[i+1];q[3]+=d[i+2];if(!b||q[0]>b[0])b=q}
  const[H,S,L]=hsl(b.slice(1).map(v=>v/b[0]));return FRC[img]={h:H,s:S*Math.min(1,(1-L)*4),l:L*.65}}catch(e){return FRC[img]=null}}
function drawHp(o,now=performance.now()){
 const x=o.cx,a=o.a,T=o.hp/o.mx;let n=o.hp,f=T,gf=T,k=0,pop=1;
 if(a&&now<a.t0){n=a.n0;f=a.f0;gf=a.g0}   // ala Pocket: angka damage tampil dulu di tengah kartu, HP baru turun sesudahnya (FX.hit mengisi o.hold)
 else if(a){const t=now-a.t0,p=a.D?Math.min(1,t/a.D):1,e=1-Math.pow(1-p,3),q=a.D?Math.min(1,Math.max(0,(t-450)/450)):1;   // D=0: tanpa gerak (prefers-reduced-motion)
  n=a.n0+(o.hp-a.n0)*e;f=a.f0+(T-a.f0)*e;gf=a.dir<0?Math.max(f,a.g0+(T-a.g0)*q*q*(3-2*q)):a.dir>0?Math.max(f,T):f;
  const u=Math.min(1,t/120),v=Math.min(1,Math.max(0,(t-a.D)/260));o.z=a.D?(a.z0+(1-a.z0)*u*u*(3-2*u))*(1-v*v*(3-2*v)):0;pop=1+.25*o.z;   // angka membesar ×1.25 selama menghitung, lalu kembali
  k=Math.min(1,Math.max(0,1-(t-a.D-1000)/350));if(!k){o.a=null;n=o.hp;f=gf=T}}   // ▲/▼ bertahan 1 dtk lalu memudar
 o.n=n;o.f=f;o.gf=gf;
 const dead=o.hp<=0&&n<.5,bc=BARC[dead?'k':f>.55?'g':f>.28?'y':'r'],P=frameCol(o.img)||{h:205,s:.45,l:.2};
 x.setTransform(1,0,0,1,0,HPT);x.clearRect(0,-HPT,HPW,HPH);
 const pg=x.createRadialGradient(229,200,20,229,170,230);pg.addColorStop(0,`hsl(${P.h},${P.s*100}%,${P.l*112}%)`);pg.addColorStop(1,`hsl(${P.h},${P.s*100}%,${P.l*86}%)`);
 x.save();x.shadowColor='#0009';x.shadowBlur=10;x.shadowOffsetY=3;rr(x,42,102,374,125,30);x.fillStyle=pg;x.fill();x.restore();
 rr(x,66,147,225,36,18);x.fillStyle='#404040';x.fill();   // bar sejajar ikon tipe (pusat y 165), dekat angka
 if(gf>f+.002){rr(x,66,147,Math.max(36,225*gf),36,18);x.fillStyle=a&&a.dir>0?'#c9ffd6':'#ffd9d2';x.fill()}
 if(f>.004){const g=x.createLinearGradient(0,147,0,183);g.addColorStop(0,rgb(bc[0]));g.addColorStop(1,rgb(bc[1]));rr(x,66,147,Math.max(36,225*f),36,18);x.fillStyle=g;x.fill()}
 const src=ICONS.type[o.ty],im=src&&iconImg(src);
 if(im&&im.complete&&im.naturalWidth)x.drawImage(im,305,121,88,88);else{x.fillStyle=TYC2[o.ty]||'#64748b';x.beginPath();x.arc(349,165,44,0,7);x.fill()}
 const s=String(Math.round(n)),dc=a&&a.dir&&now>=a.t0?NUMC[a.dir>0?'up':'dn']:null,b0=dead?[226,228,232]:mixc(W3,bc[0],.18),b1=dead?[176,180,188]:mixc(W3,bc[1],.38);
 x.save();x.font='900 118px '+FONT;x.lineJoin='round';const tw=x.measureText(s).width;x.translate(56+tw*.675,108);x.scale(pop*1.35,pop*1.35);x.translate(-tw/2,0);   // angka ×1.35 (membesar dari tengahnya), dinaikkan agar digit ke-3 tak menabrak ikon tipe
 const g=x.createLinearGradient(0,-86,0,0);g.addColorStop(0,rgb(dc?mixc(b0,dc[0],k):b0));g.addColorStop(1,rgb(dc?mixc(b1,dc[1],k):b1));
 x.save();x.shadowColor='#000a';x.shadowBlur=8;x.shadowOffsetY=4;x.lineWidth=16;x.strokeStyle='#232722';x.strokeText(s,0,0);x.restore();x.fillStyle=g;x.fillText(s,0,0);
 if(dc&&k>0){x.globalAlpha=k;x.translate(tw+8,-84);x.beginPath();if(a.dir>0){x.moveTo(26,-22);x.lineTo(54,24);x.lineTo(-2,24)}else{x.moveTo(-2,-20);x.lineTo(54,-20);x.lineTo(26,26)}x.closePath();
  x.lineWidth=10;x.strokeStyle='#232722';x.stroke();x.fillStyle=rgb(dc[1]);x.fill()}
 x.restore();o.tex.needsUpdate=true}
function updHp(){const now=performance.now();for(const o of OV.values())if(o.a)drawHp(o,now)}
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
const cntTex=n=>NT[n]||(NT[n]=ctex(128,128,(x)=>{x.beginPath();x.arc(64,64,58,0,7);x.fillStyle='#0f2a43';x.fill();x.lineWidth=8;x.strokeStyle='#fff';x.stroke();x.font=`900 ${n>9?68:90}px `+FONT;x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';x.fillText(String(n),64,70)}));   // jumlah Energi sejenis (badge)
/* kondisi khusus: [ikon, warna, nama]. Badge = pil berwarna berikon + nama di sisi kiri kartu; saat baru didapat muncul label besar (statusPop) */
const BADGE={asleep:['zzz','#2563eb','TIDUR'],confused:['dizzy','#db2777','PUSING'],paralyzed:['zap','#ca8a04','LUMPUH'],poison:['skull','#7e22ce','RACUN'],burn:['flame','#dc2626','LUKA BAKAR']},BDT={};   // nama resmi kartu Indonesia
const badgeT=k=>BDT[k]||(BDT[k]=ctex(320,100,x=>{const[n,c,t]=BADGE[k];x.shadowColor='#0008';x.shadowBlur=8;x.shadowOffsetY=3;rr(x,6,6,308,84,42);x.fillStyle=c;x.fill();x.shadowColor='transparent';x.lineWidth=6;x.strokeStyle='#fff';x.stroke();
 x.fillStyle='#ffffff30';x.beginPath();x.arc(48,48,30,0,7);x.fill();icDraw(x,n,48,48,42,'#fff');x.fillStyle='#fff';x.font='900 34px '+FONT;x.textBaseline='middle';x.fillText(t,90,50,214)}));
/* kondisi khusus hilang (Checkup, mundur, evolusi, item): label hijau "PULIH" berikon kondisi + cleanseFx */
function statusCure(k,P,g){if(RMO)return;const[n,c]=BADGE[k],v=P.clone().project(cam),e=document.createElement('div');e.className='stp cure';e.style.cssText=`left:${(v.x+1)/2*innerWidth}px;top:${(1-v.y)/2*innerHeight}px;--c:${c}`;
 e.innerHTML=`<i>${ic(n)}</i><b>PULIH</b>`;document.body.append(e);setTimeout(()=>e.remove(),1700);if(g)cleanseFx(g,parseInt(c.slice(1),16))}
const ROTC=['asleep','confused','paralyzed'];
function statusPop(k,P){if(RMO)return;const[n,c,t]=BADGE[k],v=P.clone().project(cam),e=document.createElement('div');e.className='stp';e.style.cssText=`left:${(v.x+1)/2*innerWidth}px;top:${(1-v.y)/2*innerHeight}px;--c:${c}`;
 e.innerHTML=`<i>${ic(n)}</i><b>${t}</b>`;document.body.append(e);setTimeout(()=>e.remove(),1700)}
function orbList(mon){if(mon.en.length<=4)return mon.en.map(e=>[e.key==='prism'?'prism':e.t,0]);const c=new Map();for(const e of mon.en){const k=e.key==='prism'?'prism':e.t;c.set(k,(c.get(k)||0)+1)}return[...c]}
function ovBuild(o,mon){
 if(!o.pill){const c=document.createElement('canvas');c.width=HPW;c.height=HPH;o.cx=c.getContext('2d');o.tex=new THREE.CanvasTexture(c);o.tex.anisotropy=4;o.pill=new THREE.Mesh(PG,new THREE.MeshBasicMaterial({map:o.tex,transparent:true,depthWrite:false}));o.pill.scale.set(HPW*HPK/1024,HPH*HPK/1024,1);o.pill.position.set(.5+(HPW/2-416)*HPK/1024,.7+(102+HPT-HPH/2)*HPK/1024,-.03);o.g.add(o.pill);o.sub=new THREE.Group();o.g.add(o.sub)}   // panel .015 di atas kartu: di kamera miring (desktop) tak bergeser dari HP cetak kartu
 const v=Math.max(0,hp(mon)),mx=mon.card.hp;o.ty=mon.card.type;o.img=mon.card.img;
 if(o.hp===undefined){o.hp=o.n=v;o.mx=mx;o.f=o.gf=v/mx}
 else if(v!==o.hp||mx!==o.mx){o.a={t0:Math.max(performance.now(),o.hold||0),n0:o.n,f0:o.f,g0:o.gf,z0:o.z||0,D:RMO?0:500+Math.min(700,Math.abs(v-o.n)*3),dir:Math.sign(v-o.hp)};o.hp=v;o.mx=mx}
 drawHp(o);
 while(o.sub.children.length)o.sub.remove(o.sub.children[0]);
 const now=performance.now(),cd=o.hold>now&&o.cdmg!=null&&o.cdmg<mon.dmg?o.cdmg:mon.dmg;if(cd!==mon.dmg)setTimeout(()=>{o.key='';sync()},o.hold-now+30);o.cdmg=cd;   // token damage baru muncul saat HP mulai turun
 const bd=[];if(mon.sp)bd.push(mon.sp);if(mon.poison)bd.push('poison');if(mon.burn)bd.push('burn');
 const bp=o.bpop||(o.bpop={}),cg=M.get(mon.id);
 for(const k of bd)if(o.bset&&!o.bset.includes(k)&&!RMO){bp[k]=now;const c=parseInt(BADGE[k][1].slice(1),16),q=cg?cg.position:o.g.position;ring(q.x,q.z,c);burst(q.x,q.z,c,40,1.8,.18);statusPop(k,q);if(cg)cg.userData.sh=.9}   // kondisi baru: label besar, gelombang, kartu bergetar
 if(o.bset)for(const k of o.bset)if(!bd.includes(k)&&!(ROTC.includes(k)&&bd.some(x=>ROTC.includes(x))))statusCure(k,cg?cg.position:o.g.position,cg);   // pulih (bukan diganti kondisi rotasi lain)
 o.bset=bd;
 bd.forEach((k,i)=>{const b=new THREE.Mesh(PG,new THREE.MeshBasicMaterial({map:badgeT(k),transparent:true,depthWrite:false})),W=.6,H=.1875;b.scale.set(W,H,1);b.position.set(-.18,.42-i*.22,.035);o.sub.add(b);
  if(bp[k]&&now-bp[k]<900){b.scale.set(.001,.001,1);FXL.push({o:new THREE.Object3D(),t0:bp[k]+500,dur:700,upd(p){if(p<0)return;const f=p<.55?1.35*Math.sin(p/.55*Math.PI/2):1.35-.35*(p-.55)/.45;b.scale.set(W*f,H*f,1)}})}});   // badge timbul sesudah label besar
 coinsFor(cd).forEach((v,i)=>{const c=new THREE.Mesh(CG,new THREE.MeshBasicMaterial({map:coinT(v),transparent:true,depthWrite:false})),[tx,ty]=tokXY(i,bd.length);c.scale.setScalar(COINR[v]);c.position.set(tx,ty,.03+i*.001);o.sub.add(c)});   // baris berisi 5, di bawah badge kondisi
 orbList(mon).forEach(([k,n],i)=>{const px=-.375+i*.25,sg=orbMesh(k);sg.userData.slot=i;sg.position.set(px,-.55,0);o.sub.add(sg);
  if(n>1){const q=new THREE.Sprite(new THREE.SpriteMaterial({map:cntTex(n),depthWrite:false}));q.scale.setScalar(.18);q.position.set(.105,.1,.3);sg.add(q)}})}
/* satu bola Energi di titik 0,0; dipakai overlay & animasi pasang Energi. Di kartu: bayangan kontak + aura halus (di bawah permukaan bola,
   jadi tak menimpa bola tetangga); air=1 (bola terbang): halo cahaya */
function orbMesh(k,air){const sg=new THREE.Group(),b=new THREE.Mesh(SG,orbM(k)),x=air?new THREE.Sprite(auraM(k)):new THREE.Mesh(SHG,SHAD_M);b.position.z=.14;
 if(air){x.position.z=.14;x.scale.setScalar(.36)}else{x.position.set(.016,-.02,.02);for(const m of glowM(k)){const h=new THREE.Sprite(m);h.position.z=.06;h.scale.setScalar(2*.115/.62);sg.add(h)}}
 sg.add(b,x);return sg}
/* Energi/Tool baru menempel: hantu kartu terbang di ATAS Pokémon lalu mengecil masuk, kartu aslinya tumbuh di bawah Pokémon.
   Jadi kartu tak pernah turun menembus kartu Pokémon (dulu lerp lurus dari tangan ke bawah kartu) */
function tuck(g,it){const P=M.get(it.par.id),d=g.userData,gh=newCardMesh(),a=g.position.clone(),r0=g.rotation.x,s0=g.scale.x,t=P?P.position:new THREE.Vector3(it.x,it.y,it.z);
 gh.userData.f.material.map=cardTex(it.c);gh.position.copy(a);gh.rotation.copy(g.rotation);gh.scale.copy(g.scale);scene.add(gh);
 FXL.push({o:gh,t0:performance.now(),dur:560,upd(p){const q=Math.min(1,p/.62),e=q*q*(3-2*q),hy=t.y+.5;gh.position.set(a.x+(t.x-a.x)*e,Math.max(a.y+(hy-a.y)*e,t.y+.25),a.z+(t.z-a.z)*e);
  gh.rotation.x=r0+(-Math.PI/2-r0)*e;gh.rotation.z*=.9;gh.scale.setScalar((s0+(it.s*.8-s0)*e)*(p<.62?1:1-(p-.62)/.38*.97))}});
 g.position.set(it.x,it.y,it.z);g.rotation.set(-Math.PI/2,0,0);g.scale.setScalar(.001);d.grow=performance.now()+330}
/* kartu masuk discard/deck: terbang melengkung (bukan lerp lurus); h = tinggi lengkung, up = mendarat terbuka */
const flyTo=(g,t0,h)=>({t0,dur:640,from:g.position.clone(),s0:g.scale.x,r0:g.rotation.x,z0:g.rotation.z,h});
function flyStep(g,f,now,x,y,z,s,up){const p=(now-f.t0)/f.dur;if(p<0)return false;const q=Math.min(1,p),e=q<.5?4*q*q*q:1-Math.pow(-2*q+2,3)/2;
 g.position.set(f.from.x+(x-f.from.x)*e,f.from.y+(y-f.from.y)*e+Math.sin(Math.PI*q)*f.h,f.from.z+(z-f.from.z)*e);g.scale.setScalar(f.s0+(s-f.s0)*e);
 g.rotation.x=f.r0+((up?-Math.PI/2:Math.PI/2)-f.r0)*e;g.rotation.z=f.z0*(1-e)+Math.sin(Math.PI*q)*.35;return q>=1}
function sync(){
 if(!G||!G.p)return;{const bn=Math.max(bmax('p'),bmax('o'));if(bn!==BENCHN){BENCHN=bn;drawSlots()}}
 const L=lay(),seen=new Set(),now=performance.now(),fly=[];LI=new Map();
 for(const it of L){seen.add(it.id);LI.set(it.id,it);let g=M.get(it.id),nw=0;
  if(!g){nw=1;g=newCardMesh();M.set(it.id,g);scene.add(g);const m=it.sd==='o'?-1:1,dp=Z.dk(m);g.position.set(dp[0],1.5,dp[1]);g.scale.setScalar(.3);g.rotation.x=Math.PI/2}
  const d=g.userData,pz=nw?null:d.t&&d.t.zone;if(d.die){d.die=0;d.fly=null}d.dest=null;d.t=it;d.id=it.id;g.visible=!it.hide;
  if(pz&&pz!==it.zone){d.lift=d.stz=d.st=d.ko=d.big=0;d.off.x=d.off.z=0;if(it.zone==='dis'||it.zone==='dk')d.rzb=0}   // pindah zona: buang sisa efek KO/serangan (dulu kartu discard tetap miring & terangkat)
  if(it.zone==='att'&&pz!=='att'&&!it.hide&&it.up)tuck(g,it);
  if(it.zone==='dis'&&pz!=='dis')fly.push(g);
  const sf=it.up&&it.c,key=sf?'f'+it.c.img:'b';
  if(d.key!==key&&!(d.evoT>now)){d.key=key;d.f.material.map=sf?cardTex(it.c):BACKT;d.f.material.needsUpdate=true}   // evoT: FX.evolve menahan kartu lama
  if(it.lab&&sf){const lk=it.lab+it.labc;if(d.lk!==lk){d.lk=lk;d.lab.material.map=labTex(it.lab,it.labc,it.labi)}d.lab.position.y=it.laby;d.lab.visible=true}else d.lab.visible=false;
  let px=PX.get(it.id);if(!px){px=new THREE.Mesh(GEO,PXM);px.userData.id=it.id;PX.set(it.id,px);scene.add(px)}
  px.position.set(it.x,it.y,it.z);px.rotation.x=it.up?-Math.PI/2+(it.tilt||0):Math.PI/2;px.scale.setScalar(it.s);px.updateMatrixWorld();
  if(it.mon&&(it.zone==='act'||it.zone==='ben')&&it.up){let o=OV.get(it.id);if(!o){o={g:new THREE.Group(),key:''};o.g.rotation.x=-Math.PI/2;scene.add(o.g);OV.set(it.id,o)}
   o.g.visible=true;const m=it.mon,k=[m.card.type,hp(m),m.card.hp,m.sp,m.poison,m.burn,m.en.length,m.tool?1:0].join('|');if(o.key!==k){o.key=k;ovBuild(o,m)}}
  else{const o=OV.get(it.id);if(o)o.g.visible=false}
  cfSync(it.id,it.mon,!!(it.mon&&it.zone==='act'&&it.up))}
 const dest=new Map();for(const sd of['p','o']){const m=sd==='p'?1:-1;for(const c of G[sd].discard)dest.set(c.id,[...Z.dis(m),1]);for(const c of G[sd].deck)dest.set(c.id,[...Z.dk(m),0])}
 let st=0;   // KO: kartu Pokémon dulu, lalu Energi/Tool menyusul satu per satu
 for(const[id,g]of M)if(!seen.has(id)){const d=g.userData;d.dest=dest.get(id)||null;if(!d.die){d.die=1;d.dieT=now;d.fly=d.dest?flyTo(g,now+(st++)*90,d.dest[3]?1.1:.7):null}const q=PX.get(id);if(q){scene.remove(q);PX.delete(id)};const o=OV.get(id);if(o){scene.remove(o.g);OV.delete(id)}cfDrop(id)}
 for(const g of fly)g.userData.fly=flyTo(g,now+(st++)*90,1.1);
 hud()}
const spin=mon=>mon.sp==='asleep'?Math.PI/2:mon.sp==='paralyzed'?-Math.PI/2:mon.sp==='confused'?Math.PI:0;
/* kartu Trainer yang sedang dimainkan: melayang di antara Active & garis tengah, sisi kanan (ala PTCGL di samping Active) */
const playSpot=sd=>{const m=sd==='p'?1:-1;return LAYMODE?[2.1,1,Z.act(m)[1]*.5,1.1]:[1.6,1,Z.act(m)[1]*.45,.95]};
function lay(){
 const L=[],add=(id,c,o)=>L.push({id,c,up:1,y:.06,s:1,x:0,z:0,...o});
 for(const sd of['p','o']){
  const S=G[sd],m=sd==='p'?1:-1,hid=G.phase==='setup';
  const mons=[];if(S.active)mons.push([S.active,Z.act(m),'act']);S.bench.forEach((b,i)=>mons.push([b,Z.ben(i,m),'ben']));
  for(const[mon,[x0,z0,s0],zone]of mons){
   const x=x0,z=z0,s=s0,y=.12;   // kartu sumber damage counter tetap di slotnya (koinnya melayang di atasnya, lihat trayPos di ui.js)
   add(mon.id,mon.card,{sd,zone,mon,x,z,s,y,up:!hid,rz:spin(mon)});
   const n=mon.en.length,st=Math.min(.2,.5/Math.max(n,1))*s;
   mon.en.forEach((e,i)=>add(e.id,e,{sd,zone:'att',par:mon,x,z:z-m*(i+1)*st,s,y:.09-i*.011,up:!hid}));
   if(mon.tool)add(mon.tool.id,mon.tool,{sd,zone:'att',par:mon,x:x+.14*s,z:z+m*.22*s,s,y:.08,up:!hid,lab:cname(mon.tool),labi:'tool',labc:'#0f766e',laby:-m*.63})}
  S.prizes.forEach((c,i)=>add(c.id,c,{sd,zone:'pz',x:Z.pri(i,m)[0],z:Z.pri(i,m)[1],s:Z.pri(i,m)[2],up:0}));   // Prize di meja selalu tertutup
  for(let i=0;i<Math.min(4,Math.ceil(S.deck.length/12));i++){const[x,z,s]=Z.dk(m);add('dk'+sd+i,null,{sd,zone:'dk',x,z,s,up:0,y:.06+i*.05})}
  const t=S.discard[S.discard.length-1];if(t){const[x,z,s]=Z.dis(m);add(t.id,t,{sd,zone:'dis',x,z,s})}
  const n=S.hand.length,D=UI.deal&&UI.deal[sd],MU=UI.mull&&UI.mull.sd===sd;
  S.hand.forEach((c,i)=>{
   const dl=D?{t1:D.hold?1e15:D.t0+i*85}:null;   // kartu Bot: tunggu di deck lalu keluar satu per satu
   if(sd==='p'){const sp=Math.min(LAY.hsp,LAY.handW/Math.max(n-1,1));add(c.id,c,{sd,zone:'hand',idx:i,x:(i-(n-1)/2)*sp,z:LAY.handZ||5.6,s:LAY.hs,y:.95+i*.03,tilt:.15,dl,hide:MU||!!(UI.handHide&&UI.handHide.has(c.id))})}   // disembunyikan selama ditunjukkan menghadap layar (mulligan, handShow)
   else add(c.id,c,{sd,zone:'ohand',up:0,x:(i-(n-1)/2)*Math.min(.62,(LAY.W-2)/Math.max(n,1)),z:LAY.ohandZ||-5,s:LAY.ohs,y:.4+i*.02,dl,hide:MU})})}
 if(G.limbo&&UI.limbo&&UI.limbo.c===G.limbo){const l=UI.limbo,P=playSpot(l.sd);add(l.c.id,l.c,{sd:l.sd,zone:'limbo',x:P[0],y:P[1],z:P[2],s:P[3],up:1,hide:l.pos==='hidden'})}
 if(G.stadium){const[x,z,s]=LAY.stad;add(G.stadium.card.id,G.stadium.card,{sd:G.stadium.owner,zone:'stad',x,z,s,y:.1,up:1})}
 if(UI.attach){const ls=UI.attach.list,n=ls.length,P=LAYMODE?[-3.3,-.15,1,.95]:[-.8,0,.95,.84];   // Energi yang dibagi (Flare Turbo): di garis tengah sisi kiri (HP: kiri tombol), agar tak menutupi Bench tujuan
  ls.forEach((c,i)=>add(c.id,c,{sd:'p',zone:'pend',idx:i,x:P[0]+(i-(n-1)/2)*P[2],z:P[1],s:P[3],y:1.5,up:1,lab:`Energi ${i+1}`,labc:ETC[c.t]||'#7c3aed',laby:.63}))}
 return L}
/* ---------- VFX ---------- */
const FXL=[],shufT={p:0,o:0};
function burst(x,z,col,n=40,up=2.2,sz=.16){const geo=new THREE.BufferGeometry(),pos=new Float32Array(n*3),vel=[];for(let i=0;i<n;i++){pos[i*3]=x;pos[i*3+1]=.5;pos[i*3+2]=z;const a=Math.random()*6.28,r=Math.random()*1.6;vel.push([Math.cos(a)*r,Math.random()*up+.6,Math.sin(a)*r])}
 geo.setAttribute('position',new THREE.BufferAttribute(pos,3));const mt=new THREE.PointsMaterial({size:sz,color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}),o=new THREE.Points(geo,mt);scene.add(o);
 FXL.push({o,t0:performance.now(),dur:1100,upd(p){const q=geo.attributes.position;for(let i=0;i<n;i++){q.array[i*3]+=vel[i][0]*.016;q.array[i*3+1]+=vel[i][1]*.016-.02*p;q.array[i*3+2]+=vel[i][2]*.016}q.needsUpdate=true;mt.opacity=1-p}})}
function ring(x,z,col,k=1){const r=new THREE.Mesh(new THREE.RingGeometry(.55,.7,40),new THREE.MeshBasicMaterial({color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));r.rotation.x=-Math.PI/2;r.position.set(x,.2,z);scene.add(r);
 FXL.push({o:r,t0:performance.now(),dur:900,upd(p){r.scale.setScalar((.6+p*3.2)*k);r.material.opacity=1-p}})}
const RG=(()=>{const t=ctex(128,180,(x)=>{x.shadowColor='#fff';x.shadowBlur=14;rr(x,12,12,104,156,12);x.lineWidth=9;x.strokeStyle='#fff';x.stroke()});
 return Array.from({length:14},()=>{const m=new THREE.Mesh(GEO,new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,color:0xfcd34d}));m.rotation.x=-Math.PI/2;m.visible=false;scene.add(m);return m})})();
/* muka koin (koin 3D penentu giliran & koin overlay ala Pocket): Kepala = bingkai emas, cincin gelap, muka krem + petir; Ekor = koin arang dgn lambang bola timbul */
const coinArt=(h,S=256)=>{const c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),r=S/2,k=S/256;let g=x.createLinearGradient(0,0,S,S);
 (h?[[0,'#fff2a6'],[.5,'#e3a21a'],[1,'#8c5a05']]:[[0,'#c7ccd4'],[.5,'#5d6573'],[1,'#22262d']]).forEach(([t,cl])=>g.addColorStop(t,cl));x.fillStyle=g;x.beginPath();x.arc(r,r,r-1,0,7);x.fill();
 if(h){x.fillStyle='#231c16';x.beginPath();x.arc(r,r,r*.87,0,7);x.fill();g=x.createRadialGradient(r*.8,r*.7,4,r,r,r*.82);g.addColorStop(0,'#fffdf2');g.addColorStop(1,'#efdca8');x.fillStyle=g;x.beginPath();x.arc(r,r,r*.8,0,7);x.fill();
  x.save();x.translate(r,r);x.scale(k,k);x.beginPath();[[14,-74],[-34,6],[-4,6],[-16,74],[38,-12],[6,-12],[24,-74]].forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath();x.lineJoin='round';x.lineWidth=12;x.strokeStyle='#231c16';x.stroke();
  g=x.createLinearGradient(0,-74,0,74);g.addColorStop(0,'#ffe46b');g.addColorStop(1,'#f5a300');x.fillStyle=g;x.fill();x.restore()}
 else{g=x.createRadialGradient(r*.75,r*.65,4,r,r,r*.9);g.addColorStop(0,'#5b6472');g.addColorStop(1,'#15181e');x.fillStyle=g;x.beginPath();x.arc(r,r,r*.9,0,7);x.fill();
  const em=(o,cl)=>{x.strokeStyle=cl;x.lineWidth=10*k;x.beginPath();x.arc(r+o,r+o,r*.5,0,7);x.moveTo(r*.5+o,r+o);x.lineTo(r*.85+o,r+o);x.moveTo(r*1.15+o,r+o);x.lineTo(r*1.5+o,r+o);x.stroke();x.beginPath();x.arc(r+o,r+o,r*.15,0,7);x.stroke()};
  em(2*k,'#0b0d11');em(-1.5*k,'#9aa3af')}
 return c};
/* koin & dadu 3D penentu giliran: gerak dihitung dulu dgn fisika sederhana (lempar dari sisimu, berputar, memantul di meja, koin bergoyang ala Euler disk,
   dadu menggelinding lalu rebah). Hasil dipaksa dgn menukar tekstur sisi yang akhirnya menghadap atas, jadi gerakannya tetap alami */
const rs=a=>(Math.random()*2-1)*a;
const COIN=(()=>{const R=1.05,H=.12,tx=h=>{const t=new THREE.CanvasTexture(coinArt(h,512));t.anisotropy=8;return t},
 edge=ctex(256,16,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#7a4f06');g.addColorStop(.5,'#f2c14e');g.addColorStop(1,'#7a4f06');x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='#0004';for(let i=0;i<w;i+=4)x.fillRect(i,0,2,h)}),
 ph=(map,c)=>new THREE.MeshPhongMaterial({map,color:c||0xb4b4b4,specular:0x9a7a3a,shininess:70}),HM=ph(tx(1)),TM=ph(tx(0)),m=new THREE.Mesh(new THREE.CylinderGeometry(R,R,H,64),[ph(edge,0xc4c4c4),HM,TM]),g=new THREE.Group(),
 sh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:SHAD_M.map,transparent:true,depthWrite:false}));
 m.rotation.y=Math.PI/2;sh.rotation.x=-Math.PI/2;g.add(m);g.visible=sh.visible=false;scene.add(g,sh);return{g,m,sh,R,H,HM,TM}})();
function simCoin(){const C=COIN,F=[],dt=1/120;let x=rs(.25),y=.05,z=2.6,vx=rs(.35),vy=10.4+Math.random()*.8,vz=-2.4,th=0,w=(19+Math.random()*7)*(Math.random()<.5?1:-1),b=0,lo=0;
 for(let t=0;t<4;t+=dt){vy-=24*dt;x+=vx*dt;y+=vy*dt;z+=vz*dt;th+=w*dt;lo=y-(C.R*Math.abs(Math.sin(th))+C.H/2*Math.abs(Math.cos(th)));
  if(lo<0){y-=lo;if(vy<0){b++;vy=-vy*.4;vx*=.55;vz*=.5;w=w*.45+rs(3)}}F.push([x,y,z,th,0,0]);if(b>=2&&vy<2&&lo<.03)break}
 const tt=Math.round(th/Math.PI)*Math.PI,a0=th-tt,b0=.16+Math.random()*.06;let ph=Math.random()*6;   // rebah ke sisi terdekat, lalu goyang mengecil sambil berputar makin cepat
 for(let t=0;t<.2;t+=dt){const a=a0*(1-(t/.2)**2);F.push([x,C.R*Math.abs(Math.sin(a))+C.H/2*Math.cos(a),z,tt+a,0,0])}
 for(let t=0;t<1;t+=dt){const be=b0*Math.exp(-t*3.2)*(1-t);ph+=(5+1.4/(be+.03))*dt;F.push([x,C.R*Math.sin(be)+C.H/2*Math.cos(be),z,tt,be,ph])}
 F.push([x,C.H/2,z,tt,0,ph]);return{F,up:Math.round(tt/Math.PI)%2===0}}
const DIE=(()=>{const S=.95,r=.15,geo=new THREE.BoxGeometry(S,S,S,8,8,8),P=geo.attributes.position,v=new THREE.Vector3(),c=new THREE.Vector3(),h=S/2-r;
 for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i);c.set(Math.max(-h,Math.min(h,v.x)),Math.max(-h,Math.min(h,v.y)),Math.max(-h,Math.min(h,v.z)));v.sub(c).normalize().multiplyScalar(r).add(c);P.setXYZ(i,v.x,v.y,v.z)}   // sudut membulat
 geo.computeVertexNormals();
 const PIP={1:[[.5,.5]],2:[[.27,.27],[.73,.73]],3:[[.25,.25],[.5,.5],[.75,.75]],4:[[.27,.27],[.73,.27],[.27,.73],[.73,.73]],5:[[.26,.26],[.74,.26],[.5,.5],[.26,.74],[.74,.74]],6:[[.28,.22],[.72,.22],[.28,.5],[.72,.5],[.28,.78],[.72,.78]]},
  F=[0,1,2,3,4,5,6].map(n=>n&&new THREE.MeshPhongMaterial({color:0xc8c8c8,specular:0x555555,shininess:40,map:ctex(256,256,x=>{const g=x.createRadialGradient(110,100,20,128,128,190);g.addColorStop(0,'#fffdf6');g.addColorStop(1,'#ece5d3');x.fillStyle=g;x.fillRect(0,0,256,256);
   PIP[n].forEach(([a,b])=>{const q=x.createRadialGradient(a*256+5,b*256+6,2,a*256,b*256,n===1?30:22);q.addColorStop(0,'#000');q.addColorStop(.75,n===1?'#7f1d1d':'#141821');q.addColorStop(1,'#6b7280');x.fillStyle=q;x.beginPath();x.arc(a*256,b*256,n===1?28:21,0,7);x.fill()})})})),   // titik cekung; angka 1 merah tua
  m=new THREE.Mesh(geo,[1,6,2,5,3,4].map(n=>F[n])),sh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:SHAD_M.map,transparent:true,depthWrite:false}));
 sh.rotation.x=-Math.PI/2;m.visible=sh.visible=false;scene.add(m,sh);return{m,sh,S,F}})();
function simDie(v){const D=DIE,F=[],dt=1/120,h=D.S/2*.94,q=new THREE.Quaternion().setFromEuler(new THREE.Euler(rs(3),rs(3),rs(3))),w=new THREE.Vector3(rs(9),rs(5),rs(9)),p=new THREE.Vector3(rs(.5),1.1,3.2),vl=new THREE.Vector3(rs(.9),4.2,-4.2),
  C=[-1,1].flatMap(a=>[-1,1].flatMap(b=>[-1,1].map(c=>new THREE.Vector3(a*h,b*h,c*h)))),tmp=new THREE.Vector3(),dq=new THREE.Quaternion();let b=0;
 for(let t=0;t<4;t+=dt){vl.y-=22*dt;p.addScaledVector(vl,dt);const wl=w.length();if(wl>1e-4){dq.setFromAxisAngle(tmp.copy(w).divideScalar(wl),wl*dt);q.premultiply(dq)}
  let lo=1e9;for(const c of C){const y=tmp.copy(c).applyQuaternion(q).y+p.y;if(y<lo)lo=y}
  if(lo<0){p.y-=lo;if(vl.y<0){b++;vl.y=-vl.y*.36;vl.x*=.7;vl.z*=.7;w.multiplyScalar(.55).add(tmp.set(vl.z,rs(2),-vl.x).multiplyScalar(2.2/D.S))}}   // memantul + menggelinding searah gerak
  F.push([p.x,p.y,p.z,q.x,q.y,q.z,q.w]);if(b>=3&&vl.length()<1.1&&lo<.02)break}
 const used=[],ax=[new THREE.Vector3(1,0,0),new THREE.Vector3(0,1,0)].map(a=>{a.applyQuaternion(q);let i=-1;for(let k=0;k<3;k++)if(!used.includes(k)&&(i<0||Math.abs(a.getComponent(k))>Math.abs(a.getComponent(i))))i=k;used.push(i);return new THREE.Vector3().setComponent(i,Math.sign(a.getComponent(i))||1)});   // rebah ke orientasi tegak lurus terdekat (sumbu tak boleh kembar)
 ax.push(new THREE.Vector3().crossVectors(ax[0],ax[1]));const qt=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(...ax)),q0=q.clone(),y0=p.y;
 for(let t=0;t<.45;t+=dt){const e=1-Math.pow(1-t/.45,3);q.copy(q0).slerp(qt,e);p.x+=vl.x*dt*(1-e);p.z+=vl.z*dt*(1-e);F.push([p.x,y0+(D.S/2-y0)*e,p.z,q.x,q.y,q.z,q.w])}
 const N=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],top=N.findIndex(n=>new THREE.Vector3(...n).applyQuaternion(qt).y>.9),rest=[1,2,3].filter(a=>a!==Math.min(v,7-v)).sort(()=>Math.random()-.5),vals=[];
 vals[top]=v;vals[top^1]=7-v;[0,1,2].filter(k=>k!==top>>1).forEach((k,j)=>{const a=rest[j],f=Math.random()<.5;vals[2*k]=f?a:7-a;vals[2*k+1]=f?7-a:a});   // sisi atas = hasil, sisi berlawanan berjumlah 7
 D.m.material=vals.map(n=>D.F[n]);return F}
let CS=null,DS=null;
const XA=new THREE.Vector3(1,0,0),TA=new THREE.Vector3(),QB=new THREE.Quaternion();
function poseShadow(sh,x,y,z,r){sh.position.set(x,.013,z);sh.scale.setScalar(r*(1+y*.35));sh.material.opacity=.62/(1+y*.9)}
function coinPose(f){const C=COIN;C.g.position.set(f[0],f[1],f[2]);C.g.quaternion.setFromAxisAngle(XA,f[3]);if(f[4])C.g.quaternion.premultiply(QB.setFromAxisAngle(TA.set(Math.cos(f[5]),0,-Math.sin(f[5])),f[4]));poseShadow(C.sh,f[0],f[1],f[2],C.R*2.7)}
function diePose(f){const D=DIE;D.m.position.set(f[0],f[1],f[2]);D.m.quaternion.set(f[3],f[4],f[5],f[6]);poseShadow(D.sh,f[0],f[1],f[2],D.S*2.3)}
/* ---------- VFX kondisi khusus ---------- */
const STX={};const stex=k=>STX[k]||(STX[k]=ctex(64,64,(x)=>{
 if(k==='bub'){const g=x.createRadialGradient(32,32,2,32,32,28);g.addColorStop(0,'#ffffffcc');g.addColorStop(.6,'#ffffff55');g.addColorStop(1,'#fff0');x.fillStyle=g;x.beginPath();x.arc(32,32,28,0,7);x.fill();x.lineWidth=3;x.strokeStyle='#fffa';x.beginPath();x.arc(32,32,22,0,7);x.stroke()}
 else if(k==='flame'){const g=x.createRadialGradient(32,40,2,32,36,30);g.addColorStop(0,'#fff');g.addColorStop(.35,'#ffd24a');g.addColorStop(.7,'#ff6a00aa');g.addColorStop(1,'#f000');x.fillStyle=g;x.beginPath();x.moveTo(32,2);x.quadraticCurveTo(58,34,44,54);x.quadraticCurveTo(32,66,20,54);x.quadraticCurveTo(6,34,32,2);x.fill()}
 else if(k==='z'){x.font='900 54px '+FONT;x.textAlign='center';x.textBaseline='middle';x.lineWidth=7;x.strokeStyle='#1e3a8a';x.strokeText('Z',32,34);x.fillStyle='#fff';x.fillText('Z',32,34)}
 else if(k==='star'){x.fillStyle='#fff';x.beginPath();for(let i=0;i<10;i++){const r=i%2?11:28,a=-Math.PI/2+i*Math.PI/5;x.lineTo(32+Math.cos(a)*r,32+Math.sin(a)*r)}x.closePath();x.fill()}
 else{const g=x.createRadialGradient(32,32,1,32,32,26);g.addColorStop(0,'#fff');g.addColorStop(.3,'#fff6a0');g.addColorStop(1,'#fff0');x.fillStyle=g;x.fillRect(0,0,64,64)}}));
const EMK={poison:{tex:'bub',n:34,size:.27,rate:.35,col:[.85,.45,1]},burn:{tex:'flame',n:38,size:.42,rate:.9,col:[1,.5,.08]},asleep:{tex:'z',n:7,size:.52,rate:.22,col:[.7,.85,1]},confused:{tex:'star',n:7,size:.36,rate:.4,col:[1,.6,.9]},paralyzed:{tex:'spark',n:30,size:.36,rate:2.4,col:[1,.95,.4]}},
 STC={poison:0x9333ea,burn:0xf97316,asleep:0x1e3a8a,confused:0xec4899,paralyzed:0xfacc15};   // warna tint & bingkai kartu per kondisi
const CF=new Map();
function mkEm(kind){const k=EMK[kind],n=k.n,geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));geo.setAttribute('color',new THREE.BufferAttribute(new Float32Array(n*3),3));
 const p=new THREE.Points(geo,new THREE.PointsMaterial({size:k.size,map:stex(k.tex),vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));p.frustumCulled=false;scene.add(p);
 const o={p,kind,t0:performance.now(),seed:Array.from({length:n},()=>[Math.random(),Math.random(),Math.random()])};   // t0: aura memudar masuk (cfUpdate)
 if(kind==='paralyzed'){const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(3*2*8*3),3));o.bolt=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0xfff27a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));o.bolt.frustumCulled=false;scene.add(o.bolt)}
 return o}
/* per kartu berkondisi: emitter partikel per kondisi + tint warna di atas gambar kartu + bingkai bercahaya (warna bergantian bila >1 kondisi) */
const cfVis=()=>{const t=new THREE.Mesh(GEO,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false})),f=new THREE.Mesh(GEO,new THREE.MeshBasicMaterial({map:RG[0].material.map,color:0xffffff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(t,f);return{t,f}};
function cfSync(id,mon,on){   // kondisi yang hilang tak langsung dihapus: memudar keluar (out) di cfUpdate
 let cf=CF.get(id);const want=[],now=performance.now();if(on){if(mon.sp)want.push(mon.sp);if(mon.poison)want.push('poison');if(mon.burn)want.push('burn')}
 if(!cf){if(!want.length)return;cf={};CF.set(id,cf)}
 for(const k of Object.keys(cf))if(k!=='_v'){if(want.includes(k))cf[k].out=0;else if(!cf[k].out)cf[k].out=now}
 for(const k of want)if(!cf[k])cf[k]=mkEm(k);
 if(want.length){if(!cf._v)cf._v={...cfVis(),t0:now};cf._v.out=0}else if(cf._v&&!cf._v.out)cf._v.out=now}
function cfDrop(id){const cf=CF.get(id);if(!cf)return;for(const k of Object.keys(cf)){if(k==='_v'){scene.remove(cf._v.t,cf._v.f);continue}scene.remove(cf[k].p);if(cf[k].bolt)scene.remove(cf[k].bolt)}CF.delete(id)}
function cfUpdate(t){
 for(const[id,cf]of CF){const g=M.get(id);if(!g)continue;const s=g.scale.x,P=g.position;
  const now=performance.now(),gone=x=>x.out?Math.max(0,1-(now-x.out)/(RMO?1:700)):1;   // memudar keluar setelah pulih
  for(const k of Object.keys(cf))if(k!=='_v'&&cf[k].out&&!gone(cf[k])){scene.remove(cf[k].p);if(cf[k].bolt)scene.remove(cf[k].bolt);delete cf[k]}
  if(cf._v&&cf._v.out&&!gone(cf._v)){scene.remove(cf._v.t,cf._v.f);delete cf._v}
  const V=cf._v,ks=Object.keys(cf).filter(k=>k!=='_v'),kv=ks.filter(k=>!cf[k].out),kl=kv.length?kv:ks;
  if(!ks.length&&!V){CF.delete(id);continue}
  if(V&&kl.length){const k=kl[Math.floor(t/1.4)%kl.length],fd=(RMO?1:Math.min(1,(now-V.t0)/1200))*gone(V),pl=.5+.5*Math.sin(t*3.2),fl=k==='paralyzed'&&Math.floor(t*14)%5===0?.4:1;
   V.t.material.color.setHex(STC[k]);V.t.position.set(P.x,P.y+.006,P.z);V.t.rotation.copy(g.rotation);V.t.scale.copy(g.scale);V.t.material.opacity=fd*fl*(k==='asleep'?.34+.08*pl:.16+.12*pl);   // tint: kartu jelas berwarna kondisi
   V.f.material.color.setHex(STC[k]===0x1e3a8a?0x60a5fa:STC[k]);V.f.position.set(P.x,P.y+.012,P.z);V.f.rotation.copy(g.rotation);V.f.scale.copy(g.scale).multiplyScalar(1.12+.02*pl);V.f.material.opacity=fd*fl*(.55+.4*pl)}   // bingkai bercahaya berdenyut
  for(const kind of ks){const em=cf[kind],K=EMK[kind],pos=em.p.geometry.attributes.position,col=em.p.geometry.attributes.color,n=K.n,fd=(RMO?1:Math.min(1,(now-em.t0)/1800)**2)*gone(em);
   for(let i=0;i<n;i++){const[a,b,c]=em.seed[i],ph=(t*K.rate+i/n)%1;let x=0,y=0,z=0,f=1;
    if(kind==='poison'){x=(a-.5)*.95;z=(b-.5)*1.35;y=.1+ph*.85;f=Math.sin(Math.PI*ph);x+=Math.sin(t*3+i)*.05}
    else if(kind==='burn'){x=(a-.5)*.85+Math.sin(t*8+i)*.04;z=.45+b*.25;y=.08+ph*.8;f=Math.min(1,(1-ph)*1.4)}
    else if(kind==='asleep'){x=.3+ph*.55+(a-.5)*.1;z=-.45-ph*.25;y=.25+ph*1.05;f=Math.sin(Math.PI*ph)}
    else if(kind==='confused'){const an=t*2.6+i*Math.PI*2/n;x=Math.cos(an)*.5;z=-.62+Math.sin(an)*.16;y=.5+Math.sin(an)*.08}
    else{const sd=a>.5?1:-1;x=sd*(.4+(b-.5)*.2)+(Math.random()-.5)*.08;z=(c-.5)*1.4;y=.12+Math.random()*.3;f=ph<.5?1:.15}
    pos.array[i*3]=P.x+x*s;pos.array[i*3+1]=P.y+.06+y*s;pos.array[i*3+2]=P.z+z*s;col.array[i*3]=K.col[0]*f*fd;col.array[i*3+1]=K.col[1]*f*fd;col.array[i*3+2]=K.col[2]*f*fd}
   pos.needsUpdate=true;col.needsUpdate=true;em.p.material.size=K.size*Math.max(.6,s);
   if(em.bolt){const q=em.bolt.geometry.attributes.position;let w=0;const fl=Math.floor(t*14)%4;for(let b=0;b<3;b++){let px=(b-1)*.3,pz=-.7;for(let k=0;k<8;k++){const nx=(b-1)*.3+(Math.sin(fl*7+b*3+k*1.7)*.12),nz=-.7+(k+1)*.2;q.array[w++]=P.x+px*s;q.array[w++]=P.y+.1;q.array[w++]=P.z+pz*s;q.array[w++]=P.x+nx*s;q.array[w++]=P.y+.1;q.array[w++]=P.z+nz*s;px=nx;pz=nz}}
    q.needsUpdate=true;em.bolt.visible=fl!==3;em.bolt.material.opacity=fd}}}}
/* cahaya giliran kini overlay CSS #tl (style.css), tak lagi bidang 3D */
setTheme(0);fit();
/* ---------- kotak mainkan Trainer & koin damage yang diseret ---------- */
const DZ=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.3),new THREE.MeshBasicMaterial({map:ctex(512,144,(x,w,h)=>{x.fillStyle='#ffffff26';rr(x,6,6,w-12,h-12,28);x.fill();x.setLineDash([22,14]);x.lineWidth=7;x.strokeStyle='#fff';rr(x,6,6,w-12,h-12,28);x.stroke();x.setLineDash([]);x.fillStyle='#fff';x.font='900 34px '+FONT;x.textAlign='center';x.textBaseline='middle';x.shadowColor='#000a';x.shadowBlur=6;x.fillText('LEPAS DI SINI UNTUK MEMAINKAN KARTU',w/2,h/2,w-40)}),transparent:true,depthWrite:false,color:0x4dff88}));
DZ.rotation.x=-Math.PI/2;DZ.position.set(0,.24,0);DZ.visible=false;scene.add(DZ);
const dcTex=v=>ctex(256,256,(x)=>{const g=x.createRadialGradient(128,128,10,128,128,120);g.addColorStop(0,'#fef08a');g.addColorStop(1,'#ca8a04');x.fillStyle=g;x.beginPath();x.arc(128,128,120,0,7);x.fill();x.lineWidth=12;x.strokeStyle='#fff';x.stroke();x.fillStyle='#fff';x.strokeStyle='#0008';x.lineWidth=10;x.font='900 120px '+FONT;x.textAlign='center';x.textBaseline='middle';x.strokeText(String(v),128,134);x.fillText(String(v),128,134)});
/* koin damage counter 3D (tebal, tepi emas) untuk diseret & dilempar. Tiap koin punya bayangan di meja dan jejak emas saat terbang; geraknya di coinsUpd (ui.js) */
const DQ=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2),TRN=8,DCF=new THREE.MeshBasicMaterial({map:dcTex(10),transparent:true}),DCE=new THREE.MeshBasicMaterial({color:0xa16207}),DDOT=ctex(32,32,(x,w)=>{const g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'#fff');g.addColorStop(.35,'#ffffffb0');g.addColorStop(1,'#fff0');x.fillStyle=g;x.fillRect(0,0,w,w)});   // DDOT: titik jejak bulat lembut. DQ: angka "10" di tutup silinder tegak menghadap kamera
const DCS=Array.from({length:6},()=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.06,40),[DCE,DCF,DCF]),u=m.userData,tg=new THREE.BufferGeometry(),c=new Float32Array(TRN*3);m.quaternion.copy(DQ);m.visible=false;u.k=1;
 u.shd=new THREE.Mesh(SHG,new THREE.MeshBasicMaterial({map:SHAD_M.map,transparent:true,depthWrite:false}));u.shd.rotation.x=-Math.PI/2;u.shd.visible=false;
 for(let j=0;j<TRN;j++){const f=(1-j/TRN)**1.5;c.set([f,.82*f,.3*f],j*3)}tg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(TRN*3),3));tg.setAttribute('color',new THREE.BufferAttribute(c,3));
 u.trl=new THREE.Points(tg,new THREE.PointsMaterial({map:DDOT,size:.3,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));u.trl.visible=false;u.trl.frustumCulled=false;scene.add(m,u.shd,u.trl);return m});

const ZH=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:ctex(256,256,(x,w,h)=>{x.fillStyle='#ffffff55';rr(x,6,6,w-12,h-12,34);x.fill();x.lineWidth=9;x.strokeStyle='#ffffffe0';x.stroke()}),transparent:true,depthWrite:false,color:0x4dff88}));
ZH.rotation.x=-Math.PI/2;ZH.position.y=.22;ZH.visible=false;scene.add(ZH);
