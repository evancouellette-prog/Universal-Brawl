/* Shared canvas artwork. Loaded before game.js; drawing runs after game setup. */
function materialGradient(color, x1, y1, x2, y2) {
  const hex = /^#([\da-f]{6})$/i.exec(color);
  if (!hex) return color;
  const n = parseInt(hex[1], 16);
  const rgb = [n >> 16, (n >> 8) & 255, n & 255];
  const tint = amount => `rgb(${rgb.map(v => Math.round(amount > 0 ? v + (255 - v) * amount : v * (1 + amount))).join(',')})`;
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  gradient.addColorStop(0, tint(0.22));
  gradient.addColorStop(0.36, color);
  gradient.addColorStop(0.73, tint(-0.12));
  gradient.addColorStop(1, tint(-0.38));
  return gradient;
}

function drawDetailedBuildings(offset, baseY, color) {
  const cache = drawDetailedBuildings.cache || (drawDetailedBuildings.cache = new Map());
  const key = `${offset}:${baseY}:${color}`;
  let layer = cache.get(key);
  if (!layer) {
    layer = document.createElement('canvas'); layer.width = STAGE_W + 240; layer.height = GROUND;
    const previous = ctx;
    ctx = layer.getContext('2d');
    ctx.translate(120, 0);
    const widths = [68,82,54,98,74,62,86,58,112,70,64,96];
    let x = -120 + offset;
    for(let i=0;x<STAGE_W+120;i++) {
      const width=widths[i%widths.length], height=92+((i*37)%115), top=baseY-height;
      ctx.fillStyle=materialGradient(color,x,top,x+width,baseY);
      ctx.fillRect(x,top,width,height);
      ctx.fillStyle='rgba(6,10,25,0.3)'; ctx.fillRect(x+width-9,top+4,9,height-4);
      ctx.fillStyle='rgba(200,199,217,0.14)'; ctx.fillRect(x,top,width,2);
      // Recessed roof houses, water tanks, and antennas break up the skyline.
      ctx.fillStyle=color;
      ctx.fillRect(x+12,top-7,width*0.46,7);
      if(i%4===0) {
        ctx.strokeStyle=color; ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(x+width*0.67,top);ctx.lineTo(x+width*0.67,top-27);ctx.stroke();
        ctx.fillStyle='#ae877d';ctx.fillRect(x+width*0.67-1,top-28,2,2);
      }
      if(i%4===2) {
        ctx.fillStyle='rgba(15,19,32,0.8)';
        ctx.fillRect(x+18,top-16,20,15);
        ctx.beginPath();ctx.ellipse(x+28,top-16,10,3,0,0,Math.PI*2);ctx.fill();
      }
      for(let wx=x+10;wx<x+width-12;wx+=17) {
        for(let wy=top+15;wy<baseY-12;wy+=22) {
          const lit=(Math.floor((wx-x)/17)+Math.floor((wy-top)/22)*3+i*7)%5<2;
          ctx.fillStyle=lit?'rgba(243,209,145,0.52)':'rgba(110,143,184,0.12)';
          ctx.fillRect(wx,wy,9,13);
          ctx.fillStyle=lit?'rgba(255,244,196,0.28)':'rgba(195,211,226,0.1)';
          ctx.fillRect(wx,wy,9,1);
          ctx.fillStyle='rgba(9,15,28,0.46)';ctx.fillRect(wx+4,wy,1,13);ctx.fillRect(wx,wy+7,9,1);
        }
      }
      ctx.strokeStyle='rgba(7,12,26,0.23)';ctx.lineWidth=1;
      for(let y=top+37;y<baseY;y+=44) {ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+width,y);ctx.stroke();}
      x+=width+16;
    }
    ctx = previous;
    cache.set(key,layer);
  }
  ctx.drawImage(layer,-120,0);
}

function drawSanjiEyebrow() {
  ctx.save();
  ctx.strokeStyle = '#684719';
  ctx.lineWidth = 1.65;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(15.5, 20.5);
  ctx.quadraticCurveTo(20, 18.4, 24.4, 20);
  ctx.bezierCurveTo(30.2, 22, 28.8, 15.6, 25.1, 16.7);
  ctx.bezierCurveTo(21.7, 17.7, 25, 21.4, 26.4, 19.1);
  ctx.stroke();
  ctx.restore();
}

