import heroImg from '../assets/hero.jpg';

// Site-wide ambient backdrop: a fixed ink-wash landscape, heavily darkened
// and fading into ink at the bottom. One layer shows the mountains at the
// top; a second anchors the same image at the bottom edge so short pages end
// on the mountains instead of dropping into pure black. Content always sits
// above both layers (z-index); both are pointer-events:none.
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
