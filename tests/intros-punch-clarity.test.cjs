const test=require('node:test');const assert=require('node:assert/strict');const {loadGame}=require('./harness.cjs');
function setup(t){const g=loadGame();t.after(()=>g.close());g.run(`gameState='intro';currentRound=1;pacifistBot=false;`);return g;}
test('all 91 matchups have distinct captioned exchanges with correct speakers in either order',t=>{
 const g=setup(t);const result=g.run(`(()=>{
  const roster=Object.keys(INTRO_SPEAKER_NAMES),seen=new Set();let count=0;
  for(let i=0;i<roster.length;i++)for(let j=i;j<roster.length;j++){
   for(const [a,b] of [[roster[i],roster[j]],[roster[j],roster[i]]]){
    player.technique=a;enemy.technique=b;frame=500;setupMatchIntro();
    if(!matchIntro)throw Error('Missing intro '+a+b);
    if(!count || a===roster[i])seen.add(JSON.stringify(matchIntro.lines));
    for(let n=0;n<2;n++){
     frame=500+n*MATCH_INTRO_LINE_TICKS+30;const beat=getMatchIntroBeat();
     if(beat.speaker.technique!==beat.line[0])throw Error('Wrong speaker');
     if(a===b && beat.speaker!==(n===0?player:enemy))throw Error('Mirror speaker');
     const calls=[],old=ctx.fillText;ctx.fillText=(...args)=>calls.push(args);
     drawMatchIntroDialogue();ctx.fillText=old;
     if(!calls.some(c=>String(c[0]).includes(INTRO_SPEAKER_NAMES[beat.line[0]].toUpperCase())))throw Error('Missing speaker caption');
    }
    frame=500+2*MATCH_INTRO_LINE_TICKS;drawMatchIntroDialogue();if(getMatchIntroBeat())throw Error('Intro stuck');
   }
   count++;
  }
  pacifistBot=true;setupMatchIntro();if(matchIntro)throw Error('Practice intro');
  return {count,unique:seen.size};
 })()`);
 assert.equal(result.count,91);assert.equal(result.unique,91);
});
test('intro gestures keep exactly four Sukuna arms and yield to combat without changing fighter state',t=>{
 const g=setup(t);g.run(`player.technique='shrine';enemy.technique='shrine';player.grounded=true;player.vx=0;player.stun=0;player.ko=false;player.attacking=null;frame=0;setupMatchIntro();frame=30;`);
 const r=g.run(`(()=>{let count=0;const before=JSON.stringify(getFighterNetworkState(player));
  const active=drawMatchIntroArms(player,()=>count++);drawFighter(player,'');
  const unchanged=before===JSON.stringify(getFighterNetworkState(player));
  player.attacking='light';const duringAttack=drawMatchIntroArms(player,()=>{});
  return {count,active,unchanged,duringAttack};})()`);
 assert.equal(r.count,4);assert.ok(r.active);assert.ok(r.unchanged);assert.equal(r.duringAttack,false);
});
test('four-arm punches preserve shoulder order and separate upper and lower guards',t=>{
 const g=setup(t);g.run(`matchIntro=null;player.technique='shrine';player.skinId='default';player.attacking='light';
 for(let arm=0;arm<4;arm++)for(let age=0;age<17;age++){
  player.punchArm=arm;player.attackFrame=age;const p=getPunchMotion(player);
  if(p.arms[0].shoulder.x-p.arms[1].shoulder.x<17)throw Error('Shoulders cross');
  if(p.arms[2].shoulder.y-p.arms[0].shoulder.y<24)throw Error('Arm rows overlap');
  if(age===3 && p.arms.filter(a=>a.fist.x-a.shoulder.x>30).length!==1)throw Error('Multiple fists striking');
 }`);
});