function drawOutfitFinishing(f, palette) {
  ctx.save();
  // Shade only the cloth/armor silhouette, keeping all existing insignia.
  traceTorsoShape(39, 81);
  ctx.clip();
  const shade = ctx.createLinearGradient(10, 42, 44, 70);
  shade.addColorStop(0, 'rgba(225,237,255,0.16)');
  shade.addColorStop(0.35, 'rgba(255,255,255,0)');
  shade.addColorStop(0.7, 'rgba(6,10,24,0.02)');
  shade.addColorStop(1, 'rgba(6,10,24,0.27)');
  ctx.fillStyle = shade;
  ctx.fillRect(8, 38, 38, 48);
  ctx.strokeStyle = 'rgba(244,240,227,0.18)';
  ctx.lineWidth = 1.1;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(13, 46); ctx.quadraticCurveTo(10, 60, 15, 75); ctx.stroke();
  if (['deathnote', 'blackleg', 'limitless', 'david', 'akira'].includes(f.technique)) {
    // Subtle seam stitching, sleeve folds and a welt pocket.
    ctx.strokeStyle = 'rgba(7,13,26,0.28)';
    ctx.beginPath(); ctx.moveTo(33, 63); ctx.lineTo(40, 62); ctx.moveTo(14, 71); ctx.lineTo(20, 73); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,243,223,0.16)';
    ctx.beginPath(); ctx.moveTo(33, 64.5); ctx.lineTo(40, 63.5); ctx.stroke();
  }
  if (f.technique === 'blackleg' && skinOf(f) === 'wano') {
    ctx.strokeStyle = '#c6a967'; ctx.lineWidth = 0.8;
    for (const [x, y] of [[16, 51], [36, 63], [19, 73]]) {
      ctx.beginPath(); ctx.moveTo(x-3,y); ctx.lineTo(x,y-3); ctx.lineTo(x+3,y); ctx.lineTo(x,y+3); ctx.closePath(); ctx.stroke();
    }
  }
  if (f.technique === 'zealot' || (f.technique === 'brawler' && skinOf(f) === 'warArmor')) {
    ctx.strokeStyle = 'rgba(255,239,188,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(15,44); ctx.quadraticCurveTo(26,48,38,44); ctx.moveTo(16,67); ctx.lineTo(18,77); ctx.stroke();
  }
  ctx.restore();
}

function drawLightHandAction(f, drawArm, palette) {
  if (f.potatoEatingTicks > 0) {
    const age = LIGHT_POTATO_EAT_TICKS - f.potatoEatingTicks;
    const raise = easeOutQuad(clamp01(age / 15));
    const lower = easeOutQuad(clamp01((age - 24) / 16));
    const t = raise * (1 - lower);
    const hand = { x: lerp(39, 30, t), y: lerp(67, 30, t) };
    drawArm({ x: 11, y: 52 }, { x: 10, y: 65 }, { x: 22, y: 69 });
    ctx.fillStyle = materialGradient('#c49540', 14, 64, 32, 85);
    ctx.strokeStyle = '#513626'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(15,64); ctx.lineTo(31,63); ctx.lineTo(32,84); ctx.lineTo(15,85); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#f6dc92'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(17,66); ctx.lineTo(29,65); ctx.moveTo(17,81); ctx.lineTo(29,80); ctx.stroke();
    ctx.fillStyle = '#75412a'; ctx.beginPath(); ctx.ellipse(23,74,5,3,-0.3,0,Math.PI*2); ctx.fill();
    drawArm({ x: 42, y: 52 }, { x: 51, y: 54 - t * 8 }, hand);
    if (age < 23) {
      ctx.fillStyle = '#f5d178'; ctx.strokeStyle = '#ad7b31'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(hand.x-1,hand.y-3,4.6,2.6,-0.7,0,Math.PI*2); ctx.fill(); ctx.stroke();
    } else if (age < 30) {
      ctx.fillStyle = '#edc064';
      for (let i=0;i<3;i++) ctx.fillRect(29+i*3,33+(age-23)*1.3+i*2,1.4,1.4);
    }
    return;
  }
  // Ryuk performs all punches and throws. Light keeps a relaxed stance.
  drawArm({x:42,y:52},{x:49,y:68},{x:44,y:81});
  drawArm({x:11,y:52},{x:4,y:68},{x:8,y:81});
}

