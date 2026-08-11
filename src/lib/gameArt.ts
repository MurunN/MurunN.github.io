export type MountedHorseVariant = "relay" | "archery";

export type MountedHorseOptions = {
  x: number;
  y: number;
  scale?: number;
  phase?: number;
  bodyColor: string;
  accentColor?: string;
  tackColor?: string;
  maneColor?: string;
  riderColor?: string;
  riderTrim?: string;
  shadowAlpha?: number;
  variant?: MountedHorseVariant;
  bowDraw?: number;
  facing?: 1 | -1;
};

export function drawMountedHorse(
  ctx: CanvasRenderingContext2D,
  {
    x,
    y,
    scale = 1,
    phase = 0,
    bodyColor,
    accentColor = "#b78853",
    tackColor = "#55341d",
    maneColor = "#2c211b",
    riderColor = "#20473d",
    riderTrim = "#d8bc82",
    shadowAlpha = 0.18,
    variant = "relay",
    bowDraw = 0.5,
    facing = 1
  }: MountedHorseOptions
) {
  const legA = Math.sin(phase);
  const legB = Math.sin(phase + Math.PI);
  const bob = Math.sin(phase * 2) * 2.8;

  const bodyGradient = ctx.createLinearGradient(-90, -24, 92, 34);
  bodyGradient.addColorStop(0, lighten(bodyColor, 0.18));
  bodyGradient.addColorStop(0.45, bodyColor);
  bodyGradient.addColorStop(1, darken(bodyColor, 0.22));

  const neckGradient = ctx.createLinearGradient(26, -74, 88, -8);
  neckGradient.addColorStop(0, lighten(bodyColor, 0.14));
  neckGradient.addColorStop(1, darken(bodyColor, 0.18));

  const riderGradient = ctx.createLinearGradient(-8, -82, 42, -8);
  riderGradient.addColorStop(0, lighten(riderColor, 0.12));
  riderGradient.addColorStop(1, darken(riderColor, 0.15));

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(scale * facing, scale);

  // shadow
  ctx.fillStyle = `rgba(15, 16, 14, ${shadowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(4, 58, 124, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // tail behind body
  ctx.strokeStyle = maneColor;
  ctx.lineCap = "round";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(-86, -2);
  ctx.quadraticCurveTo(-126, -28 - legA * 8, -124, 18 + legB * 5);
  ctx.quadraticCurveTo(-120, 34, -108, 30);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-90, 0);
  ctx.quadraticCurveTo(-120, -18, -120, 24);
  ctx.stroke();

  // hind legs
  drawLeg(ctx, -48, 8, -10 + legB * 5, 34, -4 + legB * 8, 70, tackColor);
  drawLeg(ctx, -18, 12, -20 - legB * 4, 40, -16 - legB * 2, 72, darken(tackColor, 0.12));
  // fore legs
  drawLeg(ctx, 34, 8, 20 + legA * 10, 38, 24 + legA * 12, 74, darken(tackColor, 0.08));
  drawLeg(ctx, 58, 10, 54 - legA * 6, 36, 58 - legA * 8, 72, tackColor);

  // body
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.moveTo(-96, 0);
  ctx.quadraticCurveTo(-76, -30, -28, -34);
  ctx.quadraticCurveTo(18, -42, 58, -26);
  ctx.quadraticCurveTo(86, -18, 94, 0);
  ctx.quadraticCurveTo(88, 16, 54, 24);
  ctx.quadraticCurveTo(16, 34, -44, 28);
  ctx.quadraticCurveTo(-84, 22, -96, 0);
  ctx.closePath();
  ctx.fill();

  // belly highlight
  ctx.fillStyle = `rgba(255,255,255,0.10)`;
  ctx.beginPath();
  ctx.ellipse(-6, 8, 48, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // neck and head
  ctx.fillStyle = neckGradient;
  ctx.beginPath();
  ctx.moveTo(26, -18);
  ctx.quadraticCurveTo(40, -58, 60, -72);
  ctx.quadraticCurveTo(80, -86, 94, -72);
  ctx.lineTo(102, -54);
  ctx.quadraticCurveTo(84, -32, 66, -16);
  ctx.lineTo(46, -6);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(110, -48, 28, 18, -0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = darken(bodyColor, 0.26);
  ctx.beginPath();
  ctx.ellipse(126, -42, 10, 7, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#241b17";
  ctx.beginPath();
  ctx.arc(118, -54, 2.4, 0, Math.PI * 2);
  ctx.fill();

  // ears
  ctx.fillStyle = darken(bodyColor, 0.16);
  ctx.beginPath();
  ctx.moveTo(95, -70); ctx.lineTo(98, -88); ctx.lineTo(107, -70); ctx.closePath();
  ctx.moveTo(109, -70); ctx.lineTo(113, -88); ctx.lineTo(121, -70); ctx.closePath();
  ctx.fill();

  // mane
  ctx.strokeStyle = maneColor;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(48, -18);
  ctx.quadraticCurveTo(36, -40, 54, -70);
  ctx.quadraticCurveTo(58, -80, 74, -84);
  ctx.stroke();
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(48 + i * 4, -20 - i * 5);
    ctx.quadraticCurveTo(40 + i * 4, -36 - i * 4, 52 + i * 6, -58 - i * 2);
    ctx.stroke();
  }

  // tack and saddle
  ctx.fillStyle = accentColor;
  roundRect(ctx, -10, -22, 62, 18, 7); ctx.fill();
  ctx.fillStyle = tackColor;
  roundRect(ctx, 0, -18, 52, 12, 6); ctx.fill();
  ctx.strokeStyle = lighten(tackColor, 0.18);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(24, -22); ctx.lineTo(10, 20);
  ctx.moveTo(34, -22); ctx.lineTo(52, 14);
  ctx.moveTo(18, -10); ctx.lineTo(112, -48);
  ctx.stroke();

  // chest strap and bridle
  ctx.strokeStyle = tackColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(44, -4); ctx.quadraticCurveTo(68, 12, 82, 18);
  ctx.moveTo(88, -52); ctx.lineTo(122, -46);
  ctx.moveTo(104, -64); ctx.lineTo(116, -30);
  ctx.stroke();

  // rider lower body
  ctx.fillStyle = riderGradient;
  ctx.beginPath();
  ctx.moveTo(6, -16);
  ctx.quadraticCurveTo(18, -36, 36, -32);
  ctx.quadraticCurveTo(46, -24, 44, -6);
  ctx.lineTo(8, -6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = darken(riderColor, 0.18);
  ctx.beginPath();
  ctx.moveTo(8, -2); ctx.lineTo(30, 14); ctx.lineTo(22, 22); ctx.lineTo(0, 7); ctx.closePath();
  ctx.moveTo(28, -4); ctx.lineTo(52, 18); ctx.lineTo(44, 24); ctx.lineTo(22, 7); ctx.closePath();
  ctx.fill();

  // rider torso and head
  ctx.fillStyle = riderGradient;
  ctx.beginPath();
  ctx.moveTo(-4, -54);
  ctx.quadraticCurveTo(12, -78, 34, -72);
  ctx.quadraticCurveTo(48, -66, 46, -36);
  ctx.lineTo(18, -22);
  ctx.quadraticCurveTo(0, -30, -4, -54);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = riderTrim;
  ctx.fillRect(8, -52, 6, 24);

  ctx.fillStyle = "#c89869";
  ctx.beginPath(); ctx.arc(18, -82, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#2b2e33";
  ctx.beginPath();
  ctx.moveTo(6, -84); ctx.quadraticCurveTo(16, -100, 29, -88); ctx.lineTo(28, -74); ctx.lineTo(7, -74); ctx.closePath();
  ctx.fill();

  // arms and props
  ctx.strokeStyle = darken(riderColor, 0.2);
  ctx.lineCap = "round";
  ctx.lineWidth = 5;
  if (variant === "relay") {
    ctx.beginPath();
    ctx.moveTo(24, -48); ctx.lineTo(52, -34); ctx.lineTo(86, -42);
    ctx.moveTo(10, -46); ctx.lineTo(-4, -18);
    ctx.stroke();

    // satchel
    ctx.fillStyle = "#7b542d";
    roundRect(ctx, -8, -6, 24, 18, 5); ctx.fill();
    ctx.strokeStyle = "#d6bf8b";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(10, 12); ctx.stroke();
  } else {
    const draw = Math.max(0.15, Math.min(1, bowDraw));
    ctx.beginPath();
    ctx.moveTo(20, -52); ctx.lineTo(54, -52);
    ctx.moveTo(12, -50); ctx.lineTo(-14 - draw * 26, -40 - draw * 6);
    ctx.stroke();

    ctx.strokeStyle = "#7d5528";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(58, -68);
    ctx.quadraticCurveTo(82, -50, 60, -28);
    ctx.stroke();
    ctx.strokeStyle = "#eadcb8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, -68); ctx.lineTo(58 - draw * 16, -28);
    ctx.stroke();

    // quiver
    ctx.fillStyle = "#5e3b20";
    roundRect(ctx, -18, -56, 12, 28, 4); ctx.fill();
    ctx.strokeStyle = "#d7c49b";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-12 + i * 3, -58); ctx.lineTo(-12 + i * 3, -72);
      ctx.stroke();
    }
  }

  // subtle highlight on body
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-54, -8);
  ctx.quadraticCurveTo(-4, -28, 54, -14);
  ctx.stroke();

  ctx.restore();
}

function drawLeg(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  kx: number,
  ky: number,
  x2: number,
  y2: number,
  color: string
) {
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(kx, ky);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 + 8, y2 + 8);
  ctx.stroke();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function lighten(hex: string, amount: number) {
  return mix(hex, "#ffffff", amount);
}

function darken(hex: string, amount: number) {
  return mix(hex, "#000000", amount);
}

function mix(a: string, b: string, amount: number) {
  const pa = parseColor(a);
  const pb = parseColor(b);
  const t = Math.max(0, Math.min(1, amount));
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function parseColor(input: string): [number, number, number] {
  const hex = input.replace("#", "");
  const normalized = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const value = Number.parseInt(normalized, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}
