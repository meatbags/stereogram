/** Stereogram **/

import Blend from '../util/blend';
import Clamp from '../util/clamp';
import Easing from '../util/easing';
import Wrap from '../util/wrap';

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
    this.el = {};
    this.el.buttonGenerateImage = document.querySelector('#button-generate-image');
    this.el.buttonGenerateImageMessage = document.querySelector('#button-generate-image-message');
    this.el.fileInputTileImage = document.querySelector('#input-tile');
    this.el.fileInputDepthMapImage = document.querySelector('#input-depth-map');
    this.el.dropContainerTileImage = document.querySelector('#drop-input-tile');
    this.el.dropContainerDepthMapImage = document.querySelector('#drop-input-depth-map');
    this.el.buttonDimensionsAuto = document.querySelector('#button-dimensions-auto');
    this.el.inputWidth = document.querySelector('#input-width');
    this.el.inputHeight = document.querySelector('#input-height');
    this.el.inputStrips = document.querySelector('#input-strips');
    this.el.inputDepthScale = document.querySelector('#input-depth-scale');
    this.el.inputScaleDimensions = document.querySelector('#input-scale-dimensions');
    this.el.buttonScaleDimensions = document.querySelector('#button-scale-apply');
    this.el.selectInterpolation = document.querySelector('#input-interpolation');
    this.el.selectDepthModel = document.querySelector('#input-depth-model');
    this.el.depthMapOverlay = document.querySelector('#depth-map-overlay');
    this.el.checkboxInvert = document.querySelector('#input-invert');
    this.el.checkboxPreserveTileRatio = document.querySelector('#input-preserve-tile-ratio');

    // bind ui
    this.el.buttonGenerateImage.onclick = () => {
      this.el.buttonGenerateImageMessage.innerText = 'Working...';
      setTimeout(() => {
        this.generateImage();
      }, 50);
    };
    this.el.fileInputTileImage.onchange = () => {
      let file = this.el.fileInputTileImage.files[0];
      this.setCanvasImageFromFile(this.ctxTile, file);
    };
    this.el.fileInputDepthMapImage.onchange = () => {
      let file = this.el.fileInputDepthMapImage.files[0];
      this.setCanvasImageFromFile(this.ctxDepthMap, file);
    };
    this.el.dropContainerTileImage.ondragover = this.el.dropContainerTileImage.ondragenter = evt => {
      evt.preventDefault();
      this.el.dropContainerTileImage.classList.add('drag-over');
    };
    this.el.dropContainerTileImage.onmouseleave = this.el.dropContainerTileImage.onmouseup = () => {
      this.el.dropContainerTileImage.classList.remove('drag-over');
    };
    this.el.dropContainerTileImage.ondrop = evt => {
      evt.preventDefault();
      if (evt.dataTransfer.items) {
        let file = evt.dataTransfer.items[0].getAsFile();
        this.setCanvasImageFromFile(this.ctxTile, file);
      }
    };
    this.el.dropContainerDepthMapImage.ondragover = this.el.dropContainerDepthMapImage.ondragenter = evt => {
      evt.preventDefault();
      this.el.dropContainerDepthMapImage.classList.add('drag-over');
    };
    this.el.dropContainerDepthMapImage.onmouseleave = this.el.dropContainerDepthMapImage.onmouseup = () => {
      this.el.dropContainerDepthMapImage.classList.remove('drag-over');
    };
    this.el.dropContainerDepthMapImage.ondrop = evt => {
      evt.preventDefault();
      if (evt.dataTransfer.items) {
        let file = evt.dataTransfer.items[0].getAsFile();
        this.setCanvasImageFromFile(this.ctxDepthMap, file);
      }
    };
    this.el.buttonDimensionsAuto.onclick = () => {
      let n = parseInt(this.el.inputStrips.value);
      let width = (n + 1) * this.cvsTile.width;
      let ratio = this.cvsDepthMap.height / this.cvsDepthMap.width;
      let height = Math.round((n * this.cvsTile.width) * ratio);
      this.el.inputWidth.value = width;
      this.el.inputHeight.value = height;
    };
    this.el.buttonScaleDimensions.onclick = () => {
      let width = parseInt(this.el.inputWidth.value);
      let height = parseInt(this.el.inputHeight.value);
      let scale = parseFloat(this.el.inputScaleDimensions.value);
      this.el.inputWidth.value = width * scale;
      this.el.inputHeight.value = height * scale;
    };
    this.el.inputStrips.onchange = () => {
      this.updateDepthMapOverlay();
    };

    // set up
    this.updateDepthMapOverlay();

    // run
    this.generateImage();
  }

  generateImage() {
    // set canvas size
    this.cvsOutput.width = parseInt(this.el.inputWidth.value);
    this.cvsOutput.height = parseInt(this.el.inputHeight.value);

    // set props from ui
    this.state = {};
    this.state.strips = parseInt(this.el.inputStrips.value);
    this.state.tileWidth = this.cvsTile.width;
    this.state.tileHeight = this.cvsTile.height;
    this.state.tileRatio = this.state.tileHeight / this.state.tileWidth;
    this.state.depthStripWidth = this.cvsDepthMap.width / this.state.strips;
    this.state.outputStripWidth = this.cvsOutput.width / (this.state.strips + 1);
    this.state.depthScale = parseFloat(this.el.inputDepthScale.value);
    this.state.invert = this.el.checkboxInvert.checked ? true : false;
    this.state.preserveTileRatio = this.el.checkboxPreserveTileRatio.checked ? true : false;
    this.state.depthModel = this.el.selectDepthModel.value;
    this.state.interpolation = this.el.selectInterpolation.value;

    // get image data
    this.data = {};
    this.data.tile = this.ctxTile.getImageData(0, 0, this.cvsTile.width, this.cvsTile.height);
    this.data.depthMap = this.ctxDepthMap.getImageData(0, 0, this.cvsDepthMap.width, this.cvsDepthMap.height);
    this.data.output = this.ctxOutput.createImageData(this.cvsOutput.width, this.cvsOutput.height);

    // generate image
    for (let x=0; x<this.cvsOutput.width; x++) {
      for (let y=0; y<this.cvsOutput.height; y++) {
        this.compute(x, y);
      }
    }

    // draw
    this.ctxOutput.putImageData(this.data.output, 0, 0);

    // finished
    this.el.buttonGenerateImageMessage.innerText = '';
  }

  compute(x, y) {
    let pixel = null;

    // get initial tile coordinate
    if (x < this.state.outputStripWidth) {
      let nX = (x % this.state.outputStripWidth) / this.state.outputStripWidth;
      let tileX = nX * this.state.tileWidth;
      let tileY = y % this.state.tileHeight;
      if (this.state.preserveTileRatio) {
        let relHeight = this.state.outputStripWidth * this.state.tileRatio;
        let nY = (y % relHeight) / relHeight;
        tileY = nY * this.state.tileHeight;
      }
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
    let d = (pixel[0] + pixel[1] + pixel[2]) / (255 * 3);
    switch (this.state.depthModel) {
      case 'linear': return d; break;
      case 'quadratic': return Easing.quadratic(d); break;
      case 'cubic': return Easing.cubic(d); break;
      default: return d;
    }
  }

  getPixel(data, x, y) {
    x = Clamp(x, 0, data.width);
    y = Clamp(y, 0, data.height);
    let sampX = Math.floor(x % data.width);
    let sampY = Math.floor(y % data.height);

    // no interpolation
    if (this.state.interpolation == 'none' || (x - sampX == 0 && y - sampY == 0)) {
      let index = (sampY * data.width + sampX) * 4;
      return [
        data.data[index + 0],
        data.data[index + 1],
        data.data[index + 2],
        data.data[index + 3],
      ];

    // interpolation
    } else {
      let tx = x - sampX;
      let ty = y - sampY;
      switch (this.state.interpolation) {
        case 'nearest-neighbour': {
          let offX = tx < 0.5 ? 0 : 1;
          let offY = ty < 0.5 ? 0 : 1;
          return this.getPixel(data, sampX + offX, sampY + offY);
          break;
        }
        case 'bilinear': {
          let TL = this.getPixel(data, sampX, sampY);
          let TR = this.getPixel(data, sampX + 1, sampY);
          let BL = this.getPixel(data, sampX, sampY + 1);
          let BR = this.getPixel(data, sampX + 1, sampY + 1);
          let R = Blend(Blend(TL[0], TR[0], tx), Blend(BL[0], BL[0], tx), ty);
          let G = Blend(Blend(TL[1], TR[1], tx), Blend(BL[1], BL[1], tx), ty);
          let B = Blend(Blend(TL[2], TR[2], tx), Blend(BL[2], BL[2], tx), ty);
          let A = Blend(Blend(TL[3], TR[3], tx), Blend(BL[3], BL[3], tx), ty);
          return [R, G, B, A];
          break;
        }
        case 'bicubic': {
          tx = Easing.cubic(tx);
          ty = Easing.cubic(ty);
          let TL = this.getPixel(data, sampX, sampY);
          let TR = this.getPixel(data, sampX + 1, sampY);
          let BL = this.getPixel(data, sampX, sampY + 1);
          let BR = this.getPixel(data, sampX + 1, sampY + 1);
          let R = Blend(Blend(TL[0], TR[0], tx), Blend(BL[0], BL[0], tx), ty);
          let G = Blend(Blend(TL[1], TR[1], tx), Blend(BL[1], BL[1], tx), ty);
          let B = Blend(Blend(TL[2], TR[2], tx), Blend(BL[2], BL[2], tx), ty);
          let A = Blend(Blend(TL[3], TR[3], tx), Blend(BL[3], BL[3], tx), ty);
          return [R, G, B, A];
          break;
        }
        default:
          return this.getPixel(data, sampX, sampY);
      }
    }
  }

  setCanvasImageFromFile(ctx, file) {
    let reader = new FileReader();
    reader.onload = evt => {
      let img = new Image();
      img.onload = () => {
        ctx.canvas.width = img.naturalWidth;
        ctx.canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        this.updateDepthMapOverlay();
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }

  updateDepthMapOverlay() {
    let rect = this.cvsDepthMap.getBoundingClientRect();
    this.el.depthMapOverlay.style.width = `${rect.width}px`;
    this.el.depthMapOverlay.style.height = `${rect.height}px`;
    let x = rect.width / parseInt(this.el.inputStrips.value);
    this.el.depthMapOverlay.style.backgroundSize = `${x}px 100%`;
  }
}

export default Stereogram;
