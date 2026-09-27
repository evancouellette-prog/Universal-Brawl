const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./harness.cjs');
function setup(t, tech='deathnote') {
  const g=loadGame();t.after(()=>g.close());
  g.run(`startFromHome(true);finishTechniqueSelect('${tech}');gameOver=false;paused=false;roundEnding=false;gameState='playing';
    player.x=500;player.y=GROUND-player.h;player.grounded=true;player.stun=0;
    enemy.health=enemy.maxHealth=10000;enemy.ko=false;
    function positionTarget(){enemy.x=player.x+player.w+5;enemy.y=player.y;enemy.grounded=true;enemy.knockdown=false;enemy.dodging=0;enemy.blocking=false;player.dir=1;}
    function hit(type){positionTarget();startAttack(player,type);if(player.attacking!==type)throw Error('attack rejected '+type);
      player.attackFrame=getAttackSpec(player).windup;applyHit(player,enemy);}
    function recover(){for(let i=0;player.attacking && i<120;i++)updateFighter(player,enemy);}
    function lights(n){for(let i=0;i<n;i++){hit('light');if(i<n-1)recover();}}
  `);return g;
}
test('every character can queue LLL and LLH through actual recovery',t=>{
 const g=setup(t);
 for(const tech of g.run('Object.keys(CHARACTER_SKINS)')) for(const end of ['light','heavy']) {
  if(tech==='dummy')continue;
  g.run(`startFromHome(true);finishTechniqueSelect('${tech}');gameOver=false;paused=false;gameState='playing';roundEnding=false;
    player.x=500;player.y=GROUND-player.h;player.grounded=true;enemy.health=enemy.maxHealth=10000;
    hit('light');startAttack(player,'light');
    for(let i=0;player.attacking==='light'&&player.hasHit&&i<100;i++)updateFighter(player,enemy);
    if(player.attacking!=='light'||player.hasHit)throw Error('second light not queued: ${tech}');
    positionTarget();player.attackFrame=getAttackSpec(player).windup;applyHit(player,enemy);startAttack(player,'${end}');
    for(let i=0;player.hasHit&&i<100;i++)updateFighter(player,enemy);
    if(player.attacking!=='${end}'||player.punchFinisher!=='${end}')throw Error('finisher not queued: ${tech} ${end}');
    positionTarget();player.attackFrame=getAttackSpec(player).windup;applyHit(player,enemy);
    if(!player.hasHit && player.beastComboTicks<=0)throw Error('finisher missed: ${tech}');`);
 }
});
test('Ryuk third light uppercuts with an upward fist pose',t=>{
 const g=setup(t);g.run(`lights(2);recover();hit('light');`);
 assert.equal(g.run('enemy.vy'),-15);assert.equal(g.run('enemy.grounded'),false);
 const y=g.run('getLightMeleeRyukPose(player).hand.y');
 g.run('player.attackFrame+=5;');assert.ok(g.run('getLightMeleeRyukPose(player).hand.y')<y);
});
test('Thragg LLH stuns; a single-light heavy does not earn the finisher',t=>{
 const g=setup(t,'brawler');g.run(`lights(2);recover();hit('heavy');`);
 assert.equal(g.run('enemy.stun'),66);assert.equal(g.run('enemy.knockdown'),false);
 assert.ok(g.run("getAttackSpec(player,'heavy').windup")>20);
 assert.ok(g.run("getAttackSpec(player,'heavy').damage")>27);
 assert.ok(g.run("getAttackSpec(player,'light').width")>48);
 g.run(`recover();player.punchCooldown=0;resetCombo(player);hit('light');recover();hit('heavy');`);
 assert.equal(g.run('player.punchFinisher'),null);assert.ok(g.run('enemy.stun')<66);
});
test('David earns slow time even on cooldown, slows attack progression, and expires',t=>{
 const g=setup(t,'david');g.run(`player.davidSandevistanCooldown=400;lights(2);recover();hit('light');`);
 assert.equal(g.run('player.davidSandevistanTicks'),90);assert.equal(g.run('enemy.comboSlowTicks'),90);
 const result=g.run(`(()=>{enemy.stun=0;enemy.attacking='heavy';enemy.attackFrame=0;enemy.hasHit=true;
 for(let i=0;i<10;i++)updateFighter(enemy,player);return {age:enemy.attackFrame,ticks:enemy.comboSlowTicks};})()`);
 assert.equal(result.age,5);assert.equal(result.ticks,80);
 g.run('for(let i=0;i<90;i++)updateFighter(enemy,player);');assert.equal(g.run('enemy.comboSlowTicks'),0);
});
test('Inosuke hops back then dashes into exactly one piercing hit',t=>{
 const g=setup(t,'beast');g.run(`lights(2);recover();hit('light');`);
 assert.equal(g.run('player.beastComboTicks'),28);assert.ok(g.run('player.vx')<0);assert.ok(g.run('player.vy')<0);
 const r=g.run(`(()=>{const hp=enemy.health,x=player.x;let back=false,forward=false;
 for(let i=0;i<60;i++){updateFighter(player,enemy);updateFighter(enemy,player);if(player.x<x-30)back=true;if(player.vx>10)forward=true;drawFighter(player,'');}
 return {back,forward,damage:hp-enemy.health,hit:player.beastComboHit,ticks:player.beastComboTicks};})()`);
 assert.equal(r.back,true);assert.equal(r.forward,true);assert.ok(r.damage>0);assert.ok(r.damage<20);assert.equal(r.hit,true);assert.equal(r.ticks,0);
});
test('blocked or missed punches break chains and cannot trigger special finishers',t=>{
 const g=setup(t,'david');g.run(`lights(2);recover();positionTarget();startAttack(player,'light');enemy.blocking=true;enemy.dir=-1;player.attackFrame=getAttackSpec(player).windup;applyHit(player,enemy);`);
 assert.equal(g.run('player.comboCount'),0);assert.equal(g.run('enemy.comboSlowTicks'),0);
 g.run(`recover();player.punchCooldown=0;hit('light');recover();positionTarget();startAttack(player,'light');enemy.x=player.x+900;recover();`);
 assert.equal(g.run('player.comboCount'),0);
});
test('combo states synchronize, interrupted dash cancels, and practice reset clears effects',t=>{
 const g=setup(t,'beast');g.run(`lights(2);recover();hit('light');player.stun=10;updateBeastCombo(player,enemy);`);
 assert.equal(g.run('player.beastComboTicks'),0);
 g.run(`player.punchFinisher='heavy';player.beastComboTicks=22;player.comboSlowTicks=60;player.davidSandevistanTicks=75;
 gameMode='online';onlineRole='p1';applyJoinerFighterStateOnHost(getFighterNetworkState(player));`);
 assert.equal(g.run('enemy.beastComboTicks'),22);assert.equal(g.run('enemy.punchFinisher'),'heavy');g.run(`player.technique='david';applyJoinerFighterStateOnHost(getFighterNetworkState(player));`);assert.equal(g.run('enemy.davidSandevistanTicks'),75);
 g.run(`syncRemoteDamageToLocalJoiner({...getFighterNetworkState(enemy),comboSlowTicks:40});`);assert.equal(g.run('enemy.comboSlowTicks'),40);
 g.run(`startFromHome(true);finishTechniqueSelect('beast');`);
 assert.equal(g.run('player.beastComboTicks'),0);assert.equal(g.run('enemy.comboSlowTicks'),0);
});
test('host slow cannot be erased by stale joiner state and dash damage has one owner',t=>{
 const g=setup(t,'david');g.run(`gameMode='online';onlineRole='p1';enemy.comboSlowTicks=80;
 applyJoinerFighterStateOnHost({...getFighterNetworkState(enemy),comboSlowTicks:0});`);
 assert.equal(g.run('enemy.comboSlowTicks'),80);
 g.run(`enemy.technique='beast';enemy.beastComboTicks=17;enemy.beastComboHit=false;enemy.x=player.x;const hostHp=player.health;updateBeastCombo(enemy,player);if(player.health!==hostHp)throw Error('host duplicated joiner dash');`);
 g.run(`pacifistBot=false;roundResolved=false;player.comboSlowTicks=0;applyOnlineDamageToPlayer({damage:1,comboSlowTicks:90});`);
 assert.equal(g.run('player.comboSlowTicks'),90);
});
test('piercing follow-up respects dodge and block',t=>{
 const g=setup(t,'beast');g.run(`positionTarget();player.beastComboTicks=17;enemy.dodging=8;const dodgeHp=enemy.health;updateBeastCombo(player,enemy);if(enemy.health!==dodgeHp||player.beastComboHit)throw Error('hit dodge');
 enemy.dodging=0;enemy.blocking=true;enemy.dir=-1;const blockHp=enemy.health;updateBeastCombo(player,enemy);if(enemy.health!==blockHp)throw Error('damaged through block');`);
 assert.equal(g.run('player.beastComboHit'),true);
});
