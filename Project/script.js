let rnd = (l,u) => Math.random() * (u-l) + l
let scene, camera, player, bullets = [], enemies = [], ammo_boxes = [], rocks = [], ammo_count = 10, enemy_killed = 0;
let isShooting = false;
let aim;
let playerHP = 100;
let maxHP = 100;

window.addEventListener("DOMContentLoaded",function() {
  scene = document.querySelector("a-scene");
  camera = document.querySelector("a-camera");
  createPlayer();

  aim = document.createElement("a-line");
  aim.setAttribute("start", "0 0 0");
  aim.setAttribute("end", "0 0 -50");
  aim.setAttribute("color", "red");
  aim.setAttribute("material", "lineWidth: 5");
  camera.appendChild(aim);

  spawnRocks();
  spawnSpiders(30);
  spawnAmmo(10);
  
  updateAmmoDisplay();
  updateHPDisplay();
  createSkyObjects();

  window.addEventListener("keydown", function(e) {
    if(e.key == " ") {
      e.preventDefault();
      if(ammo_count > 0) {
        let newBullet = new Bullet();
        bullets.push(newBullet);
        ammo_count--;
        updateAmmoDisplay();
        setTimeout(() => {
          if(newBullet && newBullet.obj && newBullet.obj.parentElement) {
            newBullet.obj.remove();
            let index = bullets.indexOf(newBullet);
            if(index > -1) bullets.splice(index, 1);
          }
        }, 5000);
      }
    }
  })
  
  setTimeout(loop,100);
  setTimeout(countdown,100);
})

function createPlayer() {
  player = new Player("a-camera");
}

function spawnAmmo(count) {
  for(let i = 0; i < count; i++) {
    ammo_boxes.push(new AmmoPack());
  }
}

class AmmoPack {
  constructor() {
    this.obj = document.createElement("a-sphere");
    this.obj.setAttribute("color", "yellow");
    this.obj.setAttribute("radius", "0.3");
    this.obj.setAttribute("static-body", "shape: auto");
    this.obj.setAttribute("position", {x: rnd(-70, 70), y: 0, z: rnd(-70, 70)});
    scene.appendChild(this.obj);
  }
  
  remove() {
    this.obj.remove();
  }
}

function updateScore() {
  document.getElementById("score").innerText = "Score: " + enemy_killed;
}

function updateAmmoDisplay() {
  let hud = document.getElementById("ammo");
  if(hud) hud.innerText = "Ammo: " + ammo_count;
  let vr = document.getElementById("ammoText");
  if(vr) vr.setAttribute('text', 'value: Ammo: ' + ammo_count + '; color: red; align: center; width: 2');
}

function updateHPDisplay(){
  let perc = Math.max(0, Math.min(1, playerHP / maxHP));
  let bar = document.getElementById('hpbar');
  let txt = document.getElementById('hptext');
  if(bar) bar.style.width = (perc * 100) + '%';
  if(txt) txt.innerText = 'HP: ' + Math.max(0, Math.floor(playerHP));
}

function spawnRocks() {
  new Rock(-5, 0.25, -5, "dodecahedron", 2);
  new Rock(5, 0, 10, "dodecahedron", 1);
  new Rock(2, 0.1, -15, "dodecahedron", 1);
  new Rock(-3, 0.25, 20, "dodecahedron", 1);

  new Rock(-20, -1, 5, "icosahedron", 10);
  new Rock(10, 2, -35, "icosahedron", 5);
  new Rock(-20, -1, 15, "icosahedron", 5);
  new Rock(15, -1, 5, "icosahedron", 15);

  new Rock(-50, 0, -35, "octahedron", 30);
  new Rock(50, 0, -25, "octahedron", 15);
  new Rock(-40, 0, 40, "octahedron", 15);
  new Rock(20, 0, 35, "octahedron", 20);

  new Rock(0, 0, -10, "tetrahedron", 5);
  new Rock(-10, 0, -20, "tetrahedron", 5);
  new Rock(20, 0, 10, "tetrahedron", 5);
  new Rock(-10, 0, 35, "tetrahedron", 5);

  // Clear some rocks within a central radius but keep a portion so area
  // still has obstacles. Uses a retention chance to preserve some rocks.
  try{
    const clearRadius = 10;
    const keepChance = 0.35; // chance to KEEP a rock inside the radius
    for(let i = rocks.length - 1; i >= 0; i--) {
      const r = rocks[i];
      if(!r || !r.obj) continue;
      const p = r.obj.object3D.position;
      const dist = Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z);
      if(dist < clearRadius) {
        // randomly keep some rocks so player still has obstacles
        if(Math.random() < keepChance) {
          continue; // keep this rock
        }
        try{ r.obj.remove(); }catch(e){}
        rocks.splice(i, 1);
      }
    }
  }catch(e){}
}

function createSkyObjects(){
  try{
    // Moon
    let moon = document.createElement('a-sphere');
    moon.setAttribute('radius', 6);
    moon.setAttribute('position', {x: 30, y: 40, z: -50});
    moon.setAttribute('color', '#fff7d9');
    moon.setAttribute('material', 'emissive: #fff7d9; emissiveIntensity: 1');
    scene.appendChild(moon);

    // Moon light
    let moonLight = document.createElement('a-entity');
    moonLight.setAttribute('light', 'type: point; intensity: 0.6; distance: 120; decay: 2; color: #ccdfff');
    moonLight.setAttribute('position', {x:30, y:40, z:-50});
    scene.appendChild(moonLight);

    // Stars
    const starCount = 150;
    for(let i=0;i<starCount;i++){
      let s = document.createElement('a-sphere');
      let r = 80 + Math.random()*60;
      // random point on upper hemisphere
      let theta = Math.random() * Math.PI * 2;
      let phi = Math.random() * Math.PI/2; // upper hemisphere
      let x = Math.cos(theta)*Math.sin(phi) * r;
      let y = Math.cos(phi) * r + 10; // lift up
      let z = Math.sin(theta)*Math.sin(phi) * r;
      s.setAttribute('radius', 0.08 + Math.random()*0.12);
      s.setAttribute('position', {x:x, y:y, z:z});
      s.setAttribute('color', '#ffffff');
      s.setAttribute('material', 'emissive: #ffffff; emissiveIntensity: 0.8');
      scene.appendChild(s);
    }
  }catch(e){console.warn(e)}
}