function drawDeathNoteWritingScene(effect) {
  const age = effect.maxTicks - effect.ticks;
  const fade = Math.min(clamp01(age/10), clamp01(effect.ticks/18));
  const progress = clamp01((age-18)/(LIGHT_DEATH_NOTE_WRITE_TICKS-18));
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.fillStyle = 'rgba(10,10,18,0.86)'; ctx.fillRect(0,0,W,H);
  const halo = ctx.createRadialGradient(W*0.55,H*0.5,10,W*0.55,H*0.5,W*0.55);
  halo.addColorStop(0,'rgba(155,108,57,0.28)'); halo.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = halo; ctx.fillRect(0,0,W,H);
  ctx.translate(W*0.5,H*0.54);
  const sceneScale = Math.min(W/660,H/360);
  ctx.scale(sceneScale,sceneScale);
  const suit = effect.skinId === 'sweats' ? '#808895' : '#aa7848';
  // Light leans over the book, identifiable by his outfit and swept brown hair.
  ctx.fillStyle = materialGradient(suit,-180,-95,-82,105);
  ctx.strokeStyle = '#11121b'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-171,-76); ctx.quadraticCurveTo(-138,-89,-107,-65);
  ctx.lineTo(-62,87); ctx.lineTo(-206,87); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = effect.skinId === 'sweats' ? '#626c7c' : '#eee5d3';
  ctx.beginPath(); ctx.moveTo(-149,-74); ctx.lineTo(-124,-66); ctx.lineTo(-105,4); ctx.lineTo(-148,-2); ctx.closePath(); ctx.fill();
  if (effect.skinId !== 'sweats') {
    ctx.fillStyle = '#76252e'; ctx.beginPath(); ctx.moveTo(-136,-59); ctx.lineTo(-126,-54); ctx.lineTo(-114,-5); ctx.lineTo(-129,2); ctx.closePath(); ctx.fill();
  }
  ctx.save(); ctx.translate(-130,-115); ctx.rotate(0.3);
  ctx.fillStyle = materialGradient('#f1c7a4',-25,-35,28,28);
  ctx.beginPath(); ctx.ellipse(0,0,28,34,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = materialGradient('#6b3f1f',-30,-44,30,12);
  ctx.beginPath(); ctx.moveTo(-28,1); ctx.quadraticCurveTo(-36,-35,-5,-39);
  ctx.quadraticCurveTo(27,-42,31,-6); ctx.lineTo(26,7); ctx.lineTo(21,-9);
  ctx.lineTo(15,2); ctx.lineTo(8,-11); ctx.lineTo(0,3); ctx.lineTo(-7,-10);
  ctx.lineTo(-16,5); ctx.lineTo(-21,-8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(222,169,102,0.4)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-19,-25); ctx.quadraticCurveTo(3,-36,21,-21); ctx.stroke();
  ctx.restore();
  // Open black cover, layered page edges, and a shaded central spine.
  ctx.fillStyle = '#151419'; ctx.strokeStyle = '#9b8158'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-95,9); ctx.lineTo(24,-6); ctx.lineTo(201,7);
  ctx.lineTo(221,119); ctx.lineTo(21,109); ctx.lineTo(-119,121); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#b8a88b'; ctx.beginPath(); ctx.moveTo(-109,110); ctx.lineTo(20,99); ctx.lineTo(210,110); ctx.lineTo(210,116); ctx.lineTo(20,106); ctx.lineTo(-109,118); ctx.closePath(); ctx.fill();
  ctx.fillStyle = materialGradient('#f5ead1',-80,4,203,112);
  ctx.beginPath(); ctx.moveTo(-88,15); ctx.quadraticCurveTo(-31,3,22,6);
  ctx.quadraticCurveTo(102,-1,195,15); ctx.lineTo(208,108); ctx.quadraticCurveTo(113,93,22,100);
  ctx.quadraticCurveTo(-43,102,-105,111); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#b6a58a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(22,7); ctx.quadraticCurveTo(13,54,22,100); ctx.stroke();
  ctx.strokeStyle = 'rgba(97,84,66,0.16)'; ctx.lineWidth = 0.7;
  for(let i=0;i<5;i++) { ctx.beginPath(); ctx.moveTo(37,44+i*11); ctx.lineTo(184,48+i*11); ctx.stroke(); }
  ctx.fillStyle = '#514332'; ctx.textAlign = 'center'; ctx.font = '600 12px Georgia, serif';
  ctx.fillText('DEATH NOTE',-35,47);
  const name = effect.targetName || 'Opponent';
  ctx.textAlign = 'left'; ctx.font = 'italic 23px Georgia, serif';
  const nameWidth = Math.min(141,ctx.measureText(name).width);
  const tip = {x:37+nameWidth*progress,y:57+Math.sin(progress*50)*1.4};
  ctx.save(); ctx.beginPath(); ctx.rect(35,31,nameWidth*progress+1,37); ctx.clip();
  ctx.fillStyle = '#2d2430'; ctx.fillText(name,37,57,141); ctx.restore();
  // Holding hand and the writing arm connect the pen tip to Light's shoulder.
  const arm = (points,width,color) => {
    ctx.strokeStyle = '#11121b'; ctx.lineWidth = width+5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(...points[0]); for(const q of points.slice(1)) ctx.lineTo(...q); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  };
  arm([[-173,-57],[-194,11],[-103,78]],19,suit);
  ctx.fillStyle = '#e5b891'; ctx.beginPath(); ctx.ellipse(-94,81,13,8,0.2,0,Math.PI*2); ctx.fill();
  arm([[-112,-54],[-75,-14],[tip.x+15,tip.y-23]],22,materialGradient(suit,-105,-60,tip.x,tip.y));
  ctx.strokeStyle = '#ebd5ad'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(tip.x,tip.y); ctx.lineTo(tip.x+23,tip.y-43); ctx.stroke();
  ctx.strokeStyle = '#1c1b23'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(tip.x+5,tip.y-9); ctx.lineTo(tip.x+24,tip.y-45); ctx.stroke();
  ctx.fillStyle = materialGradient('#efc39d',tip.x,tip.y-31,tip.x+26,tip.y-8);
  ctx.beginPath(); ctx.ellipse(tip.x+13,tip.y-22,13,9,-0.6,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#aa7c61'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(tip.x+4,tip.y-20); ctx.lineTo(tip.x+15,tip.y-27); ctx.stroke();
  ctx.restore();
}

