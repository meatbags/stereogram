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
      <!-- tile -->
      <div class='section__item'>
        <div class='section__header'>Tile Image</div>
        <div class='section__body'>
          <input type='file' id='input-tile'>
          <div id='drop-input-tile' class='canvas-wrapper'>
            <div class='canvas-wrapper__inner'>
              <canvas id='canvas-tile'></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- depth map -->
      <div class='section__item'>
        <div class='section__header'>Depth Map</div>
        <div class='section__body'>
          <input type='file' id='input-depth-map'>
          <div id='drop-input-depth-map' class='canvas-wrapper'>
            <div class='canvas-wrapper__inner'>
              <canvas id='canvas-depth-map'></canvas>
              <div id='depth-map-overlay'></div>
            </div>
          </div>
        </div>
      </div>

      <!-- options -->
      <div class='section__item'>
        <div class='section__header'>Options</div>
        <div class='section__body'>
          <div class='controls'>
            <div class='control'>
              <label>Strips (+1):</label>
              <input id='input-strips' value='8' min='1' step='1' type='number'>
            </div>
            <div class='control'>
              <label>Output Width:</label>
              <div class='control__input'>
                <input id='input-width' value='450' min='50' step='1' type='number'>
              </div>
            </div>
            <div class='control'>
              <label>Output Height:</label>
              <input id='input-height' value='400' min='50' step='1' type='number'></div>
            <div class='control'>
              <label>Scale Dimensions:</label>
              <div class='control__input'>
                <button id='button-scale-tile' title='Scale dimensions to tile size'>tile</button>
                <button id='button-scale-width' title='Scale width to height preserving tile ratio'>width</button>
                <button id='button-scale-height' title='Scale height to width preserving tile ratio'>height</button>
                <button id='button-scale-half' title='Halve dimensions'>&half;</button>
                <button id='button-scale-2' title='Double dimensions'>2</button>
              </div>
            </div>
            <div class='control'>
              <label>Depth Scale:</label>
              <input id='input-depth-scale' value='5.0' step='0.05' type='number'></div>
            <div class='control'>
              <label>Depth Model:</label>
              <select id='input-depth-model' value='linear'>
                <option value='linear' selected>Linear</option>
                <option value='quadratic'>Quadratic</option>
                <option value='cubic'>Cubic</option>
              </select>
            </div>
            <div class='control'>
              <label>Invert Depth:</label>
              <input id='input-invert' type='checkbox'>
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
            <div class='control'>
              <label>Preserve Tile Ratio:</label>
              <input id='input-preserve-tile-ratio' type='checkbox' checked>
            </div>
          </div>
        </div>
      </div>

      <!-- output -->
      <div class='section__item section__item--output'>
        <div class='section__header'>Output</div>
        <div class='section__body'>
          <div class='canvas-wrapper canvas-wrapper--output'>
            <div class='canvas-wrapper__inner'>
              <canvas id='canvas-output'></canvas>
            </div>
            <div class='canvas-wrapper--output__controls'>
              <button id='button-generate-image'>Generate Image</button>
              <button id='button-download'>Download</button>
            </div>
            <div id='output-message'></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
