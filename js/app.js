/** App */

import Stereogram from './modules/stereogram';

class App {
  constructor() {
    this.modules = {
      stereogram: new Stereogram(),
    };

    // bind
    Object.keys(this.modules).forEach(key => {
      if (typeof this.modules[key].bind == 'function') {
        this.modules[key].bind(this);
      }
    });

    // resize
    this._resize();
    window.addEventListener('resize', () => { this._resize(); });
  }

  _resize() {
    Object.keys(this.modules).forEach(key => {
      if (typeof this.modules[key].resize == 'function') {
        this.modules[key].resize();
      }
    });
  }
}

window.addEventListener('load', () => {
  const app = new App();
});
