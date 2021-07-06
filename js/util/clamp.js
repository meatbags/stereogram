/** Clamp */

const Clamp = (v, min, max) => {
  return Math.max(min, Math.min(max, v));
};

export default Clamp;
