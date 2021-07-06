<!DOCTYPE html>
<html>
<head>
  <title>Stereogram</title>
  <link rel='stylesheet' href='build/style.min.css'>
  <script src='build/app.min.js'></script>
</head>
<body>
  <div class='wrapper'>
    TILE:<br /><br />
    <input type='file' id='input-tile'><br /><br />
    <canvas id='canvas-tile'></canvas><br /><br />
    DEPTH MAP:<br /><br />
    <input type='file' id='input-depth-map'><br /><br />
    <canvas id='canvas-depth-map'></canvas><br /><br />
    OUTPUT:<br /><br />
    <div class='controls'>
      <div class='control'><label>Add Strips:</label><input id='input-strips' value='8' min='1' step='1' type='number'></div>
      <div class='control'><label>Width(px):</label><input id='input-width' value='500' min='50' step='1' type='number'></div>
      <div class='control'><label>Height(px):</label><input id='input-height' value='500' min='50' step='1' type='number'></div>
      <div class='control'><label>Depth Scale:</label><input id='input-depth-scale' value='5.0' step='0.05' type='number'></div>
      <div class='control'><label>Invert Depth:</label><input id='input-invert' type='checkbox'></div>
      <div class='control'><label>Interpolation:</label><input id='input-interpolation' type='checkbox' checked></div>
      <div class='control'><label>Bubble:</label><input id='input-bubble' type='checkbox'></div>
      <div class='control'><label>Tilt:</label><input id='input-tilt' type='checkbox'></div>
    </div>
    <br />
    <button id='button-generate-image'>Generate Image</button> <span id='msg'></span>
    <br /><br />
    <canvas id='canvas-output'></canvas>
  </div>
</body>
</html>
