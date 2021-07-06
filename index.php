<!DOCTYPE html>
<html>
<head>
  <title>Stereogram</title>
  <link rel='stylesheet' href='build/style.min.css'>
  <script src='build/app.min.js'></script>
</head>
<body>
  <div class='wrapper'>
    <div class='section'>
      <div id='drop-input-tile' class='section__item'>
        TILE:<br /><br />
        <input type='file' id='input-tile'><br />
        <div class='canvas-wrapper'>
          <canvas id='canvas-tile'></canvas>
        </div>
      </div>
      <div id='drop-input-depth-map' class='section__item'>
        DEPTH MAP:<br /><br />
        <input type='file' id='input-depth-map'><br />
        <div class='canvas-wrapper'>
          <canvas id='canvas-depth-map'></canvas>
        </div>
      </div>
      <div class='section__item'>
        OPTIONS:<br /><br />
        <div class='controls'>
          <div class='control'><label>Add Strips:</label><input id='input-strips' value='8' min='1' step='1' type='number'></div>
          <div class='control'>
            <label>Width(px):</label>
            <div class='control__input'>
              <input id='input-width' value='500' min='50' step='1' type='number'>
              <button id='button-dimensions-auto'>Auto</button>
            </div>
          </div>
          <div class='control'><label>Height(px):</label><input id='input-height' value='500' min='50' step='1' type='number'></div>
          <div class='control'>
            <label>Scale Dimensions:</label>
            <div class='control__input'>
              <input id='input-scale-dimensions' value='1' min='1' step='1' type='number'>
              <button id='button-scale-apply'>Apply</button>
            </div>
          </div>
          <div class='control'><label>Depth Scale:</label><input id='input-depth-scale' value='5.0' step='0.05' type='number'></div>
          <div class='control'>
            <label>Depth Model:</label>
            <select id='input-depth-model' value='linear'>
              <option value='linear' selected>Linear</option>
              <option value='quadratic'>Quadratic</option>
              <option value='cubic'>Cubic</option>
            </select>
          </div>
          <div class='control'>
            <label>Interpolation:</label>
            <select id='input-interpolation' value='nearest-neighbour'>
              <option value='none'>None</option>
              <option value='nearest-neighbour' selected>Nearest Neighbour</option>
              <option value='bilinear'>Bilinear</option>
              <option value='bicubic'>Bicubic</option>
            </select>
          </div>
          <div class='control'><label>Invert Depth:</label><input id='input-invert' type='checkbox'></div>
          <div class='control'><label>Bubble:</label><input id='input-bubble' type='checkbox'></div>
          <div class='control'><label>Tilt:</label><input id='input-tilt' type='checkbox'></div>
        </div>
        <br />
        <div><button id='button-generate-image'>Generate Image</button> <span id='button-generate-image-message'></span></div>
        <br />
      </div>
      <div class='section__item section__item--output'>
        OUTPUT:<br />
        <div class='canvas-wrapper'>
          <canvas id='canvas-output'></canvas>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
