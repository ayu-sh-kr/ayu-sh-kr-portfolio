/**
 * Original woodland artwork sampled into colored characters by the article
 * canvas. Geometry uses a 600-unit square; no photographs or remote assets
 * are involved. Keep this painter independent of component lifecycle.
 */
export class AsciiWoodland {
  /** Draws a filled, rotated oval for plumage, leaves and meadow layers. */
  private oval(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string | CanvasGradient, angle = 0): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  /** Paints individually overlapping flight feathers around an articulated wing. */
  private wing(ctx: CanvasRenderingContext2D, beat: number, far: boolean): void {
    ctx.save();
    ctx.translate(-12, 0);
    ctx.rotate(-0.5 + beat * 0.85 + (far ? 0.35 : 0));
    ctx.scale(far ? 0.72 : 1, 0.55 + Math.abs(beat) * 0.45);
    for (let i = 0; i < 11; i++) {
      const angle = -2.05 + i * 0.09;
      const length = 70 + i * 7;
      ctx.save();
      ctx.rotate(angle);
      const shade = ctx.createLinearGradient(0, -8, length, 8);
      shade.addColorStop(0, far ? '#155f70' : '#16858a');
      shade.addColorStop(0.55, ['#37baae', '#42b6bc', '#8fb5d9'][i % 3]);
      shade.addColorStop(1, far ? '#36537d' : '#779ab7');
      this.oval(ctx, length * 0.47, 0, length * 0.53, 9 - i * 0.25, shade);
      ctx.strokeStyle = '#204d65';
      ctx.lineWidth = 1.5;
      ctx.beginPath();ctx.moveTo(12, 0);ctx.lineTo(length * 0.94, 0);ctx.stroke();
      ctx.restore();
    }
    this.oval(ctx, -2, -29, 26, 49, '#36b2a0', -0.3);
    ctx.restore();
  }

  /** Builds a hummingbird with separate primaries, iridescent throat, eye and tail. */
  private bird(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, phase: number, facing = 1, perched = false): void {
    ctx.save();ctx.translate(x, y);ctx.scale(scale * facing, scale);
    const beat = Math.sin(phase);
    if (!perched) this.wing(ctx, -beat * 0.8, true);
    for (let i = 0; i < 5; i++) {
      this.oval(ctx, -66 - i * 3, 38 + i * 4, 54 + i * 2, 6, ['#164861', '#247889', '#34acaa', '#5baf8e', '#8bd2b1'][i], -0.58 + i * 0.05);
    }
    const back = ctx.createLinearGradient(-30, -22, 15, 42);
    back.addColorStop(0, '#a7ead0');back.addColorStop(0.35, '#39bfa6');back.addColorStop(1, '#165169');
    this.oval(ctx, -12, 14, 58, 30, back, -0.42);
    this.oval(ctx, 20, 18, 23, 30, '#e1d6aa', -0.35);
    this.oval(ctx, 34, 6, 22, 24, '#db596d', -0.4);
    this.oval(ctx, 38, -19, 25, 23, '#51cdb4', -0.15);
    this.oval(ctx, 31, -25, 17, 9, '#b4e4c6', -0.2);
    // The long beak has a slight taper and remains joined to the head.
    ctx.fillStyle = '#d9c3a0';ctx.beginPath();ctx.moveTo(57,-18);ctx.lineTo(119,-23);ctx.lineTo(58,-12);ctx.closePath();ctx.fill();
    this.oval(ctx, 46, -19, 5.4, 5.4, '#09212c');
    this.oval(ctx, 47, -21, 1.6, 1.6, '#f8edcd');
    for (let i = 0; i < 24; i++) {
      const u = i % 6, v = Math.floor(i / 6);
      this.oval(ctx, -38 + u * 11 + v * 3, 3 + v * 7, 4.8, 1.1, i % 3 ? '#208b91' : '#a0e0c1', -0.3);
    }
    if (perched) {
      this.oval(ctx, -19, 13, 37, 16, '#2d8b98', -0.3);
      ctx.strokeStyle = '#cca574';ctx.lineWidth = 2.5;
      ctx.beginPath();ctx.moveTo(7,40);ctx.lineTo(5,53);ctx.lineTo(15,54);ctx.moveTo(18,36);ctx.lineTo(20,51);ctx.lineTo(30,53);ctx.stroke();
    } else this.wing(ctx, beat, false);
    ctx.restore();
  }

