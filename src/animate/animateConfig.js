// 新頁面專用設定，不影響舊頁面的 appConfig
export const animateConfig = {
  defaultChars: [
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
    '0','1','2','3','4','5','6','7','8','9'
  ],

  scatter: {
    displayScale: 1,
    densityScale: 1.15,
    responsive: {
      mobileMaxWidth: 768,
      tabletMaxWidth: 1024,
      mobileDisplayScale: 0.48,
      mobileDensityScale: 0.42,
      tabletDisplayScale: 0.72,
      tabletDensityScale: 0.7,
    },
    targetCount: 200,
    minDistRem: 0.3,
    size: {
      small:  { min: 5.0,  max: 7.0,  chance: 0.25 },
      medium: { min: 7.5,  max: 10.5, chance: 0.50 },
      large:  { min: 10.5, max: 14.5, chance: 0.25 },
    },
  },

  physics: {
    // 互動半徑：用 viewport 寬度的比例來算，避免手機上半徑比整個螢幕還大
    // 最終 px = window.innerWidth * interactionRadiusVw
    // 桌機 1440px × 0.38 ≈ 547px；手機 390px × 0.38 ≈ 148px
    interactionRadiusVw: 0.38,

    // 磁力位移保留，但力道調小避免搶過軸變化的視覺
    magneticForce: 0.25,
    spring: 0.04,
    friction: 0.85,

    // 字型軸互動強度：控制滑鼠靠近時各個字母被推往 active 值的力道
    axisMagneticStrength: 1.0,

    // 閒置漂浮（保留生命感，但幅度縮小）
    idle: {
      movementAmplitudeX: 10,
      movementAmplitudeY: 14,
      rotationAmplitude: 6,
      movementSpeedX: 0.5,
      movementSpeedY: 0.4,
      rotationSpeed: 0.3,
    },
  },

  // 每個字母的基準軸「錯落」程度（0 = 全用 default，1 = 全隨機）
  // 設高一點才能看到靜止時的高矮胖瘦差異
  baseScatter: 0.85,
};