function drawArenaFinish() {
  const atmo = STAGE_ATMOSPHERE[currentStageId];
  if (!atmo) return;
  const left = Math.max(0, cameraX - 80), right = Math.min(STAGE_W, cameraX + W / Math.max(0.35,cameraZoom) + 80);
  ctx.save();
  // The light/dark bevel makes the walkable edge clear at every zoom level.
  const ground = ctx.createLinearGradient(0,GROUND,0,GROUND+130);
  ground.addColorStop(0,'rgba(238,232,213,0.18)'); ground.addColorStop(0.05,'rgba(4,7,16,0.05)');
  ground.addColorStop(1,'rgba(2,5,14,0.64)'); ctx.fillStyle=ground;
  ctx.fillRect(left,GROUND,right-left,150);
  ctx.fillStyle='rgba(255,238,201,0.22)'; ctx.fillRect(left,GROUND,right-left,1.5);
  const wooden = currentStageId === 'sunny';
  const tech = currentStageId === 'protoss' || currentStageId === 'space';
  const natural = ['zen','village','upsideDown'].includes(currentStageId);
  const spacing = wooden ? 80 : tech ? 128 : 104;
  ctx.lineWidth = 1;
  for(let x=Math.floor(left/spacing)*spacing;x<right;x+=spacing) {
    if(natural) {
      ctx.strokeStyle=currentStageId==='zen'?'rgba(241,208,155,0.25)':'rgba(131,129,117,0.22)';
      for(let j=0;j<8;j++) {
        const px=x+(j*37)%spacing, y=GROUND+8+(j*19+x*3)%60;
        ctx.beginPath(); ctx.moveTo(px,y); ctx.quadraticCurveTo(px+5,y-3,px+11,y); ctx.stroke();
      }
    } else {
      ctx.strokeStyle='rgba(0,0,0,0.32)';
      ctx.beginPath(); ctx.moveTo(x,GROUND+5); ctx.lineTo(x+19,GROUND+115); ctx.stroke();
      ctx.strokeStyle='rgba(247,231,208,0.09)';
      ctx.beginPath(); ctx.moveTo(x+2,GROUND+5); ctx.lineTo(x+21,GROUND+115); ctx.stroke();
      if(wooden) {
        ctx.strokeStyle='rgba(37,20,9,0.2)';
        ctx.beginPath(); ctx.moveTo(x+13,GROUND+25); ctx.bezierCurveTo(x+55,GROUND+19,x+35,GROUND+39,x+72,GROUND+33); ctx.stroke();
      } else {
        ctx.fillStyle=tech?'rgba(90,219,231,0.55)':'rgba(255,206,129,0.16)';
        ctx.fillRect(x+10,GROUND+8,tech?24:40,2);
        ctx.fillStyle='rgba(207,216,226,0.26)'; ctx.beginPath(); ctx.arc(x+6,GROUND+7,1.6,0,Math.PI*2); ctx.fill();
      }
    }
  }
  // Restrained glints across the distant horizon complement each stage's palette.
  ctx.strokeStyle=atmo.particle; ctx.globalAlpha=0.14; ctx.lineWidth=1;
  for(let i=0;i<10;i++) {
    const x=(i*281+137)%STAGE_W;
    if(x<left||x>right) continue;
    const y=GROUND-30-(i*47)%160;
    ctx.beginPath(); ctx.moveTo(x-3,y); ctx.lineTo(x+3,y); ctx.moveTo(x,y-3); ctx.lineTo(x,y+3); ctx.stroke();
  }
  ctx.restore();
}

