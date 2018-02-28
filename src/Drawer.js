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

  function setCam(width, height) {
    posMat = mat3.create();
    mat3.fromTranslation(posMat, vec2.fromValues(0, 0));

    let xScale = ctx.canvas.width / width;
    let yScale = ctx.canvas.height / height;
    console.log(ctx.canvas.width, width, ctx.canvas.height, height, xScale, yScale);
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

  function drawRect(x, y, color) {
    const v = transform(x, y);

    ctx.fillStyle = color;
    ctx.fillRect(v[0], v[1], scale, scale);
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

  function ifWallBetween(rx, ry, px, py, field) {

    let min_x = Math.min(rx, px);
    let max_x = Math.max(rx, px);
    let min_y = Math.min(ry, py);
    let max_y = Math.max(ry, py);

    for (let x = min_x; x <= max_x; x++) {
        for (let y = min_y; y <= max_y; y++) {
            if (field[y][x] === '#') {
                return true;
            }
        }
    }
    return false;
}

  function draw(input, output) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    setCam(input.width, input.height);
    let field = [];
    for (let i = 0; i < input.height; i++) {
      field.push(new Array(input.width));
    }

    for (let p of input['#']) {
      field[p.y][p.x] = '#';
      drawRect(p.x, p.y, 'rgba(0, 0, 0, 0.9)');
    }
    for (let p of input['.']) {
      field[p.y][p.x] = '.';
      drawRect(p.x, p.y, '#fff');
    }
    for (let p of input['-']) {
      field[p.y][p.x] = '-';
      drawRect(p.x, p.y, '#444');
    }

    for (let p of output.b) {
      drawRect(p.x, p.y, 'rgba(0, 0, 255, 0.5)');
    }
    for (let p of output.r) {
      for (let x = p.x - input.radius; x <= p.x + input.radius; x++) {
        if (x < 0 || x >= input.width) continue;

        for (let y = p.y - input.radius; y <= p.y + input.radius; y++) {
          if (y < 0 || y >= input.height) continue;
          if (! ifWallBetween(x, y, p.x, p.y, field)) {
            drawRect(x, y, 'rgba(0, 255, 0, 0.2)');
          }
        }
      }
    }
  }

  return {
    init: init,
    draw: draw,
  }
}());

export default Drawer;