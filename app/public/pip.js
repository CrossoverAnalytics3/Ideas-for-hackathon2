// Pip's rig: 6 moving parts, 9 expressions. Procedural SVG, no sprites.
(function () {
  const SVG = `
  <svg class="pipsvg" viewBox="0 0 150 170" aria-label="Pip, a small round character">
    <g class="pipbody">
      <ellipse cx="75" cy="156" rx="40" ry="6" fill="var(--ink)" opacity=".10"/>
      <path class="head" d="M75 22 C112 22 128 50 128 92 C128 130 106 152 75 152 C44 152 22 130 22 92 C22 50 38 22 75 22 Z" fill="var(--pip)"/>
      <path d="M75 22 C112 22 128 50 128 92 C128 112 122 128 111 138 C116 126 118 110 118 94 C118 54 102 28 70 23 Z" fill="var(--pip-shade)" opacity=".5"/>
      <ellipse cx="52" cy="86" rx="15" ry="16.5" fill="#FFFDF8"/>
      <ellipse cx="98" cy="86" rx="15" ry="16.5" fill="#FFFDF8"/>
      <circle class="pupil pupL" cx="52" cy="88" r="7" fill="#2B2018"/>
      <circle class="pupil pupR" cx="98" cy="88" r="7" fill="#2B2018"/>
      <circle cx="49.5" cy="85" r="2.4" fill="#fff" opacity=".9"/>
      <circle cx="95.5" cy="85" r="2.4" fill="#fff" opacity=".9"/>
      <rect class="lid lidL" x="36" y="52" width="32" height="0" rx="4" fill="var(--pip-dark)"/>
      <rect class="lid lidR" x="82" y="52" width="32" height="0" rx="4" fill="var(--pip-dark)"/>
      <rect class="brow browL" x="40" y="62" width="25" height="5.5" rx="2.75" fill="var(--pip-dark)"/>
      <rect class="brow browR" x="85" y="62" width="25" height="5.5" rx="2.75" fill="var(--pip-dark)"/>
      <path class="mouth" d="M60 118 Q67 118 75 118 Q83 118 90 118" stroke="#2B2018" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      <ellipse class="oh" cx="75" cy="120" rx="0" ry="0" fill="#2B2018"/>
      <ellipse cx="34" cy="106" rx="8" ry="5.5" fill="var(--hot)" opacity=".2"/>
      <ellipse cx="116" cy="106" rx="8" ry="5.5" fill="var(--hot)" opacity=".2"/>
    </g>
  </svg>`;
  const CSS = `
  .pipsvg{width:100%;height:100%;overflow:visible;display:block}
  .pipsvg .pipbody{transform-origin:75px 150px;animation:pipbob 3.4s ease-in-out infinite}
  @keyframes pipbob{0%,100%{transform:translateY(0) scaleY(1)}50%{transform:translateY(-4px) scaleY(1.012)}}
  .pipsvg .brow,.pipsvg .pupil,.pipsvg .lid,.pipsvg .mouth,.pipsvg .oh{transition:all .42s cubic-bezier(.34,1.3,.5,1)}
  .pipsvg.talking .mouth{animation:piptalk .28s ease-in-out infinite alternate}
  @keyframes piptalk{from{transform:scaleY(1)}to{transform:scaleY(1.6) translateY(-2px)}}
  .pipsvg .mouth{transform-origin:75px 118px}`;

  const EXPR = {
    proud:   {bl:[-6,-3], br:[6,-3],  lid:0, pu:[0,0],   m:[112,122,112], oh:0, tilt:0},
    confused:{bl:[14,-7], br:[-14,-7],lid:0, pu:[0,-2],  m:[120,114,120], oh:0, tilt:-4},
    defiant: {bl:[-13,2], br:[13,2],  lid:5, pu:[0,1],   m:[121,116,121], oh:0, tilt:0},
    listen:  {bl:[-4,-8], br:[4,-8],  lid:0, pu:[0,3],   m:[117,117,117], oh:0, tilt:3},
    think:   {bl:[10,-4], br:[-10,-4],lid:0, pu:[-4,-6], m:[119,115,119], oh:0, tilt:-3},
    doubt:   {bl:[8,-9],  br:[-3,-2], lid:3, pu:[3,-3],  m:[118,121,114], oh:0, tilt:2},
    dawn:    {bl:[-2,-14],br:[2,-14], lid:0, pu:[0,-1],  m:[118,118,118], oh:9, tilt:0},
    got:     {bl:[-9,-13],br:[9,-13], lid:0, pu:[0,0],   m:[110,126,110], oh:0, tilt:0},
    huh:     {bl:[6,-10], br:[-6,-2], lid:2, pu:[5,0],   m:[119,114,121], oh:0, tilt:5},
    sad:     {bl:[9,-2],  br:[-9,-2], lid:4, pu:[0,2],   m:[122,114,122], oh:0, tilt:-2},
  };

  function mount(el) {
    if (!document.getElementById('pip-css')) { const s = document.createElement('style'); s.id = 'pip-css'; s.textContent = CSS; document.head.appendChild(s); }
    el.innerHTML = SVG;
    const svg = el.querySelector('svg'), $ = c => svg.querySelector('.' + c);
    let current = 'proud', blinkT;
    function set(name) {
      const e = EXPR[name]; if (!e) return; current = name;
      $('browL').setAttribute('transform', `rotate(${e.bl[0]} 52.5 64.75) translate(0 ${e.bl[1]})`);
      $('browR').setAttribute('transform', `rotate(${e.br[0]} 97.5 64.75) translate(0 ${e.br[1]})`);
      for (const side of ['lidL', 'lidR']) { $(side).setAttribute('height', e.lid * 2.2); $(side).setAttribute('y', 74 - e.lid * 2.2); }
      $('pupL').setAttribute('cx', 52 + e.pu[0]); $('pupL').setAttribute('cy', 88 + e.pu[1]);
      $('pupR').setAttribute('cx', 98 + e.pu[0]); $('pupR').setAttribute('cy', 88 + e.pu[1]);
      const m = e.m; $('mouth').setAttribute('d', `M60 ${m[0]} Q67 ${m[1]} 75 ${m[1]} Q83 ${m[1]} 90 ${m[2]}`);
      $('oh').setAttribute('rx', e.oh); $('oh').setAttribute('ry', e.oh * 1.15);
      $('mouth').style.opacity = e.oh > 0 ? 0 : 1;
      $('pipbody').style.rotate = e.tilt + 'deg';
    }
    function blink() {
      for (const side of ['lidL', 'lidR']) { $(side).setAttribute('height', 36); $(side).setAttribute('y', 40); }
      setTimeout(() => set(current), 110);
    }
    (function loop() { blinkT = setTimeout(() => { blink(); loop(); }, 2600 + Math.random() * 3200); })();
    set('proud');
    return { set, talking: on => svg.classList.toggle('talking', !!on), get current() { return current; }, destroy: () => clearTimeout(blinkT) };
  }
  window.Pip = { mount, EXPR };
})();
