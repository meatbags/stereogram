/** Easing */

class Easing {
  static quadratic(t) {
    return t<0.5 ? 2*t*t : -1+(4-2*t)*t;
  }

  static cubic(t) {
    return t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
  }
}

export default Easing;
