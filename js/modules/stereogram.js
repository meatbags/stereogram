/** Stereogram **/

import Blend from '../util/blend';
import Clamp from '../util/clamp';
import Easing from '../util/easing';
import Wrap from '../util/wrap';

class Stereogram {
  constructor() {
    // init canvases
    this.canvas = {};
    this.ctx = {};
    this.canvas.tile = document.querySelector('#canvas-tile');
    this.canvas.depthMap = document.querySelector('#canvas-depth-map');
    this.canvas.output = document.querySelector('#canvas-output');
    this.ctx.tile = this.canvas.tile.getContext('2d');
    this.ctx.depthMap = this.canvas.depthMap.getContext('2d');
    this.ctx.output = this.canvas.output.getContext('2d');

    // create noise tile
    this.canvas.tile.width = 100;
    this.canvas.tile.height = 100;
    this.ctx.tile.fillStyle = '#fff';
    this.ctx.tile.fillRect(0, 0, this.canvas.tile.width, this.canvas.tile.height);
    this.ctx.tile.fillStyle = '#000';
    for (let x=0; x<this.canvas.tile.width; x++) {
      for (let y=0; y<this.canvas.tile.height; y++) {
        if (Math.random() > 0.5) {
          this.ctx.tile.fillRect(x, y, 1, 1);
        }
      }
    }

    // create depth map
    this.canvas.depthMap.width = 150;
    this.canvas.depthMap.height = 150;
    this.ctx.depthMap.fillStyle = '#000';
    this.ctx.depthMap.fillRect(0, 0, this.canvas.depthMap.width, this.canvas.depthMap.height);
    this.ctx.depthMap.fillStyle = '#fff';
    this.ctx.depthMap.beginPath();
    this.ctx.depthMap.arc(this.canvas.depthMap.width/2, this.canvas.depthMap.height/2, this.canvas.depthMap.height/4, 0, Math.PI*2);
    this.ctx.depthMap.fill();

    // ui
    this.el = {};
    this.el.buttonGenerateImage = document.querySelector('#button-generate-image');
    this.el.outputMessage = document.querySelector('#output-message');
    this.el.buttonDownload = document.querySelector('#button-download');
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
      this.el.outputMessage.innerText = 'Working...';
      this.el.outputMessage.classList.add('active');
      setTimeout(() => {
        this.generateImage();
        this.el.outputMessage.innerText = 'Done.';
        setTimeout(() => {
          this.el.outputMessage.classList.remove('active');
        }, 350);
      }, 50);
    };
    this.el.fileInputTileImage.onchange = () => {
      let file = this.el.fileInputTileImage.files[0];
      this.setCanvasImageFromFile(this.ctx.tile, file);
    };
    this.el.buttonDownload.onclick = () => { this.downloadImage(); };
    this.el.fileInputDepthMapImage.onchange = () => {
      let file = this.el.fileInputDepthMapImage.files[0];
      this.setCanvasImageFromFile(this.ctx.depthMap, file);
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
        this.setCanvasImageFromFile(this.ctx.tile, file);
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
        this.setCanvasImageFromFile(this.ctx.depthMap, file);
      }
    };
    this.el.buttonDimensionsAuto.onclick = () => {
      let n = parseInt(this.el.inputStrips.value);
      let width = (n + 1) * this.canvas.tile.width;
      let ratio = this.canvas.depthMap.height / this.canvas.depthMap.width;
      let height = Math.round((n * this.canvas.tile.width) * ratio);
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
    this.canvas.output.width = parseInt(this.el.inputWidth.value);
    this.canvas.output.height = parseInt(this.el.inputHeight.value);

    // set props from ui
    this.state = {};
    this.state.strips = parseInt(this.el.inputStrips.value);
    this.state.tileWidth = this.canvas.tile.width;
    this.state.tileHeight = this.canvas.tile.height;
    this.state.tileRatio = this.state.tileHeight / this.state.tileWidth;
    this.state.depthStripWidth = this.canvas.depthMap.width / this.state.strips;
    this.state.outputStripWidth = this.canvas.output.width / (this.state.strips + 1);
    this.state.depthScale = parseFloat(this.el.inputDepthScale.value);
    this.state.invert = this.el.checkboxInvert.checked ? true : false;
    this.state.preserveTileRatio = this.el.checkboxPreserveTileRatio.checked ? true : false;
    this.state.depthModel = this.el.selectDepthModel.value;
    this.state.interpolation = this.el.selectInterpolation.value;

    // get image data
    this.data = {};
    this.data.tile = this.ctx.tile.getImageData(0, 0, this.canvas.tile.width, this.canvas.tile.height);
    this.data.depthMap = this.ctx.depthMap.getImageData(0, 0, this.canvas.depthMap.width, this.canvas.depthMap.height);
    this.data.output = this.ctx.output.createImageData(this.canvas.output.width, this.canvas.output.height);

    // generate image
    for (let x=0; x<this.canvas.output.width; x++) {
      for (let y=0; y<this.canvas.output.height; y++) {
        this.compute(x, y);
      }
    }

    // draw
    this.ctx.output.putImageData(this.data.output, 0, 0);
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
      let nX = (x - this.state.outputStripWidth) / (this.canvas.output.width - this.state.outputStripWidth);
      let nY = y / this.canvas.output.height;
      let depthMapX = nX * this.canvas.depthMap.width;
      let depthMapY = nY * this.canvas.depthMap.height;
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
    let rect = this.canvas.depthMap.getBoundingClientRect();
    this.el.depthMapOverlay.style.width = `${rect.width}px`;
    this.el.depthMapOverlay.style.height = `${rect.height}px`;
    let x = rect.width / parseInt(this.el.inputStrips.value);
    this.el.depthMapOverlay.style.backgroundSize = `${x}px 100%`;
  }

  downloadImage() {
    let date = (new Date());
    let YYYY = date.getFullYear();
    let MM = (date.getMonth() + 1).toString().padStart(2, '0');
    let DD = date.getDate().toString().padStart(2, '0');
    let hh = date.getHours().toString().padStart(2, '0');
    let mm = date.getMinutes().toString().padStart(2, '0');
    let ss = date.getSeconds().toString().padStart(2, '0');
    let filename = `stereogram_${YYYY}-${MM}-${DD}_${hh}:${mm}:${ss}.png`;
    let data = this.canvas.output.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = data;
    a.setAttribute('download', filename);
    a.click();
  }
}

export default Stereogram;
