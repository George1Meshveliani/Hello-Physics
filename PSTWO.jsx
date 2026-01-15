import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Zap, Target, Cpu, BookOpen, Sigma } from 'lucide-react';

/**
 * Professional MathText component using KaTeX.
 * Loads the library dynamically and renders LaTeX strings with high fidelity.
 */
const MathText = ({ text }) => {
  const [isKatexLoaded, setIsKatexLoaded] = useState(false);

  useEffect(() => {
    // Only load if not already present
    if (window.katex) {
      setIsKatexLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    link.rel = "stylesheet";
    link.integrity = "sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV";
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    script.integrity = "sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8";
    script.crossOrigin = "anonymous";
    script.onload = () => setIsKatexLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Clean up is generally not needed for singleton libraries, 
      // but good practice if checking strictly.
    };
  }, []);

  if (!text) return null;

  // Pre-process text to fix common loose physics shorthand before LaTeX rendering
  // e.g. "10-19" -> "10^{-19}"
  const processForLatex = (str) => {
    return str
      .replace(/10-([0-9]+)/g, '10^{-$1}') // Fix 10-19
      .replace(/10\^([0-9]+)/g, '10^{$1}') // Fix 10^6
      .replace(/([0-9]+)\^o/g, '$1^{\\circ}') // Fix 90^o
      .replace(/sin\^2/g, '\\sin^2') // Fix trig powers
      .replace(/sin/g, '\\sin') // Ensure backslash for functions if missing
      .replace(/cos/g, '\\cos')
      .replace(/tan/g, '\\tan')
      .replace(/\\sint/g, '\\sin t'); // Fix common concat errors
  };

  // Split text by $ delimiters
  const parts = text.split(/(\$[^\$]+\$)/g);

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const rawLatex = part.slice(1, -1);
          const latex = processForLatex(rawLatex);

          if (isKatexLoaded && window.katex) {
            try {
              const html = window.katex.renderToString(latex, {
                throwOnError: false,
                displayMode: false, // Inline math
              });
              return (
                <span 
                  key={i} 
                  className="mx-1 text-blue-900" // Slight color for math
                  dangerouslySetInnerHTML={{ __html: html }} 
                />
              );
            } catch (e) {
              console.error("KaTeX Error:", e);
              return <code key={i} className="text-red-500 text-sm">{latex}</code>;
            }
          } else {
            // Fallback while loading or if failed
            return <code key={i} className="bg-slate-100 px-1 rounded text-slate-600">{rawLatex}</code>;
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('Easy');
  const [visibleSolutions, setVisibleSolutions] = useState({});
  const [showFormulas, setShowFormulas] = useState(true);

  const toggleSolution = (id) => {
    setVisibleSolutions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Strict LaTeX strings for the reference
  const formulaReference = [
    { name: "Lorentz Force", formula: "$\\vec{F} = q(\\vec{E} + \\vec{v} \\times \\vec{B})$" },
    { name: "Magnetic Force (Wire)", formula: "$F = ILB \\sin\\theta$" },
    { name: "Faraday's Law", formula: "$\\epsilon = -N \\frac{\\Delta \\Phi}{\\Delta t}$" },
    { name: "Ampère's Law", formula: "$\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{\\text{enc}}$" },
    { name: "Cyclotron Radius", formula: "$r = \\frac{mv}{qB}$" },
    { name: "Cyclotron Frequency", formula: "$f = \\frac{qB}{2\\pi m}$" },
    { name: "Biot-Savart Law", formula: "$d\\vec{B} = \\frac{\\mu_0}{4\\pi} \\frac{I d\\vec{l} \\times \\hat{r}}{r^2}$" },
    { name: "Magnetic Pressure", formula: "$P_B = \\frac{B^2}{2\\mu_0}$" }
  ];

  const questions = {
    Easy: [
      {
        id: 'e1',
        q: "A proton moves at $2 \\times 10^{6}$ m/s perpendicular to a magnetic field of $0.5$ T. What is the magnetic force acting on it?",
        s: "Using $F = qvB \\sin\\theta$: $F = (1.6 \\times 10^{-19} \\text{ C})(2 \\times 10^{6} \\text{ m/s})(0.5 \\text{ T}) \\sin(90^{\\circ}) = 1.6 \\times 10^{-13}$ N."
      },
      {
        id: 'e2',
        q: "What is the direction of the force on an electron moving North in a magnetic field pointing West?",
        s: "Using Right Hand Rule for positive charge: Fingers North, Palm West $\\to$ Thumb points UP. Since it's an electron (negative), the force is opposite: **DOWN** (into the page)."
      },
      {
        id: 'e3',
        q: "A wire of length $0.5$ m carries a current of $2$ A in a uniform magnetic field of $0.1$ T. Calculate the maximum force.",
        s: "$F = ILB = (2 \\text{ A})(0.5 \\text{ m})(0.1 \\text{ T}) = 0.1$ N."
      },
      {
        id: 'e4',
        q: "An electric field of $500$ V/m exists between two plates. What force does it exert on a $2 \\mu\\text{C}$ charge?",
        s: "$F = qE = (2 \\times 10^{-6} \\text{ C})(500 \\text{ V/m}) = 1 \\times 10^{-3}$ N."
      },
      {
        id: 'e5',
        q: "If a particle remains undeflected in crossed E and B fields, what is its velocity?",
        s: "Equating forces $qE = qvB$, so $v = \\frac{E}{B}$."
      },
      {
        id: 'e6',
        q: "How does the radius of a particle's circular path change if its velocity is doubled in a constant B-field?",
        s: "$r = \\frac{mv}{qB}$. Since $r \\propto v$, if $v$ doubles, $r$ doubles linearly."
      },
      {
        id: 'e7',
        q: "What is the work done by a magnetic force on a moving charge?",
        s: "Zero. Magnetic force is always perpendicular to velocity ($W = \\int \\vec{F} \\cdot d\\vec{s}$), making the power $P = \\vec{F} \\cdot \\vec{v} = 0$."
      },
      {
        id: 'e8',
        q: "A $10$ cm wire moves at $5$ m/s through a $0.2$ T field. What is the induced EMF?",
        s: "$\\epsilon = Blv = (0.2)(0.1)(5) = 0.1$ V."
      },
      {
        id: 'e9',
        q: "Define the Tesla in terms of Newtons, Amperes, and Meters.",
        s: "$1 \\text{ T} = \\frac{1 \\text{ N}}{1 \\text{ A} \\cdot 1 \\text{ m}}$."
      },
      {
        id: 'e10',
        q: "A charge is at rest in a magnetic field. What is the force?",
        s: "Zero. The Lorentz force equation $F = qvB \\sin\\theta$ requires $v > 0$ for a non-zero force."
      }
    ],
    Intermediate: [
      {
        id: 'm1',
        q: "An alpha particle ($q=2e, m=4u$) and a proton ($q=e, m=1u$) enter a B-field with the same kinetic energy. Compare their radii.",
        s: "$r = \\frac{\\sqrt{2mK}}{qB}$. Ratio $\\frac{r_{\\alpha}}{r_p} = \\frac{\\sqrt{4}/2}{\\sqrt{1}/1} = 1$. They have the same radius."
      },
      {
        id: 'm2',
        q: "A particle of mass $m$ and charge $q$ enters a region of width $d$ with field $B$. Find the minimum velocity to escape the field.",
        s: "To escape, the radius $r$ must be greater than $d$. Since $r = \\frac{mv}{qB}$, then $\\frac{mv}{qB} > d$ implies $v > \\frac{qBd}{m}$."
      },
      {
        id: 'm3',
        q: "Calculate the cyclotron frequency of an electron in a $1.2$ T field.",
        s: "$f = \\frac{qB}{2\\pi m} = \\frac{(1.6 \\times 10^{-19})(1.2)}{2\\pi(9.1 \\times 10^{-31})} \\approx 3.36 \\times 10^{10}$ Hz."
      },
      {
        id: 'm4',
        q: "A charge $q$ moves in a circle of radius $R$ in a B-field. If $B$ is tripled, what happens to the period $T$?",
        s: "$T = \\frac{2\\pi m}{qB}$. If $B$ is tripled, $T$ becomes $\\frac{1}{3}$ of the original value."
      },
      {
        id: 'm5',
        q: "Find the magnetic field at the center of a circular loop of radius $5$ cm carrying $10$ A.",
        s: "$B = \\frac{\\mu_0 I}{2R} = \\frac{(4\\pi \\times 10^{-7})(10)}{2(0.05)} \\approx 1.26 \\times 10^{-4}$ T."
      },
      {
        id: 'm6',
        q: "An electron is accelerated from rest through $1000$ V. It then enters a $0.01$ T field. Find the radius.",
        s: "$v = \\sqrt{\\frac{2eV}{m}}$. $r = \\frac{mv}{eB} = \\frac{1}{B}\\sqrt{\\frac{2mV}{e}} \\approx 1.06$ cm."
      },
      {
        id: 'm7',
        q: "Two parallel wires $2$ cm apart carry $5$ A in the same direction. What is the force per unit length?",
        s: "$\\frac{F}{L} = \\frac{\\mu_0 I_1 I_2}{2\\pi d} = \\frac{(2 \\times 10^{-7})(5)(5)}{0.02} = 2.5 \\times 10^{-4}$ N/m (attractive)."
      },
      {
        id: 'm8',
        q: "A square loop (side $a$) carries current $I$ in field $B$. Find the maximum torque.",
        s: "$\\tau = NIAB \\sin\\theta$. For $N=1$, $\\tau_{\\text{max}} = I a^{2} B$."
      },
      {
        id: 'm9',
        q: "A particle moves in a helical path. If the pitch is equal to the radius, what is the angle of entry?",
        s: "Pitch $= v_{\\parallel} T = v \\cos\\theta (\\frac{2\\pi m}{qB})$. Radius $= v \\sin\\theta (\\frac{m}{qB})$. Equal implies: $2\\pi \\cos\\theta = \\sin\\theta \\implies \\tan\\theta = 2\\pi$."
      },
      {
        id: 'm10',
        q: "A solenoid of length $0.5$ m has $500$ turns. What current produces a $2$ mT field inside?",
        s: "$B = \\mu_0 (\\frac{N}{L}) I \\implies I = \\frac{BL}{\\mu_0 N} = \\frac{(0.002)(0.5)}{(4\\pi \\times 10^{-7})(500)} \\approx 1.59$ A."
      }
    ],
    Advanced: [
      {
        id: 'a1',
        q: "Derive the drift velocity of a guiding center for a particle in crossed $\\vec{E}$ and $\\vec{B}$ fields where $\\vec{E}$ is not perpendicular to $\\vec{B}$.",
        s: "Only the component of $E$ perpendicular to $B$ contributes to drift: $\\vec{v}_d = \\frac{\\vec{E} \\times \\vec{B}}{B^{2}}$. The parallel component $E_{\\parallel}$ causes uniform acceleration."
      },
      {
        id: 'a2',
        q: "A particle with charge $q$ and mass $m$ starts from rest at $(0,0,0)$ in $\\vec{E} = E_0 \\hat{j}$ and $\\vec{B} = B_0 \\hat{k}$. Describe the trajectory.",
        s: "Cycloid in $xy$-plane. $x(t) = \\frac{E}{\\omega B}(\\omega t - \\sin\\omega t)$, $y(t) = \\frac{E}{\\omega B}(1 - \\cos\\omega t)$ where $\\omega = \\frac{qB}{m}$."
      },
      {
        id: 'a3',
        q: "Calculate the magnetic pressure exerted by a $5$ T field.",
        s: "$P_B = \\frac{B^{2}}{2\\mu_0} = \\frac{25}{2(4\\pi \\times 10^{-7})} \\approx 9.95 \\times 10^{6}$ Pa."
      },
      {
        id: 'a4',
        q: "In a Betatron, the magnetic field at the orbit is $B_{orb}$. What must the average field $B_{avg}$ inside the orbit be to keep the radius constant?",
        s: "Using the Betatron condition: $\\Delta \\Phi = 2\\pi R^{2} B_{orb}$. This implies $B_{avg} = 2 B_{orb}$ (the '2-to-1' rule)."
      },
      {
        id: 'a5',
        q: "A charge $q$ is moving near a long straight wire carrying current $I$. If the particle's velocity is parallel to the wire, find the force.",
        s: "$B = \\frac{\\mu_0 I}{2\\pi r}$. $F = qvB = qv (\\frac{\\mu_0 I}{2\\pi r})$. Force is attractive/repulsive based on direction."
      },
      {
        id: 'a6',
        q: "Determine the Hall voltage $V_H$ for a conductor of width $w$, thickness $t$, carrying current $I$ in field $B$.",
        s: "$V_H = \\frac{I B}{n e t}$, where $n$ is charge carrier density and $e$ is elementary charge."
      },
      {
        id: 'a7',
        q: "Analyze the motion of a particle in a magnetic mirror field. What defines the loss cone angle?",
        s: "$\\sin^{2}\\theta_m = \\frac{B_{min}}{B_{max}}$. Particles with pitch angles smaller than $\\theta_m$ escape the mirror."
      },
      {
        id: 'a8',
        q: "An electromagnetic wave has $E_{max} = 300$ V/m. What is the maximum magnetic field strength?",
        s: "$B_0 = \\frac{E_0}{c} = \\frac{300}{3 \\times 10^{8}} = 10^{-6}$ T or $1 \\mu\\text{T}$."
      },
      {
        id: 'a9',
        q: "A relativistic electron ($\\gamma = 10$) enters a $1$ T field. Calculate its radius of curvature.",
        s: "$r = \\frac{p}{qB} = \\frac{\\gamma m v}{qB} \\approx \\frac{\\gamma m c}{qB} \\approx 0.017$ m."
      },
      {
        id: 'a10',
        q: "A plasma consists of ions and electrons. Why do they drift in the same direction in an $\\vec{E} \\times \\vec{B}$ drift but opposite in a grad-B drift?",
        s: "$E \\times B$ drift $\\vec{v} = \\frac{\\vec{E} \\times \\vec{B}}{B^{2}}$ is charge-independent. Grad-B drift depends on charge sign."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
              <Zap className="text-white w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 mb-2">
            Electromagnetism Challenge
          </h1>
          <p className="text-slate-500 text-lg">Master the motion of particles in magnetic and electric fields.</p>
        </header>

        {/* Formula Sheet Toggle */}
        <section className="mb-8 bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
          <button 
            onClick={() => setShowFormulas(!showFormulas)}
            className="w-full flex items-center justify-between p-4 bg-blue-600 text-white font-bold transition-colors hover:bg-blue-700"
          >
            <div className="flex items-center gap-2">
              <Sigma size={20} />
              <span>PHYSICS FORMULA REFERENCE</span>
            </div>
            {showFormulas ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {showFormulas && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 bg-blue-50/30">
              {formulaReference.map((f, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-blue-100 last:border-0 md:[&:nth-last-child(-n+2)]:border-0">
                  <span className="text-sm font-semibold text-slate-600">{f.name}</span>
                  <MathText text={f.formula} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Difficulty Tabs */}
        <div className="flex bg-slate-200 p-1 rounded-xl mb-8">
          {Object.keys(questions).map((level) => (
            <button
              key={level}
              onClick={() => setActiveTab(level)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === level 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-300/50'
              }`}
            >
              {level === 'Easy' && <BookOpen size={18} />}
              {level === 'Intermediate' && <Target size={18} />}
              {level === 'Advanced' && <Cpu size={18} />}
              {level}
            </button>
          ))}
        </div>

        {/* Question List */}
        <div className="space-y-4">
          {questions[activeTab].map((item, index) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 bg-slate-100 text-slate-500 font-mono text-sm w-8 h-8 flex items-center justify-center rounded-full">
                    {index + 1}
                  </span>
                  <div className="flex-grow">
                    <div className="text-lg text-slate-800 leading-relaxed mb-4">
                      <MathText text={item.q} />
                    </div>
                    
                    <button 
                      onClick={() => toggleSolution(item.id)}
                      className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wider hover:text-blue-700 transition-colors"
                    >
                      {visibleSolutions[item.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {visibleSolutions[item.id] ? 'Hide Solution' : 'Show Solution'}
                    </button>
                  </div>
                </div>
              </div>
              
              {visibleSolutions[item.id] && (
                <div className="bg-slate-50 border-t border-slate-100 p-6 animate-in slide-in-from-top duration-300">
                  <div className="flex gap-3">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-blue-500 uppercase mb-2 tracking-widest">Calculated Solution</h4>
                      <div className="text-slate-700 font-medium leading-relaxed">
                        <MathText text={item.s} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <footer className="mt-12 text-center pb-8 border-t border-slate-200 pt-8">
          <p className="text-slate-400 text-sm">
            Developed for Advanced Physics Learning. <br/>
            Constants: $e = 1.6 \times 10^{-19}$ C, $c = 3 \times 10^{8}$ m/s, $\mu_0 = 4\pi \times 10^{-7}$ T·m/A.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