function drawProjectileTrail(p) {
  const speed = Math.hypot(p.vx||0,p.vy||0);
  if (speed < 1 || ['cleave','ryukStrike','groundBreak'].includes(p.move)) return;
  const colors = { red:'#fb7185', blue:'#7dd3fc', purple:'#c4b5fd', worldSlash:'#fda4af', slash:'#fda4af', fuga:'#fdba74', webShot:'#e2e8f0', jijiSoccer:'#e9d5ff', davidRocket:'#fbbf24' };
  const color = colors[p.move] || '#c5dbe6';
  const age = Math.min(1,(p.visualSpawnAge||0)/5);
  const length = Math.min(128,speed*5)*age;
  const radius = Math.min(26,(p.radius||12)*0.45);
  ctx.save(); ctx.rotate(Math.atan2(p.vy||0,p.vx||0));
  const glow = ctx.createLinearGradient(-length,0,5,0);
  glow.addColorStop(0,color+'00'); glow.addColorStop(0.68,color+'40'); glow.addColorStop(1,color+'b0');
  ctx.fillStyle=glow;
  ctx.beginPath(); ctx.moveTo(5,-radius); ctx.quadraticCurveTo(-length*0.4,-radius*0.5,-length,0);
  ctx.quadraticCurveTo(-length*0.4,radius*0.5,5,radius); ctx.closePath(); ctx.fill();
  ctx.strokeStyle=color+'80'; ctx.lineWidth=1.4; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(-length*0.75,-radius*0.3); ctx.lineTo(-4,-radius*0.3); ctx.stroke();
  ctx.restore();
}

