import { ref } from 'vue';

export const fontsDatabase = {
  'king-gothic': {
    name: "華康金剛黑",
    family: "'DFPKingGothicTC1-VF', sans-serif",
    axes: {
      wght: { min: 100, max: 600, default: 100 },
      wdth: { min: 75, max: 100, default: 100 }
    }
  },
  // 'roboto-flex': {
  //   name: "Roboto Flex Variable",
  //   family: "'Roboto Flex Variable', 'Roboto Flex', sans-serif",
  //   axes: {
  //     wght: { min: 100, max: 1000, default: 400 },
  //     wdth: { min: 25, max: 151, default: 100 },
  //     GRAD: { min: -200, max: 150, default: -200 },
  //     slnt: { min: -10, max: 0, default: 0 },
  //     XOPQ: { min: 18, max: 175, default: 96 },
  //     YOPQ: { min: 18, max: 135, default: 79 },
  //     XTRA: { min: 323, max: 603, default: 468 },
  //     opsz: { min: 8, max: 144, default: 14 }
  //   }
  // }
};

export const activeFontId = ref('king-gothic');
