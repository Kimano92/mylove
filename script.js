// ---- ТАЙМЛАЙН: [секунда, сцена, [рядки], звук_перегортання, накопичувати_текст, затримка_першого_рядка] ----
// Межі приспівів визначено аналізом повторів у треку: приспів 1 = 43.0-69.8 c, приспів 2 = 93.0-119.2 c (підправити за потреби тут і в KEYS).
const KEYS=[[0,.3],[8,.4],[17,.5],[38.5,.5],[43.5,.87],[69.8,.87],[74.5,.5],[88.5,.5],[93.5,.87],[119.2,.87],[124,.55],[146,.55],[153.5,0]];
const END_T=154;      // пісня 153.55 c; фінальний кадр одразу після неї
const F=[
[0,'first',['Катю...','Я давно хотів тобі дещо сказати.'],0,0,2.4],
[9,'we',['Колись нас було просто двоє.','А потім ми створили свій маленький світ.'],1],
[17,'family',['Ти подарувала мені найцінніше.',"Нашу сім'ю."],1],
[25.5,'life',['Ми багато через що пройшли.','І зараз нам теж буває нелегко.'],1],
[31.5,'van',['А потім я знову їду.'],1],
[35,'mapfar',['Кілометри. Інші країни. І знову дорога.'],0],
[38.5,'dist',['Іноді між нами сотні кілометрів.'],1],
[43,'think',['Але скільки б я не їхав...','Я все одно весь час думаю про вас.'],1],
[49.8,'katp',['Я знаю.'],0],[53.3,'we',['Ти любиш мене.'],0],[56.5,'markp',[],0],[59.8,'michelp',[],0],
[62.5,'family',['І я люблю тебе.'],0],[66.2,'think',[],0],
[69.8,'home',['Катю...','Я знаю, що тобі зараз нелегко.','І я знаю, що іноді тобі просто хочеться, щоб я був поруч.','Мені теж.'],1],
[78.5,'apart',['Між нами може бути дорога.'],1],
[81.3,'together',['Але вона не може розділити нас.'],0],
[83.8,'kids',['А ще є двоє маленьких людей...','Заради яких хочеться повертатися ще сильніше.'],1],
[88.5,'nightFam',['І навіть коли навколо ніч...','Я знаю, куди їду.'],1],
[93,'ret0',[],1],[98,'ret1',[],0],[103.5,'ret2',[],0],[109,'ret3',[],0],
[114.5,'dim',['Скільки б разів я не їхав...','Я завжди хочу повернутися сюди.'],1],
[129,'familyH',['Катю...','Дякую тобі за нас.',"За нашу сім'ю.",'Куди б не вела мене ця дорога...','Я завжди їду додому.','Бо мій дім — це ви.'],1,0,1.2],
[END_T,'familyH',['Катя, я тебе кохаю.','Завжди.'],0,1,.6]];
const $=id=>document.getElementById(id),au=$('song'),fl=$('flip'),art=$('art'),txt=$('txt');
let ac,gain,T=0,idx=-1,cur='',playing=false,last=0,timers=[],muted=false;
function setup(){try{ac=new(window.AudioContext||window.webkitAudioContext)();gain=ac.createGain();ac.createMediaElementSource(au).connect(gain);gain.connect(ac.destination);gain.gain.value=.3}catch(e){ac=null;au.volume=.5}}
function vol(){let v=0;for(let i=0;i<KEYS.length-1;i++){const[a,x]=KEYS[i],[b,y]=KEYS[i+1];if(T>=a&&T<=b){const u=(T-a)/(b-a);v=x+(y-x)*u*u*(3-2*u)}}
if(muted)v=0;ac?gain.gain.setTargetAtTime(v,ac.currentTime,.12):au.volume=Math.min(1,v)}
const end=i=>i+1<F.length?F[i+1][0]:END_T+9;
function lines(i){const[t,,L,,acc,lead]=F[i];timers.forEach(clearTimeout);timers=[];if(!L.length)return;
const w=L.map(l=>l.length+14),W=w.reduce((a,b)=>a+b),span=Math.max(1,end(i)-t-(lead||.5)-.4),el=Math.max(0,T-t)*1000;let at=(lead||.5)*1000,starts=[];
if(acc&&F[i-1]&&F[i-1][1]===F[i][1])txt.innerHTML='';
L.forEach((l,k)=>{starts.push(at);at+=span*1000*w[k]/W});
const put=l=>{if(acc){const p=document.createElement('p');p.textContent=l;txt.appendChild(p);txt.classList.remove('fade')}else{txt.classList.add('fade');setTimeout(()=>{txt.textContent=l;txt.classList.remove('fade')},450)}};
let now=-1;starts.forEach((st,k)=>{if(st<=el)now=k});
if(acc){for(let k=0;k<=now;k++)put(L[k])}else if(now>=0&&el>1500)put(L[now]);
starts.forEach((st,k)=>{if(st>el&&!(acc&&k<=now)&&!(!acc&&k<=now&&el>1500))timers.push(setTimeout(()=>put(L[k]),st-el))})}
function show(i,snd){const prev=idx;idx=i;const[t,s,L,flip,acc]=F[i];
if(acc&&F[prev]&&F[prev][1]===s&&cur===s){lines(i);return}      // той самий малюнок: лише текст
const big=snd&&flip&&!muted;if(big){fl.volume=.15;fl.currentTime=0;fl.play().catch(()=>{})}
timers.forEach(clearTimeout);art.classList.add('fade');txt.classList.add('fade');
setTimeout(()=>{if(idx!==i)return;cur=s;art.innerHTML=render(s,end(i)-t,(t>=43&&t<69.8)||(t>=93&&t<119.2));art.classList.remove('fade');txt.innerHTML='';lines(i)},big?800:450)}
const at=t=>{let i=0;F.forEach((f,k)=>{if(t>=f[0])i=k});return i};
function tick(now){const dt=Math.min(.1,(now-last)/1000);last=now;if(playing){if(!au.paused&&!au.ended)T=au.currentTime;else T+=dt;vol();const i=at(T);if(i!==idx)show(i,true)}requestAnimationFrame(tick)}
function seek(t){T=Math.max(0,t);if(T<au.duration-.3){au.currentTime=T;if(playing)au.play().catch(()=>{})}cur='';show(at(T),true)}
$('go').onclick=()=>{setup();if(ac)ac.resume();$('start').classList.add('off');$('book').hidden=false;au.currentTime=0;const run=()=>{playing=true;last=performance.now();requestAnimationFrame(tick);show(0,false)};au.play().then(run).catch(run);const q=new URLSearchParams(location.search).get('t');if(q)setTimeout(()=>seek(+q),50)};
$('pp').onclick=()=>{playing=!playing;document.body.classList.toggle('paused',!playing);$('pp').textContent=playing?'пауза':'грати';if(playing){last=performance.now();if(!au.ended)au.play().catch(()=>{});lines(idx)}else{au.pause();timers.forEach(clearTimeout)}};
$('nx').onclick=()=>{if(idx<F.length-1)seek(F[idx+1][0]+.01)};
$('bk').onclick=()=>seek(F[T-F[idx][0]>3?idx:Math.max(0,idx-1)][0]+.01);
$('mu').onclick=()=>{muted=!muted;$('mu').textContent=muted?'без звуку':'звук';vol()};
