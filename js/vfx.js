/* ===== VFX serangan (hibrida Pocket + PTCGL) =====
   atkIntro (dipanggil FX.announce 'Jurus'): penyerang dipanggungkan di samping (terangkat, membesar, miring) + aura & energi
   berkumpul, pita di celah antara kedua Active, kamera zoom sesaat. FX.strike: resep VFX per jurus (kode efek → kata kunci
   nama → tipe kartu); selesai tepat saat benturan agar angka damage muncul saat kena, lalu penyerang kembali ke slot. */
const V3=(x,y,z)=>new THREE.Vector3(x,y,z),VC=t=>parseInt((TYB[t]||TYB.C)[0].slice(1),16);
const VX={
 glow:ctex(128,128,(x)=>{const g=x.createRadialGradient(64,64,0,64,64,64);[[0,'#fff'],[.22,'#ffffffd8'],[.55,'#ffffff40'],[1,'#fff0']].forEach(([t,c])=>g.addColorStop(t,c));x.fillStyle=g;x.fillRect(0,0,128,128)}),
 streak:ctex(256,32,(x)=>{const g=x.createLinearGradient(0,0,256,0);g.addColorStop(0,'#fff0');g.addColorStop(.5,'#fff');g.addColorStop(1,'#fff0');x.fillStyle=g;x.shadowColor='#fff';x.shadowBlur=8;x.beginPath();x.ellipse(128,16,122,5,0,0,7);x.fill()}),
 star:ctex(128,128,(x)=>{x.fillStyle='#fff';x.shadowColor='#fff';x.shadowBlur=10;x.beginPath();x.moveTo(4,64);x.quadraticCurveTo(64,50,124,64);x.quadraticCurveTo(64,78,4,64);x.moveTo(64,4);x.quadraticCurveTo(78,64,64,124);x.quadraticCurveTo(50,64,64,4);x.fill()}),
 fang:ctex(256,128,(x)=>{const P=Array.from({length:9},(_,i)=>[8+i*30,16+Math.sin(i/8*Math.PI)*28]);   // rahang atas melengkung, taring tengah terpanjang
  x.fillStyle='#9f1239';x.beginPath();x.moveTo(0,0);x.lineTo(256,0);for(let i=8;i>=0;i--)x.lineTo(P[i][0],P[i][1]);x.closePath();x.fill();x.fillStyle='#fff';x.strokeStyle='#4c0519';x.lineWidth=4;
  for(let i=0;i<8;i++){const[a,b]=P[i],[c,d]=P[i+1];x.beginPath();x.moveTo(a,b);x.lineTo((a+c)/2,(b+d)/2+30+40*Math.sin((i+.5)/8*Math.PI));x.lineTo(c,d);x.closePath();x.fill();x.stroke()}}),
 hex:ctex(64,64,(x)=>{x.strokeStyle='#fff';x.lineWidth=5;x.shadowColor='#fff';x.shadowBlur=6;x.beginPath();for(let i=0;i<6;i++)x.lineTo(32+24*Math.cos(Math.PI/3*i),32+24*Math.sin(Math.PI/3*i));x.closePath();x.stroke()}),
 circ:ctex(128,128,(x)=>{x.strokeStyle='#fff';x.lineWidth=9;x.shadowColor='#fff';x.shadowBlur=10;x.beginPath();x.arc(64,64,50,0,7);x.stroke()}),
 arrow:ctex(256,64,(x)=>{x.fillStyle='#fff';x.shadowColor='#fff';x.shadowBlur=6;x.fillRect(30,28,170,8);x.beginPath();x.moveTo(250,32);x.lineTo(196,10);x.lineTo(208,32);x.lineTo(196,54);x.closePath();x.moveTo(34,32);x.lineTo(8,12);x.lineTo(48,30);x.closePath();x.moveTo(34,32);x.lineTo(8,52);x.lineTo(48,34);x.closePath();x.fill()}),
 puff:ctex(128,128,(x)=>{for(const[a,b,r]of[[64,70,40],[44,60,28],[86,58,30],[62,44,26]]){const g=x.createRadialGradient(a,b,0,a,b,r);g.addColorStop(0,'#ffffffd0');g.addColorStop(1,'#fff0');x.fillStyle=g;x.beginPath();x.arc(a,b,r,0,7);x.fill()}}),
 swirl:ctex(128,128,(x)=>{x.strokeStyle='#fff';x.lineWidth=7;x.lineCap='round';x.shadowColor='#fff';x.shadowBlur=8;x.beginPath();for(let t=0;t<14;t+=.1)x.lineTo(64+Math.cos(t)*(4+t*3.8),64+Math.sin(t)*(4+t*3.8));x.stroke()}),
 card:ctex(160,208,(x)=>{x.shadowColor='#fff';x.shadowBlur=26;rr(x,20,26,120,156,14);x.lineWidth=16;x.strokeStyle='#fff';x.stroke()})};
