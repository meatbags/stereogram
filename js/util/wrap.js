/** Wrap */

const Wrap = (v, min, max) => {
  let range = max - min;
  while (v < min) { v += range; }
  while (v > max) { v -= range; }
  return v;
};

export default Wrap;