// Keep the five approved looks intact; refine the remaining outfit materials
// without changing character identities, face rules, or selected-skin ownership.
function drawSkinPolish(f, palette) {
  const tech=f.technique, skin=skinOf(f);
  if (tech==='deathnote' || (skin==='default' && ['limitless','shrine','brawler'].includes(tech))) return;
  const line=(points,color,width=1.2)=>{
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(...points[0]);
    for(const p of points.slice(1))ctx.lineTo(...p);ctx.stroke();
  };
  const panel=(points,color,edge='#111827')=>{
    ctx.fillStyle=color;ctx.strokeStyle=edge;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(...points[0]);
    for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.fill();ctx.stroke();
  };
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  if (tech==='limitless') {
    // Fitted black tee, folded cloth sash and subtle fabric tension.
    line([[19,40],[23,43],[31,43],[35,40]],'#222731',2.8);
    for(const y of [59,65])line([[16,y],[24,y+2],[37,y-1]],'rgba(186,202,217,.17)');
    panel([[12,72],[41,73],[40,81],[13,80]],materialGradient('#262630',12,72,42,81));
    panel([[29,78],[35,79],[40,99],[34,97]],'#20212a');
    line([[15,76],[37,77]],'#656371',.8);
  } else if (tech==='shrine') {
    line([[19,40],[24,43],[35,41]],'#ff8d78',1.5);
    line([[15,48],[14,72],[18,83]],'#4c5873');
    line([[39,49],[38,70],[34,80]],'#080f20',2);
    panel([[32,57],[39,56],[39,60],[32,61]],'#172239');
  } else if (tech==='brawler' || tech==='zealot') {
    const metal=tech==='brawler'?(skin==='warArmor'?'#bc8148':'#d8dfe8'):
      skin==='purifier'?'#e4e8ef':skin==='taldarim'?'#3e364d':'#b7a260';
    const edge=tech==='zealot'?(skin==='taldarim'?'#ff737d':skin==='purifier'?'#81d9ff':'#94f4dd'):'#f0d5a9';
    for(const sign of [-1,1]) {
      const x=27+sign*11;
      panel([[x-sign*8,47],[x+sign*5,45],[x+sign*3,60],[x-sign*7,64]],materialGradient(metal,x-6,46,x+6,64));
      line([[x-sign*6,49],[x+sign*2,48],[x,57]],edge,.9);
    }
    for(const y of [67,74,81]) {
      panel([[19,y],[35,y],[33,y+5],[21,y+5]],materialGradient(metal,18,y,35,y+5));
    }
    if(tech==='zealot') {
      panel([[27,50],[31,55],[27,61],[23,55]],edge);
      line([[27,52],[27,57]],'#ffffff');
    }
  } else if (tech==='blackleg') {
    if(skin==='wano') {
      panel([[17,40],[23,41],[36,73],[30,75]],'#cec5a9');
      panel([[38,42],[34,42],[20,73],[25,74]],'#ece0c2');
      panel([[13,75],[41,75],[40,84],[14,84]],materialGradient('#855339',13,75,41,84));
      for(const [x,y] of [[16,54],[35,65],[18,69]]) {
        line([[x-3,y],[x,y-3],[x+3,y],[x,y+3],[x-3,y]],'#ddd1aa');
      }
    } else if(skin==='raidSuit') {
      panel([[16,45],[26,51],[37,44],[36,65],[26,71],[16,64]],materialGradient('#263c55',15,45,39,72));
      line([[19,48],[26,55],[34,48]],'#e5b35c',2);
      ctx.fillStyle='#f2d28a';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('3',27,67);
      line([[15,77],[39,77]],'#f4ce75',4);
    } else {
      const light=skin==='wholeCake';
      const lapel=light?'#e4d9c3':'#171d2a';
      panel([[17,40],[23,43],[24,66],[15,50],[19,49]],lapel);
      panel([[37,40],[31,43],[28,66],[40,51],[35,49]],lapel);
      line([[18,43],[22,60]],light?'#fff8e5':'#61667a',.8);
      for(const y of [63,70,77])for(const x of [23,32]) {
        ctx.fillStyle=light?'#a18144':'#d8b778';ctx.beginPath();ctx.arc(x,y,1.2,0,Math.PI*2);ctx.fill();
      }
      line([[33,57],[39,56]],light?'#ac9f85':'#858895');
    }
  } else if (tech==='spider') {
    // Structured suit panels with restrained webbing, plus a legible chest emblem.
    ctx.save();traceTorsoShape(40,81);ctx.clip();
    const web=skin==='symbiote'?'#919aae':skin==='iron'?'#e7b85c':skin==='miles'?'#bc4653':'#202e48';
    for(const x of [14,20,34,40])line([[27,44],[x,64],[x+(x<27?-3:3),81]],web,.7);
    for(const y of [50,58,68,77]) {
      ctx.strokeStyle=web;ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(12,y);
      ctx.quadraticCurveTo(27,y+7,42,y);ctx.stroke();
    }
    ctx.restore();
    const emblem=skin==='symbiote'?'#ecf0f7':skin==='iron'?'#f0cc77':skin==='miles'?'#ec4959':'#121b2a';
    ctx.fillStyle=emblem;ctx.beginPath();ctx.ellipse(27,59,2.2,5,0,0,Math.PI*2);ctx.fill();
    for(const sign of [-1,1])for(let i=0;i<4;i++) {
      line([[27+sign,56+i*2],[27+sign*(6+i*.6),51+i*5],[27+sign*9,48+i*7]],emblem,1.3);
    }
  } else if (tech==='beast') {
    if(skin==='ako') {
      panel([[17,40],[23,41],[35,76],[29,79]],'#f4c9d6');
      panel([[38,40],[33,41],[19,77],[25,78]],'#f6dde1');
      panel([[13,76],[41,76],[40,85],[14,85]],'#784b79');
      for(const [x,y] of [[17,58],[35,69],[17,71]]) {
        ctx.fillStyle='#fff1dd';for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.beginPath();ctx.ellipse(x+Math.cos(a)*2,y+Math.sin(a)*2,1.7,1,a,0,Math.PI*2);ctx.fill();}
      }
    } else {
      // Layered fur follows the belt rather than covering the entire torso.
      for(let i=0;i<10;i++) {
        const x=9+i*3.7,y=79+(i%3);
        panel([[x,y],[x+5,y-2],[x+6,y+7],[x+3,y+4],[x+1,y+10]],i%2?'#94745c':'#b2977b','#5e493a');
      }
      if(skin==='boarGod') {
        for(const x of [13,40]) {
          panel([[x-6,42],[x,38],[x+6,43],[x+5,50],[x-5,49]],materialGradient('#b78a45',x-6,39,x+6,51));
          line([[x-3,43],[x,41],[x+3,44]],'#ffe1a0');
        }
      }
    }
  } else if(tech==='hivemind') {
    if(skin==='creel') {
      panel([[17,40],[23,42],[25,61],[17,52]],'#bdc3c8');
      panel([[37,40],[31,42],[29,61],[38,52]],'#d9dcdd');
      line([[27,46],[27,81]],'#677780');
      for(const y of [54,63,72]){ctx.fillStyle='#677780';ctx.fillRect(26,y,1.5,1.5);}
    } else {
      // Bark-like supernatural armor: layered ridges, no anatomical gore.
      const ridge=skin==='season4'?'#927978':'#8e796d';
      for(const sign of [-1,1])for(let i=0;i<4;i++) {
        const x=27+sign*12,y=45+i*8;
        ctx.strokeStyle='#342d35';ctx.lineWidth=3.8;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(27+sign*4,y+1,27+sign*2,y+7);ctx.stroke();
        ctx.strokeStyle=ridge;ctx.lineWidth=1.5;ctx.stroke();
      }
    }
  } else if(['jiji','david','akira','gardener'].includes(tech)) {
    const uniform=skin==='school'||skin==='schoolwear'||skin==='corporate';
    if(uniform) {
      line([[16,46],[20,60],[24,64]],'#7b8290');
      line([[37,46],[33,60],[29,64]],'#797f8a');
      line([[15,69],[21,68]],'#a4a4a8');
      line([[34,66],[40,65]],'#a4a4a8');
    } else if(tech==='david') {
      panel([[13,40],[20,41],[18,78],[11,76]],materialGradient('#c5a02a',11,40,21,78));
      panel([[34,41],[41,40],[43,76],[36,78]],materialGradient('#edc846',34,40,43,78));
      line([[13,65],[19,64]],'#dbe9eb',3);line([[35,64],[41,65]],'#dbe9eb',3);
      line([[17,45],[16,58]],'#fff0a7');
    } else if(tech==='akira') {
      line([[17,43],[18,64],[24,69]],'#dce9ed');
      line([[36,43],[35,63],[30,69]],'#dce9ed');
      panel([[33,52],[39,52],[39,58],[33,58]],'#edf5ed');
      line([[35,54],[38,54]],'#c55551');
    } else if(tech==='gardener') {
      panel([[15,61],[24,61],[23,72],[16,72]],'#dde0d3','#929a89');
      line([[17,63],[22,63]],'#ffffff');
      line([[32,53],[37,53]],'#acb79d');
      line([[16,79],[37,79]],'#929a89');
    } else {
      line([[19,41],[23,45],[31,45],[35,41]],'#efe2d6',2);
      line([[14,72],[22,74],[39,72]],'#574d65');
      line([[36,52],[40,57]],'#e2c9b2');
    }
  }
  ctx.restore();
}