/* sprite FX: muncul setelah o.d ms, f(m,q) tiap frame (q 0..1); o.r rotasi layar, o.ar rasio tinggi/lebar, o.nb blending normal (asap) */
function vsp(tex,col,p,s,dur,f,o={}){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:col,transparent:true,depthWrite:false,rotation:o.r||0,blending:o.nb?THREE.NormalBlending:THREE.AdditiveBlending}));
 m.position.copy(p);m.scale.set(s,s*(o.ar||1),1);m.visible=!o.d;scene.add(m);FXL.push({o:m,t0:performance.now()+(o.d||0),dur,upd(q){if(q<0)return;m.visible=true;if(f)f(m,q)}});return m}
const above=(g,y=.6)=>g.position.clone().setY(g.position.y+y),
 sang=(a,b)=>{const p=a.clone().project(cam),q=b.clone().project(cam);return Math.atan2(q.y-p.y,(q.x-p.x)*cam.aspect)},   // sudut layar a→b
 SU=()=>V3(0,1,0).applyQuaternion(cam.quaternion),   // arah "atas layar" di dunia
 flashc=c=>{const f=$('flash');f.style.setProperty('--fc',c);f.classList.remove('on');void f.offsetWidth;f.classList.add('on')};
/* ---------- primitif ---------- */
function boom(p,col,k=1){vsp(VX.star,0xffffff,p,1.9*k,340,(m,q)=>{m.material.rotation=q*.7;m.scale.setScalar(1.9*k*(.55+q*.75));m.material.opacity=1-q});
 vsp(VX.glow,col,p,2.6*k,420,(m,q)=>{m.scale.setScalar(2.6*k*(.45+q));m.material.opacity=1-q});shake(.09*k)}
function shot(a,b,o={}){const{tex=VX.glow,col=0xffffff,s=.55,dur=380,h=.6,trail=col,r=0,ar=1,wob=0}=o;
 vsp(tex,col,a,s,dur,(m,q)=>{const e=q*(.6+.4*q);m.position.lerpVectors(a,b,e);m.position.y+=Math.sin(Math.PI*e)*h;if(wob)m.position.x+=Math.sin(q*16)*wob*(1-q);
  if(trail!=null)vsp(VX.glow,trail,m.position,s*.6,280,(t,k)=>{t.material.opacity=.75*(1-k);t.scale.setScalar(s*.6*(1-.7*k))})},{r:r?sang(a,b):0,ar});
 return sleep(dur)}
function slash(p,col,ang,o={}){const{len=1.7,th=.26,dur=280,d=0}=o;vsp(VX.streak,col,p,1,dur,(m,q)=>{const g=Math.min(1,q*3.2);m.scale.set(len*g,th*(1-q*.6),1);m.material.opacity=q<.55?1:(1-q)/.45},{r:ang,d})}
function waves(a,b,cols,n=3,dur=520,gap=110){for(let i=0;i<n;i++)vsp(VX.circ,[].concat(cols)[i%[].concat(cols).length],a,.4,dur,(m,q)=>{m.position.lerpVectors(a,b,q);m.scale.setScalar(.4+q*1.4);m.material.opacity=q<.8?1:(1-q)/.2},{d:i*gap});return sleep(dur+(n-1)*gap)}
function spray(p,tex,col,n=14,o={}){const{sp=1.4,s=.32,dur=650,up=1,g=1,nb=0}=o;for(let i=0;i<n;i++){const v=V3((Math.random()-.5)*2*sp,Math.random()*up+.3,(Math.random()-.5)*2*sp),P=p.clone();
 vsp(tex,col,P,s,dur*(.7+Math.random()*.5),(m,q)=>{m.position.set(P.x+v.x*q,P.y+v.y*q-g*q*q,P.z+v.z*q);m.material.opacity=(nb?.85:1)*(1-q);m.material.rotation=q*3*(i%2?1:-1)},{nb})}}
