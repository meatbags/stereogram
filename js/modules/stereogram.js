/** Stereogram **/

import Blend from '../util/blend';
import Clamp from '../util/clamp';

class Stereogram {
  constructor() {
    // make tile
    this.cvsTile = document.querySelector('#canvas-tile');
    this.cvsTile.width = 100;
    this.cvsTile.height = 100;
    this.ctxTile = this.cvsTile.getContext('2d');
    this.ctxTile.fillStyle = '#fff';
    this.ctxTile.fillRect(0, 0, this.cvsTile.width, this.cvsTile.height);
    this.ctxTile.fillStyle = '#000';
    for (let x=0; x<this.cvsTile.width; x++) {
      for (let y=0; y<this.cvsTile.height; y++) {
        if (Math.random() > 0.5) {
          this.ctxTile.fillRect(x, y, 1, 1);
        }
      }
    }

    // make depth
    this.cvsDepthMap = document.querySelector('#canvas-depth-map');
    this.cvsDepthMap.width = 200;
    this.cvsDepthMap.height = 200;
    this.ctxDepthMap = this.cvsDepthMap.getContext('2d');
    this.ctxDepthMap.fillStyle = '#000';
    this.ctxDepthMap.fillRect(0, 0, this.cvsDepthMap.width, this.cvsDepthMap.height);
    this.ctxDepthMap.fillStyle = '#fff';
    this.ctxDepthMap.beginPath();
    this.ctxDepthMap.arc(100, 100, 50, 0, Math.PI*2);
    this.ctxDepthMap.fill();

    // make result
    this.cvsOutput = document.querySelector('#canvas-output');
    this.cvsOutput.width = 400;
    this.cvsOutput.height = 400;
    this.ctxOutput = this.cvsOutput.getContext('2d');

    // ui
    document.querySelector('#button-generate-image').onclick = () => {
      document.querySelector('#msg').innerText = 'Working...';
      setTimeout(() => { this._generateImage(); }, 50);
    };
    document.querySelector('#input-tile').onchange = () => {
      let file = document.querySelector('#input-tile').files[0];
      this.setCanvasImageFromFile(this.ctxTile, file);
    };
    document.querySelector('#input-depth-map').onchange = () => {
      let file = document.querySelector('#input-depth-map').files[0];
      this.setCanvasImageFromFile(this.ctxDepthMap, file);
    };

    // run algorithm
    this._generateImage();
  }

  _generateImage() {
    // set canvas size
    this.cvsOutput.width = parseInt(document.querySelector('#input-width').value);
    this.cvsOutput.height = parseInt(document.querySelector('#input-height').value);

    // set props from ui
    this.state = {};
    this.state.strips = parseInt(document.querySelector('#input-strips').value);
    this.state.tileWidth = this.cvsTile.width;
    this.state.tileHeight = this.cvsTile.height;
    this.state.depthStripWidth = this.cvsDepthMap.width / this.state.strips;
    this.state.outputStripWidth = this.cvsOutput.width / (this.state.strips + 1);
    this.state.depthScale = parseFloat(document.querySelector('#input-depth-scale').value);
    this.state.invert = document.querySelector('#input-invert').checked ? true : false;
    this.state.interpolation = document.querySelector('#input-interpolation').checked ? true : false;
    this.state.bubble = document.querySelector('#input-bubble').checked ? true : false;
    this.state.tilt = document.querySelector('#input-tilt').checked ? true : false;

    // get image data
    this.data = {};
    this.data.tile = this.ctxTile.getImageData(0, 0, this.cvsTile.width, this.cvsTile.height);
    this.data.depthMap = this.ctxDepthMap.getImageData(0, 0, this.cvsDepthMap.width, this.cvsDepthMap.height);
    this.data.output = this.ctxOutput.createImageData(this.cvsOutput.width, this.cvsOutput.height);

    // generate image
    this._process();

    // finished
    document.querySelector('#msg').innerText = '';
  }

  _process() {
    for (let x=0; x<this.cvsOutput.width; x++) {
      for (let y=0; y<this.cvsOutput.height; y++) {
        this._compute(x, y);
      }
    }

    // draw
    this.ctxOutput.putImageData(this.data.output, 0, 0);
  }

  _compute(x, y) {
    let pixel = null;

    // get initial tile coordinate
    if (x < this.state.outputStripWidth) {
      let nX = (x % this.state.outputStripWidth) / this.state.outputStripWidth;
      let tileX = nX * this.state.tileWidth;
      let tileY = y % this.state.tileHeight;
      pixel = this.getPixel(this.data.tile, tileX, tileY);

    // get previous strip value
    } else {
      // get depth
      let nX = (x - this.state.outputStripWidth) / (this.cvsOutput.width - this.state.outputStripWidth);
      let nY = y / this.cvsOutput.height;
      let depthMapX = nX * this.cvsDepthMap.width;
      let depthMapY = nY * this.cvsDepthMap.height;
      let depth = this.getDepth(this.getPixel(this.data.depthMap, depthMapX, depthMapY));
      if (this.state.invert) {
        depth = 1 - depth;
      }

      // compute x offset
      let xOffset = depth * this.state.depthScale;
      if (this.state.bubble) {
        xOffset *= Math.abs(Math.cos(nX * Math.PI)); // when nx=[0, 0.5, 1] offset=[+max, 0, +max]
      }
      if (this.state.tilt) {
        xOffset *= Math.cos(nX * Math.PI); // when nx=[0, 0.5, 1] offset=[+max, 0, -max]
      }

      // get previous strip
      pixel = this.getPixel(this.data.output, x - this.state.outputStripWidth + xOffset, y);
    }

    // put value
    if (pixel) {
      let index = (y * this.data.output.width + x) * 4;
      this.data.output.data[index + 0] = pixel[0];
      this.data.output.data[index + 1] = pixel[1];
      this.data.output.data[index + 2] = pixel[2];
      this.data.output.data[index + 3] = pixel[3];
    }
  }

  getDepth(pixel) {
    return (pixel[0] + pixel[1] + pixel[2]) / (255 * 3);
  }

  getPixel(data, x, y) {
    x = Clamp(x, 0, data.width);
    y = Clamp(y, 0, data.height);
    let sampX = Math.floor(x % data.width);
    let sampY = Math.floor(y % data.height);

    // no interpolation
    if (!this.state.interpolation || x - sampX == 0) {
      let index = (sampY * data.width + sampX) * 4;
      return [
        data.data[index + 0],
        data.data[index + 1],
        data.data[index + 2],
        data.data[index + 3],
      ];

    // linear interpolation
    } else {
      let pixelA = this.getPixel(data, sampX, sampY);
      let pixelB = this.getPixel(data, sampX + 1, sampY);
      let t = x - sampX;
      return [
        Blend(pixelA[0], pixelB[0], t),
        Blend(pixelA[1], pixelB[1], t),
        Blend(pixelA[2], pixelB[2], t),
        Blend(pixelA[3], pixelB[3], t)
      ];
    }
  }

  blend(a, b, t) {
    return a + (b - a) * t;
  }

  setCanvasImageFromFile(ctx, file) {
    var reader = new FileReader();
    reader.onload = evt => {
      let img = new Image();
      img.onload = () => {
        ctx.canvas.width = img.naturalWidth;
        ctx.canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
}

export default Stereogram;