  /** Draws a branching acacia with layered leaf clusters and a visible warm trunk. */
  private tree(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.strokeStyle = '#ad8258';ctx.lineCap = 'round';
    const branches = [[88,465,97,356,80,293,64,259],[94,370,134,321,162,300,192,294],[86,323,48,303,28,278,17,266],[91,348,109,292,126,261,143,245],[98,392,151,358,180,353,209,342]];
    branches.forEach((b, i) => {
      ctx.lineWidth = i ? 7 - i : 16;
      ctx.beginPath();ctx.moveTo(b[0],b[1]);ctx.bezierCurveTo(b[2],b[3],b[4],b[5],b[6],b[7]);ctx.stroke();
    });
    ctx.lineWidth = 3;ctx.beginPath();ctx.moveTo(174,353);ctx.quadraticCurveTo(218,369,275,361);ctx.stroke();
    ctx.strokeStyle = '#e0b677';ctx.lineWidth = 2;
    ctx.beginPath();ctx.moveTo(86,452);ctx.quadraticCurveTo(104,359,78,303);ctx.stroke();
    const clusters = [[25,268,38,21],[66,249,49,27],[116,252,48,25],[151,236,42,23],[183,289,42,22],[138,303,43,22],[49,294,34,19],[188,341,39,20],[145,351,31,18]];
    clusters.forEach(([x,y,rx,ry], k) => {
      const sway = Math.sin(time * 0.6 + k) * 2;
      for (let i=0;i<55;i++) {
        const a=i*2.39996, r=Math.sqrt((i+0.5)/55);
        const px=x+Math.cos(a)*rx*r+sway, py=y+Math.sin(a)*ry*r;
        this.oval(ctx,px,py,5+(i%4),2.5+(i%3),['#236b5a','#3c9c69','#7cb774','#b0d58b','#558c51'][i%5],-0.4+Math.sin(a));
      }
    });
  }

  /** Composes depth from distant meadow to birds and foreground stems for one time. */
  paint(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.clearRect(0,0,600,600);
    this.oval(ctx,90,91,39,39,'#ba98604a');
    this.oval(ctx,90,91,29,29,'#edcc805a');
    for(let i=0;i<38;i++) {
      const x=(i*127.7)%580+10, y=(i*79.3)%360+20;
      this.oval(ctx,x+Math.sin(time*0.35+i)*4,y+Math.cos(time*0.4+i)*3,0.9,0.9,i%2?'#91c7b9':'#e8c788');
    }
    this.oval(ctx,390,514,410,117,'#183f404a');
    this.oval(ctx,100,565,420,132,'#285d494d');
    this.oval(ctx,470,618,420,137,'#36765055');
    this.tree(ctx,time);
    this.bird(ctx,390,245+Math.sin(time*1.4)*7,1.05,time*7);
    this.bird(ctx,306+Math.sin(time*0.5)*10,112+Math.sin(time)*5,0.47,time*7+2,-1);
    this.bird(ctx,252,327,0.64,0,1,true);
    for(let i=0;i<410;i++) {
      const x=(i*41.77)%600;
      const y=434+(i*17.31)%166;
      const length=16+(i*3.7)%57;
      const sway=Math.sin(time*1.1+x*0.02)*5;
      ctx.strokeStyle=['#79a568','#b4cb7d','#427c59','#559667','#8dba72'][i%5];
      ctx.lineWidth=1.4+(i%3)*0.35;
      ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-4+sway,y-length*0.5,x-7+sway,y-length);ctx.stroke();
      if(i%17===0) {
        const flower=['#f5cb76','#ea8e91','#a499e2'][i%3];
        for(let p=0;p<5;p++)this.oval(ctx,x-7+sway+Math.cos(p*1.256)*3,y-length+Math.sin(p*1.256)*3,2.8,2.8,flower);
        this.oval(ctx,x-7+sway,y-length,1.7,1.7,'#efd691');
      }
    }
  }
}