function drawBeastSwords(f, hands) {
  for (const [i,rig] of hands.slice(-2).entries()) {
    const {hand,elbow}=rig;
    const moving=f.attacking || f.beastPierceTicks>0;
    const angle=moving?Math.atan2(hand.y-elbow.y,hand.x-elbow.x)-.25:
      (i===0?-.65:-2.45)+Math.sin(frame*.045+i)*.035;
    ctx.save();ctx.translate(hand.x,hand.y);ctx.rotate(angle);
    ctx.fillStyle=materialGradient('#c6d4da',6,-5,6,5);ctx.strokeStyle='#14212c';ctx.lineWidth=1.3;
    ctx.beginPath();ctx.moveTo(5,-3);ctx.lineTo(47,-2);ctx.lineTo(54,-5);ctx.lineTo(50,3);
    for(let x=45;x>6;x-=6){ctx.lineTo(x,4);ctx.lineTo(x-2,1);ctx.lineTo(x-3,4);}
    ctx.lineTo(5,3);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='#f5ffff';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(8,-2);ctx.lineTo(46,-1);ctx.stroke();
    ctx.fillStyle='#d5d0be';ctx.fillRect(-7,-2.5,13,5);
    ctx.strokeStyle='#827d72';ctx.lineWidth=.8;ctx.beginPath();
    for(let x=-6;x<6;x+=3){ctx.moveTo(x,-2);ctx.lineTo(x+2,2);}ctx.stroke();
    ctx.restore();
    // Repaint the gripping fingers over the wrap so blades sit inside each hand.
    ctx.fillStyle='#e6bc9e';ctx.beginPath();ctx.ellipse(hand.x-1,hand.y-1,3.8,2.6,angle,0,Math.PI*2);ctx.fill();
  }
}

function drawHazardWarning(h) {
  if(h.exploded || h.struck) return;
  const left=Math.max(0,cameraX),right=Math.min(STAGE_W,cameraX+W/Math.max(.35,cameraZoom));
  const lateral=h.kind==='traffic'||h.kind==='wave';
  const labels={traffic:'TRAFFIC',wave:'WAVE',pylonBeam:'BEAM',embers:'FALLING EMBER',spores:'SPORE CLOUD',meteor:'METEOR'};
  const color=h.kind==='wave'?'#7ce5ff':h.kind==='spores'?'#f3a4dc':'#ffcf69';
  const x=lateral?(h.dir>0?left+85:right-85):(h.tx??h.x);
  const half={pylonBeam:30,embers:30,spores:60,meteor:70}[h.kind]||0;
  const height={traffic:46,wave:70,pylonBeam:GROUND,embers:40,spores:70,meteor:80}[h.kind]||40;
  ctx.save();ctx.lineJoin='round';ctx.lineWidth=2;ctx.strokeStyle=color;
  ctx.fillStyle=color+'20';
  const x0=lateral?left:x-half,x1=lateral?right:x+half;
  ctx.fillRect(x0,GROUND-height,x1-x0,height);
  ctx.setLineDash([8,6]);ctx.strokeRect(x0,GROUND-height,x1-x0,height);ctx.setLineDash([]);
  // Persistent ground stripe and a quiet pulse remain readable over every map.
  ctx.globalAlpha=.7+Math.sin(frame*.07)*.15;
  ctx.fillStyle=color;ctx.fillRect(x0,GROUND-4,x1-x0,4);
  ctx.globalAlpha=1;
  const label=labels[h.kind]+(h.warn>0?'  '+(h.warn/60).toFixed(1)+'s':'');
  const tx=Math.max(left+85,Math.min(right-85,x)),ty=GROUND-Math.min(height,100)-17;
  ctx.font='bold 12px sans-serif';ctx.textAlign='center';
  const width=ctx.measureText(label).width+24;
  ctx.fillStyle='#111722';ctx.beginPath();ctx.roundRect(tx-width/2,ty-15,width,23,5);ctx.fill();ctx.stroke();
  ctx.fillStyle=color;ctx.fillText(label,tx,ty+1);
  if(lateral) {
    const ax=tx+h.dir*(width/2+12);
    ctx.beginPath();ctx.moveTo(ax-h.dir*6,ty-10);ctx.lineTo(ax+h.dir*3,ty-4);ctx.lineTo(ax-h.dir*6,ty+2);ctx.stroke();
  } else {
    ctx.beginPath();ctx.moveTo(x-6,GROUND-15);ctx.lineTo(x,GROUND-7);ctx.lineTo(x+6,GROUND-15);ctx.stroke();
  }
  ctx.restore();
}

