class Global {
  constructor() {
    //this.GLOBE_RADIUS = 30;
  }
}

export default (new Global);
export const GLOBE_RADIUS = 10;
export const MIN_SCALE = GLOBE_RADIUS*0.5;
export const MAX_SCALE = GLOBE_RADIUS*4;
export const OFFSET_Z = 0.25;
export const SIDE_MARGIN = 0.78;
