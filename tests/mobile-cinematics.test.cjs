const test=require('node:test'),assert=require('node:assert/strict');const {loadGame}=require('./harness.cjs');const fs=require('fs'),path=require('path');
test('mobile home restores vertical scrolling and the game uses the full viewport with an overlaid HUD',t=>{
 const g=loadGame();t.after(()=>g.close());
 const style=g.window.document.createElement('style');style.textContent=fs.readFileSync(path.join(__dirname,'../styles.css'),'utf8');g.window.document.head.appendChild(style);
 g.window.document.body.classList.add('mobile-controls-on');
 const css=el=>g.window.getComputedStyle(g.window.document.querySelector(el));
 assert.equal(css('#homeScreen').overflowY,'auto');assert.equal(css('#homeScreen .home-panel').maxHeight,'none');assert.equal(css('#homeScreen .home-panel').overflow,'visible');
 assert.equal(css('.topbar').position,'absolute');
});
test('mobile camera enlarges nearby fighters and retains room for distant or airborne opponents',t=>{
 const g=loadGame();t.after(()=>g.close());g.run(`startFromHome(true);finishTechniqueSelect('shrine');player.x=400;enemy.x=650;player.y=enemy.y=GROUND-128;`);
 const desktop=g.run('getCameraTargetZoom()');g.window.document.body.classList.add('mobile-controls-on');
 assert.ok(g.run('getCameraTargetZoom()')>desktop);
 g.run('enemy.x=STAGE_W-100;');assert.ok(g.run('getCameraTargetZoom()')<1);
 g.run('enemy.x=650;enemy.y=-100');assert.ok(g.run('getCameraTargetZoom()*(GROUND-enemy.y+70)<=H+.001'));
});
test('each roster entrance moves a render-only actor and all intro shots preserve real fighter state',t=>{
 const g=loadGame();t.after(()=>g.close());g.run(`startFromHome(false);finishTechniqueSelect('shrine');gameMode='cpu';gameState='lobby';startReadyCountdown();`);
 g.run(`for(const tech of Object.keys(CHARACTER_SKINS)){
  player.technique=tech;enemy.technique=tech;setupMatchIntro();matchIntro.id='render';matchIntro.votes={p1:false,p2:true};
  const before=JSON.stringify([getFighterNetworkState(player),getFighterNetworkState(enemy)]);
  frame=matchIntro.startFrame+5;const first=getIntroSceneActor(player,getMatchIntroBeat());
  frame=matchIntro.startFrame+65;const later=getIntroSceneActor(player,getMatchIntroBeat());
  if(first.x===later.x)throw Error('Static entrance '+tech);
  for(const time of [8,35,70,120,195,280]){frame=matchIntro.startFrame+time;draw();}
  if(before!==JSON.stringify([getFighterNetworkState(player),getFighterNetworkState(enemy)]))throw Error('Cinematic changed combat '+tech);
 }`);
});
