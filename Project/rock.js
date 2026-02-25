
class Rock {
  constructor(x, y, z, shape = "box", size = 1) {
    this.obj = document.createElement(`a-${shape}`);
    this.obj.setAttribute("static-body", "shape: auto");
    this.obj.setAttribute("color", "gray");
    this.obj.setAttribute("src", "#rock");
    // Occasionally make smaller rocks larger/taller for variety
    try{
      if(size < 4 && Math.random() < 0.45){
        const mul = 1.4 + Math.random()*1.4; // scale multiplier
        size = Math.max(1, Math.floor(size * mul));
        // raise some height so taller rocks look natural
        y = y + (size * 0.35);
      }
    }catch(e){}

    if (shape === "box") {
      this.obj.setAttribute("width", size);
      this.obj.setAttribute("height", size * 1.2);
      this.obj.setAttribute("depth", size);
    } else if (shape === "sphere" || shape === "dodecahedron" || shape === "icosahedron" || shape === "octahedron" || shape === "tetrahedron") {
      this.obj.setAttribute("radius", size);
    }

    this.obj.setAttribute("position", {x: x, y: y, z: z});
    scene.appendChild(this.obj);
    if(typeof rocks === 'undefined') rocks = [];
    rocks.push(this);
  }
}