function spawnSpiders(count) {
  for(let i = 0; i < count; i++) {
    enemies.push(new Spider());
  }
}

function loop(){
  player.update();

  let playerPos = camera.object3D.position;
  if (playerHP <= 0) {
    document.getElementById('instruction').innerText = 'You Died - Refresh to try again';
    return; // stop updates
  }

  // Move enemies toward the player and handle damage on contact
  for (let ei = 0; ei < enemies.length; ei++) {
    let enemy = enemies[ei];
    if (!enemy || !enemy.obj) continue;
    let epos = enemy.obj.object3D.position;
    let dir = new THREE.Vector3();
    dir.subVectors(playerPos, epos);
    let distToPlayer = dir.length();
    dir.normalize();
    // enemy speed (slower)
    let speed = 0.008 + (0.004 * Math.random());
    // move enemy a bit toward player
    epos.x += dir.x * speed;
    epos.y += dir.y * speed * 0.2; // small vertical following
    epos.z += dir.z * speed;
    // rotate to face player (approx)
    try{
      enemy.obj.object3D.rotation.y = Math.atan2(playerPos.x - epos.x, playerPos.z - epos.z);
    }catch(e){}

    // damage when close, with cooldown
    if (distToPlayer < 2.0) {
      let now = Date.now();
      if (!enemy.lastAttack) enemy.lastAttack = 0;
      if (now - enemy.lastAttack > 1000) {
        enemy.lastAttack = now;
        playerHP -= 10;
        updateHPDisplay();
        if (playerHP <= 0) {
          playerHP = 0;
          updateHPDisplay();
          document.getElementById('instruction').innerText = 'You Died - Refresh to try again';
          return;
        }
      }
    }
  }
  for(let a = 0; a < ammo_boxes.length; a++) {
    let ammoPos = ammo_boxes[a].obj.object3D.position;
    let dist = Math.sqrt(Math.pow(playerPos.x - ammoPos.x, 2) + Math.pow(playerPos.y - ammoPos.y, 2) + Math.pow(playerPos.z - ammoPos.z, 2));
    if(dist < 2) {
      if(ammo_boxes[a].obj.parentElement) {
        ammo_boxes[a].obj.remove();
      }
      ammo_boxes.splice(a, 1);
      ammo_count += 5;
        updateAmmoDisplay();
      a--;
    }
  }
  

  for(let b = 0; b < bullets.length; b++) {
    let bullet = bullets[b];
    bullet.fire();
    
    if(Math.abs(bullet.obj.object3D.position.x) > 150 || 
       Math.abs(bullet.obj.object3D.position.z) > 150 ||
       bullet.obj.object3D.position.y < 0) {
      if(bullet.obj.parentElement) {
        bullet.obj.remove();
      }
      bullets.splice(b, 1);
      b--;
      continue;
    }

    for(let i = 0; i < enemies.length; i++) {
      let enemy = enemies[i];
      let box = new THREE.Box3().setFromObject(enemy.obj.object3D);
      let sphere = new THREE.Sphere();
      if (!box.isEmpty()) {
        box.getBoundingSphere(sphere);
      } else {
        sphere.center.copy(enemy.obj.object3D.position);
        sphere.radius = 1.5;
      }

      let bp = bullet.obj.object3D.position;
      let d = sphere.center.distanceTo(bp);
      let bulletRadius = 0.5;
      if (d < sphere.radius + bulletRadius) {
        enemy.remove();
        enemies.splice(i, 1);
        if(bullet.obj.parentElement) {
          bullet.obj.remove();
        }
        bullets.splice(b, 1);
        b--;
        enemy_killed++;
        updateScore();
        enemies.push(new Spider());
        break;
      }
    }
  }
 
  window.requestAnimationFrame(loop);
}

function countdown(){

  setTimeout(countdown,1000);
}

function distance(obj1,obj2){
  let x1 = obj1.object3D.position.x;
  let y1 = obj1.object3D.position.y;
  let z1 = obj1.object3D.position.z;
  let x2 = obj2.object3D.position.x;
  let y2 = obj2.object3D.position.y;
  let z2 = obj2.object3D.position.z;

  let d = Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2) + Math.pow(z1-z2,2));
  return d;
}

class Spider {
  constructor() {
    this.obj = document.createElement("a-entity");
    this.obj.setAttribute("position", {x: rnd(-70, 70), y: 0.3, z: rnd(-70, 70)});
    this.obj.setAttribute("rotation", {x: 0, y: rnd(0, 360), z: 0});
    this.obj.setAttribute("gltf-model", "#demoModel");
    this.obj.setAttribute("scale", "1.5 1.5 1.5");
    this.lastAttack = 0;
    scene.appendChild(this.obj);
    // add to rocks so player collision prevents walking through spiders
    try{
      if (typeof rocks !== 'undefined') rocks.push(this);
    }catch(e){}
  }
  
  remove() {
    // remove from rocks array if present
    try{
      if (typeof rocks !== 'undefined'){
        let idx = rocks.indexOf(this);
        if(idx > -1) rocks.splice(idx, 1);
      }
    }catch(e){}
    this.obj.remove();
  }
}