function gather(g,col,n=18,dur=1300){for(let i=0;i<n;i++){const a=Math.random()*6.28,r=1.1+Math.random()*.7,o=V3(Math.cos(a)*r,Math.random()*.9-.3,Math.sin(a)*r);
 vsp(VX.glow,col,g.position,.26,520,(m,q)=>{const k=1-q*q;m.position.set(g.position.x+o.x*k,g.position.y+.35+o.y*k,g.position.z+o.z*k);m.material.opacity=Math.sin(Math.PI*q)},{d:Math.random()*(dur-520)})}}
function jaws(q,k=1){const s=2.1*k,u=SU();for(const d of[1,-1])vsp(VX.fang,0xffffff,q,s,440,(m,p)=>{const e=Math.min(1,p/.42);m.position.copy(q).addScaledVector(u,d*((1-e*e*e)*.62+.06)*s*.5);m.material.opacity=p<.7?1:(1-p)/.3;
  if(e>=1&&!m.userData.hit){m.userData.hit=1;shake(.08*k)}},{r:d>0?0:Math.PI,ar:.5})}
function bolt(a,b,col,seg=7){for(let r=0;r<3;r++){const pts=[a];for(let i=1;i<seg;i++){const p=a.clone().lerp(b,i/seg);p.x+=(Math.random()-.5)*.55;p.z+=(Math.random()-.5)*.55;pts.push(p)}pts.push(b);
 for(let i=0;i<seg;i++){const A=pts[i],B=pts[i+1];vsp(VX.streak,col,A.clone().lerp(B,.5),1,170,(m,k)=>{m.scale.set(A.distanceTo(B)*1.2,.17,1);m.material.opacity=(1-k)*(Math.random()<.75?1:.35)},{r:sang(A,B),d:r*80})}}}
