import { ref } from 'vue';

// 讀取網址參數 ?dev=1 來決定是否為開發模式
export const isDevMode = new URLSearchParams(window.location.search).get('dev') === '1';

export const fontsDatabase = {
  'king-gothic': {
    name: "華康金剛黑",
    family: "'DFPKingGothicTC1-VF', sans-serif",
    devOnly: true, // 僅在 ?dev=1 時顯示
    axes: {
      wght: { min: 100, max: 600, default: 100 },
      wdth: { min: 75, max: 100, default: 100 }
    }
  },
  'musako': {
    name: "Musako Variable",
    family: "'VariablemusakoVF', sans-serif",
    chars: ['A','D','F','N','O','T','Y','a','d','f','n','o','t','y'],
    axes: {
      // pull：滑鼠靠近時往 max 推進的強度 (0~1)。字寬刻意收斂，讓字高與字重主導，
      // 滑鼠靠近時字會明顯「抽高變粗」而非等比放大，凸顯字高變化。
      wght: { min: 100, max: 900, default: 100, pull: 1    }, // 字重
      wdth: { min: 1,   max: 9,   default: 1,   pull: 0.3  }, // 字寬 (收斂，維持窄身)
      HIGH: { min: 1,   max: 9,   default: 1,   pull: 1    }  // 字高 (特有變化軸，衝滿)
    }
  },
  'roboto-flex': {
    name: "Roboto Flex Variable",
    family: "'Roboto Flex Variable', 'Roboto Flex', sans-serif",
    devOnly: true, // 僅在 ?dev=1 時顯示
    axes: {
      wght: { min: 100, max: 1000, default: 400 },
      wdth: { min: 25, max: 151, default: 100 },
      GRAD: { min: -200, max: 150, default: -200 },
      slnt: { min: -10, max: 0, default: 0 },
      XOPQ: { min: 18, max: 175, default: 96 },
      YOPQ: { min: 18, max: 135, default: 79 },
      XTRA: { min: 323, max: 603, default: 468 },
      opsz: { min: 8, max: 144, default: 14 }
    }
  }
};

export const activeFontId = ref('musako');
