export const appConfig = {
  // --- 預設展示字元集 (字型未指定 chars 時使用) ---
  defaultChars: [
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
    '0','1','2','3','4','5','6','7','8','9'
  ],

  // --- 排列與密度設定 (ScatterContainer) ---
  scatter: {
    // 畫面上最多生成的字母數量 (數字越大越密，但也更吃效能)
    targetCount: 200,

    // 字母間防重疊的最小安全距離係數 (越小字母會排得越緊甚至重疊，建議 0.25 ~ 0.4 之間)
    minDistRem: 0.28,

    // 字母隨機尺寸的設定 (rem)
    size: {
      small: { min: 5.0, max: 7.0, chance: 0.25 },
      medium: { min: 7.5, max: 10.5, chance: 0.50 }, // 從 0.25 到 0.75 的機率 (50%)
      large: { min: 10.5, max: 14.5, chance: 0.25 }
    }
  },

  // --- 互動與物理特效設定 (useMouseTracker) ---
  physics: {
    // 測試模式：只看變化軸，先暫停滑鼠造成的位移/旋轉放大感
    axisTestMode: true,
    // 測試模式下允許反應的軸；未列出的軸會固定在 default。
    // 先只開字重，避免 HIGH / wdth 讓字看起來變大。
    axisTestAxes: ['wght'],

    // 滑鼠互動的影響半徑 (數字越大，受影響的字母範圍越廣)
    interactionRadius: 500,

    // 滑鼠靠近時，字母往中心點被吸過去的位移引力 (0~1 之間)
    magneticForce: 0.45,

    // 實體位移的彈簧係數 (影響被吸過去的加速感，數字越大加速越快)
    spring: 0.04,

    // 實體位移的摩擦阻力 (影響滑動的滑順度，0~1 之間，越接近 1 滑得越遠)
    friction: 0.85,

    // 閒置時的生命力表現 (漂浮與呼吸感)
    idle: {
      // 字母的上下左右漂移與旋轉範圍
      movementAmplitudeX: 18,
      movementAmplitudeY: 25,
      rotationAmplitude: 15,
      slantAmplitude: 8,
      // 漂移與旋轉速度
      movementSpeedX: 0.6,
      movementSpeedY: 0.5,
      rotationSpeed: 0.4,
      // 粗細與寬度的呼吸變化範圍
      breathingWeight: 150,
      breathingWidth: 15,
      // 呼吸變化速度
      breathingSpeed: 0.7,
      // 閒置時字型軸呼吸的幅度 (佔該軸範圍的比例)。
      // 數字越小，預設散落狀態越貼近細／矮的基準，滑鼠滑過時的對比越顯著。
      axisBreathingScale: 0
    }
  }
};
