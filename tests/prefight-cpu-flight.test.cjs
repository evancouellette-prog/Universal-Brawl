const test=require('node:test'),assert=require('node:assert/strict');const {loadGame}=require('./harness.cjs');
function setup(t){const g=loadGame();t.after(()=>g.close());g.run(`startFromHome(false);finishTechniqueSelect('shrine');enemy.technique='limitless';gameMode='cpu';gameState='lobby';gameOver=true;currentRound=1;`);return g;}
test('intro freezes combat before countdown, then countdown starts once and round one does not replay it',t=>{
 const g=setup(t);let interval;g.window.setInterval=fn=>{interval=fn;return 1;};
 g.run('startReadyCountdown()');assert.equal(g.run('gameState'),'intro');assert.equal(g.run('readyCountdownValue'),0);
 const before=g.run('JSON.stringify([player.health,enemy.health,player.x,enemy.x,player.ce,enemy.ce])');
 g.run('for(let i=0;i<329;i++)fixedUpdate()');assert.equal(g.run('gameState'),'intro');
 assert.equal(g.run('JSON.stringify([player.health,enemy.health,player.x,enemy.x,player.ce,enemy.ce])'),before);
 g.run('fixedUpdate()');assert.equal(g.run('readyCountdownValue'),3);assert.equal(g.run('gameState'),'lobby');
 for(let i=0;i<4;i++)interval();assert.equal(g.run('gameState'),'playing');assert.equal(g.run('matchIntro'),null);
});
test('both players must vote; repeat and stale votes cannot skip another intro',t=>{
 const g=setup(t);g.run(`gameMode='pvp';startReadyCountdown();voteIntroSkip('p1');voteIntroSkip('p1');`);
 assert.equal(g.run('gameState'),'intro');g.run(`voteIntroSkip('p2','old-intro')`);assert.equal(g.run('gameState'),'intro');
 g.run(`voteIntroSkip('p2')`);assert.equal(g.run('readyCountdownValue'),3);
 g.run(`resetBattleSession('cpu');`);assert.equal(g.run('matchIntroCompleted'),false);assert.equal(g.run('matchIntro'),null);
});
test('joiner follows host intro time and only requests its own skip vote',t=>{
 const host=setup(t),joiner=setup(t);host.run(`gameMode='online';onlineRole='p1';player1Ready=player2Ready=true;startReadyCountdown();frame+=30;`);
 const state=host.run('getIntroNetworkState()');joiner.window.introPacket=JSON.parse(JSON.stringify(state));
 joiner.run(`gameMode='online';onlineRole='p2';gameState='intro';frame=900;syncIntroNetworkState(introPacket);`);
 assert.equal(joiner.run('getMatchIntroBeat().time'),30);
 const packets=[];joiner.window.capturePacket=p=>packets.push(JSON.parse(p));
 joiner.run(`onlineConnected=true;onlineSocket={readyState:1,bufferedAmount:0,send:capturePacket};voteIntroSkip('p1');voteIntroSkip('p2');`);
 assert.equal(packets.length,1);assert.equal(packets[0].role,'p2');assert.equal(packets[0].id,state.id);
 assert.equal(joiner.run('gameState'),'intro');
 host.run(`voteIntroSkip('p1')`);assert.equal(host.run('gameState'),'intro');host.run(`voteIntroSkip('p2')`);assert.equal(host.run('readyCountdownValue'),3);
});
test('CPU releases a charge with a missing timer and recovers expired attacks and close-range idle',t=>{
 const g=setup(t);g.run(`gameState='playing';gameOver=false;enemy.technique='limitless';enemy.chargingTechnique=1;enemy.chargeTicks=LIMITLESS_CHARGE_MAX_TICKS;enemy.cpuTechniqueReleaseTicks=0;enemy.ce=enemy.maxCe;updateCpuTechniqueCharge(cpuSettings.medium);`);
 assert.equal(g.run('enemy.chargingTechnique'),0);
 g.run(`enemy.attacking='light';enemy.attackFrame=999;updateCpuStuckRecovery();`);assert.equal(g.run('enemy.attacking'),null);
 g.run(`enemy.x=player.x+55;enemy.stun=0;enemy.knockdown=false;enemy.ko=false;enemy.rctHealing=false;enemy.pendingPunchCooldown=true;enemy.aiCooldown=9999;enemy.vx=4;
 for(let i=0;i<185;i++){enemy.aiGoal=i%2?'block':'range';updateCpuStuckRecovery();}`);
 assert.equal(g.run('enemy.pendingPunchCooldown'),false);assert.equal(g.run('enemy.aiCooldown'),0);
});
test('Fuga range is halved and Thragg flight points the body and leading fist forward',t=>{
 const g=setup(t);assert.ok(Math.abs(g.run('techniqueMoves.fuga.speed*techniqueMoves.fuga.life')-460)<1e-6);
 const r=g.run(`(()=>{player.technique='brawler';player.thraggFlightTicks=200;player.grounded=false;player.ko=false;player.vy=0;
 const pose=getThraggFlightPose(player),arm=pose.arms[1];drawFighter(player,'');
 return {angle:pose.angle,fist:arm.fist.y,shoulder:arm.shoulder.y};})()`);
 assert.equal(r.angle,Math.PI/2);assert.ok(r.fist<r.shoulder-40);
});
test('both Inosuke swords face forward through idle and attacks',t=>{
 const g=setup(t);const angles=g.run(`(()=>{const angles=[],old=ctx.rotate;ctx.rotate=a=>angles.push(a);
 player.technique='beast';const hands=[{hand:{x:45,y:80},elbow:{x:49,y:65}},{hand:{x:7,y:80},elbow:{x:2,y:65}}];
 for(const attack of [null,'light','heavy']){player.attacking=attack;drawBeastSwords(player,hands);}
 ctx.rotate=old;return angles;})()`);assert.equal(angles.length,6);assert.ok(angles.every(a=>Math.cos(a)>.8));
});
