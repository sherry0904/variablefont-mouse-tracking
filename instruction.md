Roboto Flex 是目前的 Variable Font（可變字型）之王。它擁有極其豐富的軸向（Axes），這意味著你的「躲貓貓」玩法可以從單純的「變粗」進化到「變高、變窄、甚至是變形」。

針對 Roboto Flex 的特性，我們可以把互動層次提升到另一個境界：

1. 核心參數：你可以玩哪些「軸」？
除了標準的 wght（字重），Roboto Flex 提供了幾個非常適合「躲避」與「追蹤」的軸：

wdth (Width): 讓文字像拉風琴一樣變寬或變窄。

GRAD (Grade): 這最適合做「手電筒」效果！ 改變 Grade 會增加文字的份量感，但不會改變文字佔用的寬度。這意味著當滑鼠移過去時，版面不會因為文字變粗而亂跳（Layout Reflow），視覺上極其絲滑。

XTRA (Fixed Width): 調整字元寬度但保持間距，適合做「聚光燈下文字膨脹」的效果。

slnt (Slant): 滑鼠靠近時，文字向左或向右傾斜，產生「風吹過」或「被磁鐵吸引」的感覺。

2. 實作思路：CSS font-variation-settings
要把這些軸與滑鼠位置連動，CSS 變數是效率最高的方式。

視覺策略：
預設狀態： font-variation-settings: "wght" 100, "wdth" 25, "GRAD" -200; (細、窄、輕)

滑鼠接近： 隨距離動態轉變為 "wght" 900, "wdth" 150, "GRAD" 150; (粗、寬、重)

3. 進階技術實作：優化「感應區」
為了讓 "DynaComware" 佈滿螢幕且不卡頓，建議使用 CSS Grid 鋪滿背景，並用 JS 進行計算：

JavaScript
// 在你的 mousemove 監聽器中，將計算後的數值直接塞入 CSS 變數
const distance = calculateDistance(mouseX, mouseY, elementX, elementY);
const normalized = Math.min(Math.max((300 - distance) / 300, 0), 1); // 0 到 1 的感應強度

// 針對 Roboto Flex 的多軸連動
element.style.setProperty('--wght', 100 + (normalized * 800));
element.style.setProperty('--wdth', 25 + (normalized * 125));
element.style.setProperty('--GRAD', -200 + (normalized * 350));
CSS
/* CSS 部分 */
.text-item {
  font-family: 'Roboto Flex', sans-serif;
  font-variation-settings: 
    "wght" var(--wght, 100), 
    "wdth" var(--wdth, 25), 
    "GRAD" var(--GRAD, -200);
  transition: font-variation-settings 0.1s ease-out; /* 增加一點點平滑感 */
}
4. 針對「躲貓貓」的創意演算法
既然要好玩，我們可以設計幾種不同的「性格」：

「社恐」模式（躲避）：
滑鼠距離越近，wdth 越小（變超窄），wght 越細。文字就像在躲開你的滑鼠。

「呼吸」模式：
不只是跟隨滑鼠，再加上一個 Math.sin(Date.now() / 1000) 的基礎值，讓背景文字即使在滑鼠不動時，也在輕微地「起伏呼吸」。

「磁鐵」模式：
滑鼠滑過時，文字不只變粗，還會搭配 transform: skew() 或 slnt 軸，讓文字看起來像是倒向滑鼠中心。

5. 給前端工程師的小提醒
載入優化： 記得只下載需要的 Axes（Google Fonts 可以勾選範圍），否則全語系、全軸向的 Variable Font 檔案可能很大。

效能魔王： 如果畫面上有 500 個文字元件同時在跑 JS getBoundingClientRect，效能會崩潰。建議在頁面初始化時先快取所有元件的中心座標（Center Points），存成一個 Array，這樣 mousemove 只要做純數學運算。