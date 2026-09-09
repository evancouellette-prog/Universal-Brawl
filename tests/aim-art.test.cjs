const test=require('node:test');
const assert=require('node:assert/strict');
const {loadGame}=require('./harness.cjs');
function setup(t){const g=loadGame();t.after(()=>g.close());g.run(`startFromHome(true);finishTechniqueSelect('limitless');platforms=[];player.x=100;player.y=150;enemy.x=400;enemy.y=150;enemy.infinityActive=false;`);return g;}

test('preview uses first live collision; moving a fighter or platform clears the path without shortening the shot',t=>{
 const g=setup(t);
 const result=g.run(`(()=>{
  const aim=getTechniqueAimVector(player,'red',{x:1100,y:getTechniqueOrigin(player,'red').y});
  const spec=techniqueMoves.red;
  const before=getAimPreviewDistance('red',spec,0,aim,player);
  startTechnique(player,2,0,aim.aim);const p=projectiles[0];
  enemy.y=GROUND-enemy.h;
  const after=getAimPreviewDistance('red',spec,0,aim,player);
  for(let i=0;i<30;i++)updateProjectiles();
  const passed=projectiles.includes(p)&&p.x>aim.origin.x+before;
  platforms=[{x:500,y:aim.origin.y-30,w:100,h:60}];
  const blocked=getAimPreviewDistance('red',spec,0,aim,player);
  platforms[0].broken=true;
  const cleared=getAimPreviewDistance('red',spec,0,aim,player);
  return {before,after,passed,blocked,cleared,max:p.maxTravel};
 })()`);
 assert.ok(result.after>result.before);assert.ok(result.passed);assert.ok(result.max>result.before);
 assert.ok(result.cleared>result.blocked);
});

test('fast shots stop at platforms before damaging fighters behind them, with matching slash bounds',t=>{
 const g=setup(t);
 for(const move of ['red','blue','slash','purple','worldSlash']) {
  const r=g.run(`(()=>{
   projectiles=[];projectileDisperses=[];enemy.x=500;enemy.y=150;enemy.hp=100;
   platforms=[{x:350,y:150,w:60,h:100}];
   const aim={origin:{x:200,y:180},x:1,y:0,angle:0,distance:900};
   const spec={radius:20,speed:600,life:2};
   const preview=getAimPreviewDistance('${move}',spec,0,aim,player);
   const p={move:'${move}',radius:20,x:200,y:180,vx:600,vy:0,angle:0,life:2,owner:'player',damage:20,knockback:3,dir:1};
   projectiles=[p];updateProjectiles();
   return {preview,x:p.x,hp:enemy.hp,count:projectiles.length};
  })()`);
  assert.equal(r.count,0);assert.equal(r.hp,100);assert.ok(Math.abs(r.x-200-r.preview)<.001,move);
 }
});

test('Fuga reaches the exact cursor, including near casts and range clamp, through intervening obstacles',t=>{
 const g=setup(t);
 for(const distance of [0,3,317,5000]) {
  const r=g.run(`(()=>{
   player.technique='shrine';player.ce=1000;player.fugaCooldown=0;player.fugaAiming=true;
   player.fugaChargeTicks=getFugaRequiredChargeTicks(player);player.techniqueCooldown=0;
   const origin=getTechniqueOrigin(player,'fuga'),aim={x:origin.x+${distance},y:origin.y};
   enemy.x=origin.x+80;enemy.y=origin.y-30;
   platforms=[{x:origin.x+120,y:origin.y-40,w:40,h:80}];
   projectiles=[];fugaExplosions=[];startFuga(player,aim);
   const p=projectiles[0],expected=p.rangeEndX;
   for(let i=0;i<500&&projectiles.length;i++)updateProjectiles();
   return {x:fugaExplosions[0]?.x,y:fugaExplosions[0]?.y,expected,oy:origin.y,delta:expected-origin.x,max:techniqueMoves.fuga.speed*techniqueMoves.fuga.life};
  })()`);
  assert.ok(Math.abs(r.x-r.expected)<1e-6);assert.equal(r.y,r.oy);
  assert.ok(Math.abs(r.delta-Math.min(distance,r.max))<1e-6);
 }
});

test('every Inosuke skin keeps two swords attached through idle, movement, punches and blocking',t=>{
 const g=setup(t);
 const counts=g.run(`(()=>{
  const counts=[],original=drawBeastSwords;
  drawBeastSwords=(f,hands)=>{counts.push(hands.slice(-2).length);original(f,hands);};
  player.technique='beast';
  for(const skin of CHARACTER_SKINS.beast)for(const pose of ['idle','run','punch','block']) {
   player.skinId=skin.id;player.vx=pose==='run'?5:0;player.blocking=pose==='block';
   player.attacking=pose==='punch'?'light':null;player.attackFrame=5;
   drawFighter(player,'Inosuke');
  }
  drawBeastSwords=original;return counts;
 })()`);
 assert.equal(counts.length,16);assert.ok(counts.every(n=>n===2));
});

test('meteor warning survives until impact and cached scenery renders every stage',t=>{
 const g=setup(t);
 const r=g.run(`(()=>{
  stageHazards=[];spawnStageHazard('meteor');const meteor=stageHazards[0];
  let impact=false;
  for(let i=0;i<300&&stageHazards.length;i++){updateStageHazards();if(meteor.struck)impact=true;}
  for(const id of Object.keys(STAGE_ATMOSPHERE)){currentStageId=id;drawSceneryPolish();drawSceneryPolish();}
  return {impact,cache:drawSceneryPolish.cache.size};
 })()`);
 assert.ok(r.impact);assert.equal(r.cache,8);
});
