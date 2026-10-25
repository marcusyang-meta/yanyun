import heroImg from '../assets/hero.jpg';

// 全站氛围底: 水墨山水固定铺底, 重压暗并向下融进墨色。
// 顶部一层透出山影; 底部再锚一层同图 (底缘山影), 短页面收尾落在山上,
// 不再坠进纯黑。内容永远在两层之上 (z-index), 两层皆 pointer-events:none。
export default function SiteBackdrop() {
  return (
    <>
      <div className="yy-backdrop" aria-hidden="true">
        <img src={heroImg} alt="" />
      </div>
      <div className="yy-backdrop-bottom" aria-hidden="true">
        <img src={heroImg} alt="" />
      </div>
    </>
  );
}
