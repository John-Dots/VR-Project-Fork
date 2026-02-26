class Player{
  constructor(selector){
    this.obj = document.querySelector(selector);
    this.moveStrength = 0.2;
    this.pressed = [];

    this.driver = document.createElement("a-sphere");
    this.driver.setAttribute("opacity",0);
    this.driver.setAttribute("dynamic-body",{mass:20,angularDamping:0.5,linearDamping:0.01});
    this.driver.setAttribute("radius",0.5);

    this.driver.object3D.position.x = this.obj.object3D.position.x;
    this.driver.object3D.position.y = this.obj.object3D.position.y + 2.0;
    this.driver.object3D.position.z = this.obj.object3D.position.z;
    scene.append(this.driver);

    window.addEventListener("keyup",(e)=>{
      delete this.pressed[e.key];
    });
    window.addEventListener("keydown",(e)=>{
      this.pressed[e.key] = true;
    })
  }

  update(){
    this.processImpulses();  
    this.obj.object3D.position.x = this.driver.object3D.position.x;
    this.obj.object3D.position.y = this.driver.object3D.position.y;
    this.obj.object3D.position.z = this.driver.object3D.position.z;
    
  }
  processImpulses(){
    if(gameOver) return; // Don't process movement when game is over
    try{
      this.driver.setAttribute("dynamic-body",{mass:20,angularDamping:0.5,linearDamping:0.01});
      
      if(this.pressed["ArrowUp"] || this.pressed["w"] ){
        let theta = this.obj.object3D.rotation.y + Math.PI;
        this.updateDriverPosition(theta);
      }
      if(this.pressed["ArrowDown"] || this.pressed["s"] ){
        let theta = this.obj.object3D.rotation.y;
        this.updateDriverPosition(theta);
      }
      if(this.pressed["ArrowLeft"] || this.pressed["a"] ){
        let theta = this.obj.object3D.rotation.y - Math.PI / 2;
        this.updateDriverPosition(theta);
      }
      if(this.pressed["ArrowRight"] || this.pressed["d"] ){
        let theta = this.obj.object3D.rotation.y + Math.PI / 2;
        this.updateDriverPosition(theta);
      }

      
    }catch{}
  }
  updateDriverPosition(theta){
    let dz = this.moveStrength * Math.cos(theta);
    let dx = this.moveStrength * Math.sin(theta);
    let newZ = this.driver.object3D.position.z + dz;
    let newX = this.driver.object3D.position.x + dx;
    let newY = this.driver.object3D.position.y;
    
    try {
      // allow temporary pass-through after being hit to prevent pinning
      if (!(window.playerCollisionDisabledUntil && Date.now() < window.playerCollisionDisabledUntil)){
        const driverRadius = 0.5;
        const sphere = new THREE.Sphere(new THREE.Vector3(newX, newY, newZ), driverRadius);
        if (typeof rocks !== 'undefined') {
          for (let i = 0; i < rocks.length; i++) {
            const r = rocks[i];
            if (!r || !r.obj) continue;
            const box = new THREE.Box3().setFromObject(r.obj.object3D);
            if (!box.isEmpty() && box.intersectsSphere(sphere)) {
              return;
            }
          }
        }
      }
    } catch(e){}
    this.driver.object3D.position.z = newZ;
    this.driver.object3D.position.x = newX;
    this.driver.components["dynamic-body"].syncToPhysics();
  }
}