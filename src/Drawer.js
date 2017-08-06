import { mat3, vec2 } from './gl-matrix/gl-matrix';

let Drawer = (function () {
  const PADDING = 10;
  const COLORS = [
    '#f00',
    '#0f0',
    '#00f',
    '#ff0',
    '#f0f',
    '#0ff',
    '#f55',
    '#5f5',
    '#55f',
    '#ff5',
    '#f5f',
    '#5ff',
    '#faa',
    '#afa',
    '#aaf',
    '#faf',
  ];
  const DEFAULT_COLOR = '#404040';
  const LAMBDA_COLOR = '#f00';
  const SITE_RADIUS = 3;
  const LAMBDA_RADIUS = 5;

  let ctx;
  let scale;
  let posMat;

  function init(canvas) {
    ctx = canvas.getContext('2d');
  }

  function setCam(sites) {
    let minX = 9e5, minY = 9e5;
    let maxX = 0, maxY = 0;
    Object.keys(sites).forEach(id => {
      let site = sites[id];
      minX = Math.min(site['x'], minX);
      minY = Math.min(site['y'], minY);
      maxX = Math.max(site['x'], maxX);
      maxY = Math.max(site['y'], maxY);
    });

    posMat = mat3.create();
    mat3.fromTranslation(posMat, vec2.fromValues(-minX, -minY));

    let w = ctx.canvas.width - PADDING * 2;
    let h = ctx.canvas.height - PADDING * 2;
    let xScale = w / (maxX - minX);
    let yScale = h / (maxY - minY);
    scale = Math.min(xScale, yScale);
  }

  function transform(x, y) {
    let v = vec2.transformMat3(vec2.create(), vec2.fromValues(x, y), posMat);
    v = vec2.scale(vec2.create(), v, scale);
    v = vec2.add(vec2.create(), v, vec2.fromValues(PADDING, PADDING));

    return v;
  }

  function drawSites(sites) {
    Object.keys(sites).forEach(id => {
      let site = sites[id];
      let v = transform(site['x'], site['y']);

      sites[id]['x'] = v[0];
      sites[id]['y'] = v[1];

      ctx.beginPath();
      ctx.arc(v[0], v[1], SITE_RADIUS, 0, 2 * Math.PI, false);
      ctx.fillStyle = DEFAULT_COLOR;
      ctx.fill();
      ctx.closePath();
    });
  }

  function drawRivers(map) {
    for (let river of map['rivers']) {
      let s = river['source'];
      let t = river['target'];
      let key = [Math.min(s, t), Math.max(s, t)].join(':');

      let color = map['color'] && map['color'][key] !== undefined ? map['color'][key] : -1;

      ctx.beginPath();
      ctx.lineWidth = color === -1 ? 1 : 3;
      ctx.strokeStyle = color === -1 ? DEFAULT_COLOR : COLORS[color];
      ctx.moveTo(map['sites'][s]['x'], map['sites'][s]['y']);
      ctx.lineTo(map['sites'][t]['x'], map['sites'][t]['y']);
      ctx.stroke();
      ctx.closePath();
    }
  }

  function drawMines(map) {
    for (let mine of map['mines']) {
      let m = map['sites'][mine];

      ctx.beginPath();
      ctx.arc(m['x'], m['y'], LAMBDA_RADIUS, 0, 2 * Math.PI, false);
      ctx.fillStyle = LAMBDA_COLOR;
      ctx.fill();
      ctx.closePath();
    }
  }

  function draw(map) {
    setCam(map['sites']);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    drawSites(map['sites']);
    drawRivers(map);
    drawMines(map);
  }

  return {
    init: init,
    draw: draw,
  }
}());

export default Drawer;