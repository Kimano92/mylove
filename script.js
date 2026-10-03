// ---- ТАЙМЛАЙН: [секунда, сцена, [рядки], звук_перегортання, накопичувати_текст, затримка_першого_рядка] ----
// Приспів 1 ≈ 43.3-69.7 c, приспів 2 ≈ 92.8-119.2 c; час кадрів вирівняно по тактах (1 такт = 1.65 c).
const KEYS=[[0,.3],[8,.4],[16.9,.5],[38.8,.5],[43.3,.87],[69.7,.87],[74.4,.5],[89.2,.5],[92.8,.87],[119.2,.87],[124,.55],[146,.55],[153.5,0]];
const BEAT=0.4127,PH=0.39;   // темп ~145 уд/хв: зміни кадрів і рядків тексту прив'язані до сітки долей
const RATE=.975;      // пісня грає на 2.5% повільніше (висота тону зберігається)
const END_T=154;      // пісня 153.55 c; фінальний кадр одразу після неї
const F=[
[0,'first',['Катю...','Я давно хотів тобі дещо сказати.'],0,0,2.4],
[8.64,'we',['Колись нас було просто двоє.','А потім ми створили свій маленький світ.'],1],
[16.9,'family',['Ти подарувала мені найцінніше.',"Нашу сім'ю."],1],
[25.15,'life',['Ми багато через що пройшли.','І зараз нам теж буває нелегко.'],1],
[31.75,'van',['А потім я знову їду.'],1],
[35.05,'mapfar',['Кілометри. Інші країни. І знову дорога.'],0],
[38.35,'dist',['Іноді між нами сотні кілометрів.'],1],
[43.31,'think',['Але скільки б я не їхав...','Я все одно весь час думаю про вас.'],1],
[49.91,'katp',['Я знаю.'],0],[53.21,'we',['Ти любиш мене.'],0],[56.51,'markp',[],0],[59.81,'michelp',[],0],
[63.11,'family',['І я люблю тебе.'],0],[66.41,'think',[],0],
[69.72,'home',['Катю...','Я знаю, що тобі зараз нелегко.','І я знаю, що іноді тобі просто хочеться, щоб я був поруч.','Мені теж.'],1],
[77.97,'apart',['Між нами може бути дорога.'],1],
[81.27,'together',['Але вона не може розділити нас.'],0],
[84.57,'kids',['А ще є двоє маленьких людей...','Заради яких хочеться повертатися ще сильніше.'],1],
[89.52,'nightFam',['І навіть коли навколо ніч...','Я знаю, куди їду.'],1],
[92.82,'ret0',[],1],[99.43,'ret1',[],0],[106.03,'ret2',[],0],[112.64,'ret3',[],0],
[119.23,'dim',['Скільки б разів я не їхав...','Я завжди хочу повернутися сюди.'],1],
[129.14,'familyH',['Катю...','Дякую тобі за нас.',"За нашу сім'ю.",'Куди б не вела мене ця дорога...','Я завжди їду додому.','Бо мій дім — це ви.'],1,0,1.2],
[END_T,'familyH',['Катя, я тебе кохаю.','Завжди.'],0,1,.6]];
const $=id=>document.getElementById(id),au=$('song'),fl=$('flip'),art=$('art'),txt=$('txt');
let ac,gain,T=0,idx=-1,cur='',playing=false,last=0,timers=[],muted=false;
function slow(){au.defaultPlaybackRate=RATE;au.playbackRate=RATE;au.preservesPitch=true;au.webkitPreservesPitch=true}
au.addEventListener('loadedmetadata',slow);
function setup(){try{ac=new(window.AudioContext||window.webkitAudioContext)();gain=ac.createGain();ac.createMediaElementSource(au).connect(gain);gain.connect(ac.destination);gain.gain.value=.3}catch(e){ac=null;au.volume=.5}}
function vol(){let v=0;for(let i=0;i<KEYS.length-1;i++){const[a,x]=KEYS[i],[b,y]=KEYS[i+1];if(T>=a&&T<=b){const u=(T-a)/(b-a);v=x+(y-x)*u*u*(3-2*u)}}
if(muted)v=0;ac?gain.gain.setTargetAtTime(v,ac.currentTime,.12):au.volume=Math.min(1,v)}
const end=i=>i+1<F.length?F[i+1][0]:END_T+9;
function lines(i){const[t,,L,,acc,lead]=F[i];timers.forEach(clearTimeout);timers=[];if(!L.length)return;
const w=L.map(l=>l.length+14),W=w.reduce((a,b)=>a+b),span=Math.max(1,end(i)-t-(lead||.5)-.4)/RATE,el=Math.max(0,T-t)*1000/RATE;let at=(lead||.5)*1000/RATE,starts=[];
if(acc&&F[i-1]&&F[i-1][1]===F[i][1])txt.innerHTML='';
L.forEach((l,k)=>{let st=at;const b=Math.round((t+st*RATE/1000-PH)/BEAT)*BEAT+PH,s2=(b-t)*1000/RATE;if(s2>=300)st=s2;starts.push(st);at+=span*1000*w[k]/W});
const put=l=>{if(acc){const p=document.createElement('p');p.textContent=l;txt.appendChild(p);txt.classList.remove('fade')}else{txt.classList.add('fade');setTimeout(()=>{txt.textContent=l;txt.classList.remove('fade')},450)}};
let now=-1;starts.forEach((st,k)=>{if(st<=el)now=k});
if(acc){for(let k=0;k<=now;k++)put(L[k])}else if(now>=0&&el>1500)put(L[now]);
starts.forEach((st,k)=>{if(st>el&&!(acc&&k<=now)&&!(!acc&&k<=now&&el>1500))timers.push(setTimeout(()=>put(L[k]),st-el))})}
function show(i,snd){const prev=idx;idx=i;const[t,s,L,flip,acc]=F[i];
if(acc&&F[prev]&&F[prev][1]===s&&cur===s){lines(i);return}      // той самий малюнок: лише текст
const big=snd&&flip&&!muted;if(big){fl.volume=.15;fl.currentTime=0;fl.play().catch(()=>{})}
timers.forEach(clearTimeout);art.classList.add('fade');txt.classList.add('fade');
setTimeout(()=>{if(idx!==i)return;cur=s;art.innerHTML=render(s,(end(i)-t)/RATE,(t>=43&&t<69.8)||(t>=92.8&&t<119.2));art.classList.remove('fade');txt.innerHTML='';lines(i)},big?800:450)}
const at=t=>{let i=0;F.forEach((f,k)=>{if(t>=f[0]-(k&&f[3]?.78:.44))i=k});return i};
function tick(now){const dt=Math.min(.1,(now-last)/1000);last=now;if(playing){if(!au.paused&&!au.ended)T=au.currentTime;else T+=dt*RATE;vol();const i=at(T);if(i!==idx)show(i,true)}requestAnimationFrame(tick)}
function seek(t){T=Math.max(0,t);if(T<au.duration-.3){au.currentTime=T;if(playing){au.play().catch(()=>{});slow()}}cur='';show(at(T),true)}
$('go').onclick=()=>{setup();if(ac)ac.resume();$('start').classList.add('off');$('book').hidden=false;slow();au.currentTime=0;const run=()=>{playing=true;last=performance.now();requestAnimationFrame(tick);show(0,false)};au.play().then(run).catch(run);const q=new URLSearchParams(location.search).get('t');if(q)setTimeout(()=>seek(+q),50)};
$('pp').onclick=()=>{playing=!playing;document.body.classList.toggle('paused',!playing);$('pp').textContent=playing?'пауза':'грати';if(playing){last=performance.now();if(!au.ended)au.play().catch(()=>{});lines(idx)}else{au.pause();timers.forEach(clearTimeout)}};
$('nx').onclick=()=>{if(idx<F.length-1)seek(F[idx+1][0]+.01)};
$('bk').onclick=()=>seek(F[T-F[idx][0]>3?idx:Math.max(0,idx-1)][0]+.01);
$('mu').onclick=()=>{muted=!muted;$('mu').textContent=muted?'без звуку':'звук';vol()};
