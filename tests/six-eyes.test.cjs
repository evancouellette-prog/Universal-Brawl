const test=require('node:test');const assert=require('node:assert/strict');const {loadGame}=require('./harness.cjs');
test('Six Eyes reveals targeting only for the local Gojo, on either online role',t=>{
 const g=loadGame();t.after(()=>g.close());
 g.run(`gameState='playing';gameMode='online';onlineRole='p1';player.technique='limitless';enemy.technique='shrine';enemy.chargingTechnique=1;enemy.fugaAiming=true;enemy.ultimateAiming=true;`);
 assert.equal(g.run('shouldShowChargePreview(enemy) && shouldShowFugaPreview(enemy) && shouldShowUltimateAimPreview(enemy)'),true);
 g.run(`onlineRole='p2';`);assert.equal(g.run('canSeeOpponentAim(player)'),false);
 g.run(`enemy.technique='limitless';player.technique='shrine';player.chargingTechnique=1;`);assert.equal(g.run('canSeeOpponentAim(player) && shouldShowChargePreview(player)'),true);
 g.run(`gameState='intro'`);assert.equal(g.run('canSeeOpponentAim(player)'),false);
 g.run(`gameState='playing';enemy.ko=true;`);assert.equal(g.run('canSeeOpponentAim(player)'),false);
});
test('Six Eyes renders live opponent targeting and stops revealing when Gojo changes character',t=>{
 const g=loadGame();t.after(()=>g.close());
 assert.equal(g.run(`(()=>{
 gameMode='cpu';gameState='playing';player.technique='limitless';enemy.technique='shrine';enemy.chargingTechnique=1;enemy.techniqueAim={x:250,y:300};
 let lines=0;const old=ctx.lineTo;ctx.lineTo=()=>lines++;
 drawTechniqueAimPreview(enemy);const revealed=lines>0;
 player.technique='brawler';lines=0;drawTechniqueAimPreview(enemy);ctx.lineTo=old;
 return revealed && lines===0;
 })()`),true);
 g.run(`gameMode='pvp';enemy.technique='limitless';player.teleportAiming=true;player.technique='limitless';`);
 assert.equal(g.run('canSeeOpponentAim(player) && shouldShowTeleportPreview(player)'),true);
});