const DOMEG=new THREE.IcosahedronGeometry(1,1);
function dome(g){const m=new THREE.Mesh(DOMEG,new THREE.MeshBasicMaterial({color:0xbae6fd,wireframe:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(m);
 FXL.push({o:m,t0:performance.now(),dur:1500,upd(p){m.position.copy(g.position);m.scale.set(g.scale.x*.78,g.scale.x*.5,g.scale.x);m.rotation.y=p*1.6;m.material.opacity=Math.sin(Math.PI*p)*.9}})}
/* aura bingkai di bawah tumpukan kartu penyerang (gs[0] = kartu Pokémon) sampai serangan selesai, berapa lama pun pilih target/lempar koin; fungsi kembalian memudarkannya.
   Selalu .02 di bawah kartu terendah (Energi/Tool) agar tak sebidang dgn kartu mana pun (sebidang = z-fighting, aura berkedip).
   k: redam aura putih/perak. Padam sendiri bila kartunya hilang dari meja (KO, ganti pertandingan) */
function aura(gs,col,k=1){let end=0;const g=gs[0],m=new THREE.Mesh(GEO,new THREE.MeshBasicMaterial({map:VX.card,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(m);
 FXL.push({o:m,t0:performance.now(),dur:1e9,upd(){if(!g.parent)end=1;const t=performance.now()/1000;m.position.copy(g.position);m.position.y=Math.min(...gs.map(x=>x.position.y))-.02;m.rotation.copy(g.rotation);m.scale.setScalar(g.scale.x*1.38*(1+Math.sin(t*2.6)*.015));
  m.material.opacity=end?Math.max(0,m.material.opacity-.07):(.8+Math.sin(t*2.6)*.1)*k;if(end&&m.material.opacity<=0)this.t0=-1e12}});return()=>end=1}
/* ---------- gerak penyerang: panggung (samping, menjauhi celah pita), terjang, kembali ---------- */
const setOff=(gs,x,z,o)=>gs.forEach(g=>{const u=g.userData;u.off.x=x;u.off.z=z;Object.assign(u,o)});
function stageAtk(a,sd){const m=sd==='p'?1:-1,P=portrait(),st=[(P?1.55:1.95)*m,(P?.45:.65)*m,.16*m];monMeshes(a).forEach(g=>{const u=g.userData;u.stg=st;u.off.x=st[0];u.off.z=st[1];Object.assign(u,{lift:1.2,stz:st[2],dash:0})})}
const restage=c=>c.gs.forEach(g=>{const u=g.userData,s=u.stg;if(s){u.off.x=s[0];u.off.z=s[1];Object.assign(u,{lift:1.2,stz:s[2]})}});
function homeAtk(c){c.gs.forEach(g=>{const u=g.userData;u.stg=null;u.off.x=u.off.z=0;Object.assign(u,{lift:0,stz:0,dash:1})});setTimeout(()=>c.gs.forEach(g=>g.userData.dash=0),450)}
function dashAtk(c,f=.82,trail=1){const T=c.g.userData.t,tp=c.t.position,a=above(c.g,.3),b=above(c.t,.3);setOff(c.gs,(tp.x-T.x)*f,(tp.z-T.z)*f,{lift:.2,stz:0,dash:1});
 if(trail)FXL.push({o:new THREE.Object3D(),t0:performance.now(),dur:200,upd(){vsp(VX.streak,c.col,above(c.g,.3),1,240,(m,k)=>{m.scale.set(1.5,.3*(1-k),1);m.material.opacity=.7*(1-k)},{r:sang(a,b)})}});
 return sleep(190)}
/* ---------- resep per jurus (c: a=Pokémon penyerang, g/t=mesh penyerang/target, col=warna tipe, big=skala menurut damage) ---------- */
const APOS=c=>above(c.g,.45),TPOS=c=>above(c.t,.5);
const VR={
 ram:async c=>{await dashAtk(c);const q=TPOS(c);boom(q,c.col,c.big);spray(q,VX.puff,0xe5e7eb,5,{nb:1,sp:.9,up:.3,g:0,s:.55})},
 kick:async c=>{await dashAtk(c,.86);const q=TPOS(c);boom(q,c.col,c.big*1.15);slash(q,0xffffff,.6,{len:1.5,th:.34});spray(q,VX.puff,0xffffff,6,{nb:1,sp:.9,up:.4,g:0,s:.55})},
 slap:async c=>{await dashAtk(c,.8);const q=TPOS(c);slash(q,0xffffff,-.45,{len:2.2,th:.42,dur:300});slash(q,c.col,-.45,{len:2.5,th:.7,dur:360});boom(q,c.col,c.big)},
 enslap:async c=>{const a=APOS(c),q=TPOS(c);for(const e of c.a.en){const k=e.key==='prism'?'prism':e.t,b=orbMesh(k,1),s=c.g.scale.x*1.7;b.rotation.x=-Math.PI/2;scene.add(b);   // Energi yang terpasang dilempar satu per satu
   FXL.push({o:b,t0:performance.now(),dur:320,upd(p){b.position.lerpVectors(a,q,p);b.position.y+=Math.sin(Math.PI*p)*.9;b.scale.setScalar(s)}});setTimeout(()=>spray(q,VX.glow,AURAC[k]||0xffffff,6,{s:.22}),320);await sleep(160)}
  await sleep(160);await VR.slap(c)},
 bite:async c=>{const q=TPOS(c),n=c.at.fx==='jaw'&&c.a.dmg>0?2:1;dashAtk(c,.45,0);for(let i=0;i<n;i++){jaws(q,c.big);await sleep(i<n-1?260:200)}boom(q,0xff4d6d,c.big*.85)},
 wing:async c=>{await dashAtk(c,.86);const q=TPOS(c);slash(q,0xffffff,.85,{len:2});slash(q,0xbfe9ff,-.85,{len:2,d:70});boom(q,0xffffff,c.big*.9)},
 stab:async c=>{const q=TPOS(c),n=c.n||0,N=Math.max(1,n);for(let i=0;i<N;i++){await dashAtk(c,.72,0);   // tusukan sebanyak Kepala; 0 = meleset
   if(n){slash(q,0xffffff,-1.1+i*1.05,{len:1.3,th:.16,dur:220});vsp(VX.star,0xffffff,q,1,220,(m,k)=>m.material.opacity=1-k);shake(.05)}else spray(q,VX.puff,0xd1d5db,6,{nb:1,up:.3,g:0,s:.5});
   if(i<N-1){restage(c);await sleep(170)}}},
 landing:async c=>{const T=c.g.userData.t,tp=c.t.position;setOff(c.gs,tp.x-T.x,tp.z-T.z,{lift:3,stz:0,dash:0});await sleep(450);
  if(!G.stadium){spray(above(c.g,0),VX.puff,0xd1d5db,8,{nb:1,up:.4,g:0,s:.6});await sleep(320);return}   // tanpa Stadium: gagal, hanya kepulan
  setOff(c.gs,(tp.x-T.x)*.95,(tp.z-T.z)*.95,{lift:0,dash:1});await sleep(150);const q=TPOS(c);boom(q,c.col,c.big*1.2);ring(q.x,q.z,0xffffff);spray(q,VX.puff,0xe5e7eb,9,{nb:1,sp:1.4,up:.3,g:0,s:.7})},
 psy:async c=>{const a=APOS(c),q=TPOS(c);c.g.userData.pop=.4;await waves(a,q,c.col,3,460,120);vsp(VX.glow,c.col,q,2.6,620,(m,k)=>m.material.opacity=.9*(1-k));spray(q,VX.hex,c.col,12,{sp:1,up:1.2,g:.4});shake(.06);
  if(c.at.fx==='conf')vsp(VX.swirl,0xffd6ff,q,1.4,950,(m,k)=>{m.material.rotation=-k*9;m.material.opacity=k<.7?1:(1-k)/.3})},
 fire:async c=>{const a=APOS(c),q=TPOS(c),F=stex('flame');c.g.userData.pop=.5;await shot(a,q,{tex:F,col:0xffa040,s:1,dur:420,h:.9,trail:0xff6a00});boom(q,0xff7a1a,c.big);spray(q,F,0xffb347,16,{sp:1.1,up:1.6,g:-.4,s:.5,dur:700})},
 arrow:async c=>{const a=APOS(c),q=TPOS(c);await shot(a,q,{tex:VX.arrow,col:0xe9d5ff,s:1.4,dur:300,h:.15,trail:0x7c3aed,r:1,ar:.25});slash(q,0xa855f7,.8,{len:1.7});slash(q,0xa855f7,-.8,{len:1.7,d:50});boom(q,0x9333ea,c.big)},
 explode:async c=>{c.g.userData.sh=1.6;vsp(VX.glow,0xff2d2d,APOS(c),2.6,520,(m,k)=>m.material.opacity=Math.sin(Math.PI*k));await sleep(380);const q=TPOS(c),F=stex('flame');   // marah: bergetar merah lalu bola ledakan
  await shot(APOS(c),q,{col:0xff3b1f,s:.85,dur:430,h:1.5,trail:0xff8a3d});[0xffffff,0xffb347,0xff3b1f].forEach((cl,i)=>vsp(VX.glow,cl,q,1,520+i*130,(m,k)=>{m.scale.setScalar((1.3+i*.9)*c.big*(.4+k));m.material.opacity=1-k}));
  spray(q,VX.puff,0x52525b,10,{nb:1,sp:1.6,up:1.2,g:0,s:.95,dur:950});spray(q,F,0xffa040,22,{sp:1.8,up:2,g:.6,s:.5});boom(q,0xff3b1f,c.big*1.4);shake(.32);flashc('#ff5a1f')},
 union:async c=>{const a=APOS(c);for(const m of G[c.sd].bench){const g=M.get(m.id);if(g)shot(above(g,.4),a,{col:0xfef3c7,s:.38,dur:440,h:.6,trail:0xfde68a})}await sleep(460);   // tiap Bench menyalurkan cahaya
  vsp(VX.glow,0xffffff,a,2.3,420,(m,k)=>m.material.opacity=1-k);const q=TPOS(c);await waves(a,q,[0xa5f3fc,0xf0abfc,0xfde68a],3,380,90);boom(q,0xfef3c7,c.big)},
 crystal:async c=>{const a=APOS(c),q=TPOS(c);[0xa5f3fc,0xf0abfc,0xfde68a,0xbbf7d0,0xc7d2fe].forEach((cl,i)=>shot(a,q,{tex:VX.hex,col:cl,s:.55,dur:400,h:.3+i*.18,trail:null}));await sleep(410);
  boom(q,0xe0f2fe,c.big);spray(q,VX.hex,0xe0f2fe,14,{sp:1.2,up:1.3});setTimeout(()=>dome(c.g),300)},
 call:async c=>{const a=APOS(c),S=G[c.sd],m=c.sd==='p'?1:-1;for(let i=0;i<3;i++)setTimeout(()=>ring(a.x,a.z,c.col),i*170);   // panggilan: bintang ke slot Bench kosong
  for(let i=S.bench.length;i<Math.min(S.bench.length+2,bmax(c.sd));i++){const[x,z]=Z.ben(i,m);shot(a,V3(x,.4,z),{tex:stex('star'),col:0xfde68a,s:.55,dur:560,h:1.1,trail:0xfff7c2})}await sleep(600)},
 ghost:async c=>{const a=APOS(c),q=TPOS(c);await shot(a,q,{col:0xd8b4fe,s:.75,dur:560,h:.5,trail:0x6d28d9,wob:.3});vsp(VX.swirl,0xa855f7,q,1.2,620,(m,k)=>{m.material.rotation=k*6;m.material.opacity=1-k});boom(q,0x7c3aed,c.big*.85)},
 phantom:async c=>{const a=APOS(c),q=TPOS(c);await shot(a,q,{col:0xe9d5ff,s:1.15,dur:520,h:2.2,trail:0x7c3aed});boom(q,0x9333ea,c.big*1.2);
  const B=G[opp(c.sd)].bench.map(m=>M.get(m.id)).filter(Boolean);for(let i=0;i<6&&B.length;i++){const b=above(B[i%B.length],.4);setTimeout(()=>shot(q,b,{col:0xc4b5fd,s:.42,dur:380,h:.8,trail:0x7c3aed}).then(()=>spray(b,VX.glow,0xa78bfa,5,{s:.25,sp:.6})),120+i*70)}},
 slash:async c=>{await dashAtk(c,.6,0);const q=TPOS(c),u=V3(.2,0,.08);for(let i=-1;i<=1;i++)slash(q.clone().addScaledVector(u,i),c.col,-.95,{len:1.9,th:.24,d:(i+1)*55});boom(q,c.col,c.big*.9)},
 water:async c=>{const a=APOS(c),q=TPOS(c);for(let i=0;i<10;i++)setTimeout(()=>shot(a,q,{col:0x60a5fa,s:.45,dur:300,h:.3,trail:null}),i*35);await sleep(340);boom(q,0x38bdf8,c.big);spray(q,VX.glow,0x7dd3fc,18,{sp:1,up:1.8,g:1.2,s:.25})},
 leaf:async c=>{const a=APOS(c),q=TPOS(c),F=stex('flame');for(let i=0;i<8;i++)setTimeout(()=>shot(a,q,{tex:F,col:0x4ade80,s:.45,dur:460,h:.6,trail:null,wob:.35}),i*45);await sleep(480);boom(q,0x22c55e,c.big)},
 zap:async c=>{const a=APOS(c),q=TPOS(c);bolt(a,q,0xfde047);await sleep(110);bolt(q.clone().add(V3(0,2.6,0)),q,0xffffff);boom(q,0xfacc15,c.big);await sleep(120)},
 fail:async c=>{[.5,-.5,0].forEach((z,i)=>setTimeout(()=>c.gs.forEach(g=>g.userData.stz=z),i*180));vsp(VX.swirl,0xfde68a,above(c.g,.9),1,800,(m,k)=>{m.material.rotation=k*10;m.material.opacity=1-k});await sleep(620)},   // Confused: limbung
 buff:async c=>{vsp(VX.glow,c.col,APOS(c),2.2,500,(m,k)=>m.material.opacity=Math.sin(Math.PI*k));await sleep(420)}};
const VFX_FX={turbo:'fire',conf:'psy',draw2:'bite',jaw:'bite',arrow:'arrow',ledak:'explode',call:'call',en40:'enslap',union:'union',opal:'crystal',flip3:'stab',landing:'landing',dive:'phantom'},
 VFX_KW=[[/gigit|taring|kunyah|bite|fang|jaw/,'bite'],[/tendang|nendang|kick/,'kick'],[/tepuk|nepuk|tampar|nampar|pukul|mukul|tinju|slap|punch/,'slap'],[/sayap|wing/,'wing'],   // bentuk berimbuhan: menepuk, menyerang, menusuk...
  [/tusuk|nusuk|patuk|matuk|peck|stab/,'stab'],[/panah|arrow/,'arrow'],[/ledak|explo/,'explode'],[/dendam|grudge|hantu|phantom/,'ghost'],[/\bapi\b|flare|fire|blaze|bakar/,'fire'],[/psy|psiko/,'psy'],
  [/cakar|claw|tebas|nebas|sabet|slash/,'slash'],[/terjang|nerjang|serang|nyerang|sundul|nyundul|hantam|tabrak|nabrak|head|tackle|\bram\b/,'ram']],
 VFX_TY={D:'slash',M:'slash',P:'psy',R:'fire',W:'water',G:'leaf',L:'zap',F:'kick',N:'ram',C:'ram'};
const vfxOf=(card,at)=>VFX_FX[at.fx]||(VFX_KW.find(([r])=>r.test(at.n.toLowerCase()))||[])[1]||VFX_TY[card.type]||'ram';
const ATK={stop:null,hc:null},VHC={fire:0xff7a1a,explode:0xff3b1f,arrow:0x9333ea,ghost:0x9333ea,phantom:0x9333ea,crystal:0xe0f2fe,water:0x38bdf8,leaf:0x22c55e,zap:0xfacc15,bite:0xff4d6d};   // warna benturan FX.hit per resep
async function atkIntro(o){const a=o.mon,c=a.card,g=M.get(a.id),b=$('atkb');b.innerHTML=`<b>${o.name}</b><small>${cname(c)}</small>`;tyVars(b,c.type);b.style.setProperty('--by',(o.sd==='p'?-2:2)+'vh');   // geser sedikit ke arah bek
 if(g){stageAtk(a,o.sd);if(ATK.stop)ATK.stop();ATK.stop=aura(monMeshes(a),VC(c.type),{C:.6,M:.6}[c.type]||1);gather(g,VC(c.type))}camFx(1.14,0);
 b.classList.remove('on');void b.offsetWidth;b.classList.add('on');await sleep(1500);b.classList.remove('on');camFx();await sleep(220)}
Object.assign(FX,{strike:async o=>{const a=o.a,g=M.get(a.id);if(!g){if(ATK.stop){ATK.stop();ATK.stop=null}return}const t=o.tgt&&M.get(o.tgt.id),
  c={a,g,t,gs:monMeshes(a),sd:o.sd,at:o.at,n:o.n,col:VC(a.card.type),big:Math.min(1.7,.85+Math.max(0,(o.n||0)*10)/160)};   // n = damage akhir/10 (Kepala untuk flip3)
 const k=o.fail?'fail':t?vfxOf(a.card,o.at):'buff';ATK.hc=VHC[k]||null;
 try{await VR[k](c)}finally{if(ATK.stop){ATK.stop();ATK.stop=null}homeAtk(c);setTimeout(()=>ATK.hc=null)}}});