function drawSceneryPolish() {
  const cache=drawSceneryPolish.cache||(drawSceneryPolish.cache=new Map());
  let layer=cache.get(currentStageId);
  if(!layer) {
    layer=document.createElement('canvas');layer.width=STAGE_W;layer.height=GROUND;
    const previous=ctx;ctx=layer.getContext('2d');
    const stage=currentStageId;
    // Cached distant silhouettes leave the combat plane crisp and inexpensive.
    ctx.globalAlpha=.48;
    for(let i=0;i<9;i++) {
      const x=80+i*(STAGE_W/8),y=GROUND-25;
      if(['zen','village','upsideDown'].includes(stage)) {
        const dark=stage==='zen'?'#584a4f':stage==='village'?'#292b43':'#302134';
        ctx.strokeStyle=dark;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x,y);
        ctx.bezierCurveTo(x-20,y-60,x+16,y-105,x-8,y-155);ctx.stroke();
        ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-1,y-90);ctx.lineTo(x-42,y-126);ctx.moveTo(x-3,y-60);ctx.lineTo(x+39,y-114);ctx.stroke();
        if(stage!=='upsideDown')for(let j=0;j<5;j++) {
          ctx.fillStyle=stage==='zen'?(j%2?'#ad7885':'#d29a9c'):'#434251';
          ctx.beginPath();ctx.ellipse(x+(j-2)*16,y-133-Math.sin(j)*18,30,15,.1*j,0,Math.PI*2);ctx.fill();
        }
      } else if(stage==='sunny') {
        ctx.strokeStyle='#496c82';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,y-80);ctx.lineTo(x+80,y-80);ctx.moveTo(x+30,y-82);ctx.lineTo(x+30,y-150);ctx.stroke();
        ctx.fillStyle='#e2ddd0';ctx.beginPath();ctx.moveTo(x+32,y-146);ctx.lineTo(x+65,y-92);ctx.lineTo(x+32,y-92);ctx.closePath();ctx.fill();
        ctx.fillStyle='#3c586a';ctx.beginPath();ctx.moveTo(x+5,y-80);ctx.lineTo(x+76,y-80);ctx.lineTo(x+62,y-68);ctx.lineTo(x+17,y-68);ctx.closePath();ctx.fill();
      } else if(stage==='space'||stage==='protoss') {
        ctx.strokeStyle=stage==='space'?'#8884b3':'#668d93';ctx.lineWidth=2;
        ctx.beginPath();ctx.ellipse(x,y-125,42,66,.35,0,Math.PI*2);ctx.stroke();
        ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y-125,35,59,.35,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle=stage==='space'?'#242a48':'#254e58';ctx.fillRect(x-10,y-74,20,49);
        ctx.fillStyle='#8baab5';ctx.fillRect(x-6,y-61,12,2);
      } else {
        ctx.strokeStyle='#5e647e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-109);ctx.quadraticCurveTo(x,y-123,x+17,y-123);ctx.lineTo(x+33,y-123);ctx.stroke();
        ctx.fillStyle='#dfc89b';ctx.fillRect(x+21,y-124,14,3);
        const g=ctx.createRadialGradient(x+28,y-120,1,x+28,y-120,43);g.addColorStop(0,'rgba(236,210,159,.2)');g.addColorStop(1,'rgba(236,210,159,0)');ctx.fillStyle=g;ctx.fillRect(x-16,y-164,88,88);
        if(stage==='rooftops') {
          ctx.fillStyle='#363c52';ctx.fillRect(x+45,y-46,39,26);
          ctx.strokeStyle='#838799';ctx.lineWidth=1;for(let j=0;j<5;j++){ctx.beginPath();ctx.moveTo(x+49,y-41+j*4);ctx.lineTo(x+80,y-41+j*4);ctx.stroke();}
        }
      }
    }
    ctx=previous;cache.set(currentStageId,layer);
  }
  ctx.save();ctx.drawImage(layer,0,0);ctx.restore();
}
