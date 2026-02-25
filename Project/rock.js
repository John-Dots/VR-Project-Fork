
class Rock {
  constructor(x, y, z, shape = "box", size = 1) {
    this.obj = document.createElement(`a-${shape}`);
    this.obj.setAttribute("static-body", "shape: auto");
    this.obj.setAttribute("color", "gray");
    this.obj.setAttribute("src", "#rock");
    // Occasionally make smaller rocks larger/taller for variety
    try{
      if(size < 4 && Math.random() < 0.45){
        const mul = 1.1 + Math.random()*0.6; // smaller multiplier (1.1 - 1.7)
        size = Math.max(1, Math.floor(size * mul));
        // raise some height but less so
        y = y + (size * 0.2);
      }
    }catch(e){}

    // clamp maximum size so rocks don't get too huge
    size = Math.min(size, 10);

    if (shape === "box") {
      this.obj.setAttribute("width", size);
      this.obj.setAttribute("height", Math.max(1, size * 1.1));
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
