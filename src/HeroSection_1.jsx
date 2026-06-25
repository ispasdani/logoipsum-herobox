import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Color tokens                                                       */
/* ------------------------------------------------------------------ */
const C = {
  black: "#000000",
  gray: "#505050",
  lightGray: "#f8f8f8",
  green: "rgba(90,225,76,0.89)",
  darkBadge: "#0e1311",
  white: "#ffffff",
  overlay: "rgba(0,0,0,0.24)",
};

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260329_050842_be71947f-f16e-4a14-810c-06e83d23ddb5.mp4";

/* ------------------------------------------------------------------ */
/*  Icons (inline SVG)                                                 */
/* ------------------------------------------------------------------ */
const ChevronDown = ({ size = 16, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M6 9l6 6 6-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowUp = ({ size = 16, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 19V5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 11l6-6 6 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StarIcon = ({ size = 12, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    aria-hidden="true"
  >
    <path d="M12 2c.4 4.6 1.4 5.6 6 6-4.6.4-5.6 1.4-6 6-.4-4.6-1.4-5.6-6-6 4.6-.4 5.6-1.4 6-6z" />
  </svg>
);

const AiSparkle = ({ size = 14, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    aria-hidden="true"
  >
    <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z" />
    <path d="M18.5 14l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3z" />
  </svg>
);

const PaperclipIcon = ({ size = 14, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3 3 0 014.24 4.24l-9.2 9.19a1 1 0 01-1.41-1.41l8.49-8.49"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MicIcon = ({ size = 14, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="9"
      y="2"
      width="6"
      height="12"
      rx="3"
      stroke={color}
      strokeWidth="2"
    />
    <path
      d="M5 10a7 7 0 0014 0M12 19v3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = ({ size = 14, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
    <path
      d="M21 21l-4.3-4.3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Video background — custom rAF-based fade system (no CSS transitions)*/
/* ------------------------------------------------------------------ */
function VideoBackground() {
  const videoRef = useRef(null);
  const opacityRef = useRef(0); // current opacity, so fades resume w/o snapping
  const rafRef = useRef(null); // running animation frame id
  const fadingOutRef = useRef(false); // guards against repeated fade-out triggers
  const startedRef = useRef(false); // ensures first-ready logic runs once

  const FADE_MS = 250;
  const FADE_OUT_LEAD = 0.55; // begin fade-out when this many seconds remain

  const setOpacity = (v) => {
    opacityRef.current = v;
    if (videoRef.current) videoRef.current.style.opacity = String(v);
  };

  // Animate opacity to `target` over `duration`, resuming from current value.
  const animateTo = (target, duration, onDone) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current); // cancel competing frames
      rafRef.current = null;
    }
    const from = opacityRef.current;
    if (duration <= 0 || from === target) {
      setOpacity(target);
      onDone && onDone();
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      setOpacity(from + (target - from) * t);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        onDone && onDone();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const fadeIn = () => {
    fadingOutRef.current = false;
    animateTo(1, FADE_MS);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Reveal the video exactly once. Tries to play; reveals regardless of
    // whether autoplay succeeds, so a blocked autoplay still shows frame 0.
    const reveal = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      v.play().catch(() => {}); // autoplay may be blocked in sandboxes; ignore
      if (reduce) {
        setOpacity(1);
        return;
      }
      setOpacity(0);
      fadeIn(); // 250ms fade-in on load
    };

    const onTimeUpdate = () => {
      if (reduce) return;
      const d = v.duration;
      if (!d || isNaN(d)) return;
      const remaining = d - v.currentTime;
      // begin fade-out once, when 0.55s remain
      if (remaining <= FADE_OUT_LEAD && !fadingOutRef.current) {
        fadingOutRef.current = true;
        animateTo(0, FADE_MS);
      }
    };

    const onEnded = () => {
      setOpacity(0); // hold at 0
      setTimeout(() => {
        const vid = videoRef.current;
        if (!vid) return;
        vid.currentTime = 0;
        vid.play().catch(() => {});
        if (reduce) {
          setOpacity(1);
          fadingOutRef.current = false;
          return;
        }
        fadeIn(); // fade back in on loop start
      }, 100);
    };

    const onError = () => {
      // Surface load failures and ensure the element isn't left invisible.
      console.error("Hero video failed to load:", v.error);
      setOpacity(1);
    };

    // Reveal on the first of several events — different browsers/sandboxes
    // settle on different ones, so we don't depend on a single path.
    v.addEventListener("loadeddata", reveal);
    v.addEventListener("loadedmetadata", reveal);
    v.addEventListener("canplay", reveal);
    v.addEventListener("playing", reveal);
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("ended", onEnded);
    v.addEventListener("error", onError);

    if (v.readyState >= 2) reveal(); // already buffered before listeners attached

    // Kick off loading/playing explicitly (some sandboxes ignore autoPlay attr).
    v.play().catch(() => {});

    // Hard fallback: if nothing has revealed the video after 2.5s, force it
    // visible so the user always sees something even if events never fired.
    const fallback = setTimeout(() => {
      if (!startedRef.current) {
        startedRef.current = true;
        setOpacity(1);
        v.play().catch(() => {});
      }
    }, 2500);

    // If autoplay is blocked, start playback on the first user interaction.
    const onFirstInteract = () => {
      v.play().catch(() => {});
    };
    window.addEventListener("pointerdown", onFirstInteract, { once: true });
    window.addEventListener("keydown", onFirstInteract, { once: true });

    return () => {
      clearTimeout(fallback);
      v.removeEventListener("loadeddata", reveal);
      v.removeEventListener("loadedmetadata", reveal);
      v.removeEventListener("canplay", reveal);
      v.removeEventListener("playing", reveal);
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("error", onError);
      window.removeEventListener("pointerdown", onFirstInteract);
      window.removeEventListener("keydown", onFirstInteract);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      muted
      autoPlay
      playsInline
      preload="auto"
      src={VIDEO_SRC}
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "115%",
        height: "115%",
        objectFit: "cover",
        objectPosition: "top",
        opacity: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Navigation                                                         */
/* ------------------------------------------------------------------ */
function Navigation() {
  const menu = ["Platform", "Features", "Projects", "Community", "Contact"];
  return (
    <nav
      className="hero-nav"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 120px",
        position: "relative",
        zIndex: 2,
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: "'Schibsted Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: 24,
          letterSpacing: "-1.44px",
          color: C.black,
        }}
      >
        Logoipsum
      </div>

      {/* Menu */}
      <ul
        className="hero-menu"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {menu.map((item) => (
          <li key={item}>
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "'Schibsted Grotesk', sans-serif",
                fontWeight: 500,
                fontSize: 16,
                letterSpacing: "-0.2px",
                color: C.black,
                textDecoration: "none",
              }}
            >
              {item}
              {item === "Features" && <ChevronDown size={16} color={C.black} />}
            </a>
          </li>
        ))}
      </ul>

      {/* Right buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          style={{
            width: 82,
            height: 40,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Schibsted Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: 16,
            letterSpacing: "-0.2px",
            color: C.black,
          }}
        >
          Sign Up
        </button>
        <button
          style={{
            width: 101,
            height: 40,
            background: C.black,
            color: C.white,
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            fontFamily: "'Schibsted Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: 16,
            letterSpacing: "-0.2px",
          }}
        >
          Log In
        </button>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Badge                                                              */
/* ------------------------------------------------------------------ */
function Badge() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: C.lightGray,
        borderRadius: 999,
        padding: "4px 12px 4px 4px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 400,
        fontSize: 14,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: C.darkBadge,
          color: C.white,
          borderRadius: 999,
          padding: "4px 10px",
          fontSize: 13,
        }}
      >
        <StarIcon size={12} color="#5ae14c" />
        New
      </span>
      <span style={{ color: C.black }}>Discover what's possible</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Search input box                                                   */
/* ------------------------------------------------------------------ */
function SearchBox() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 728,
        height: 200,
        borderRadius: 18,
        background: C.overlay,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxSizing: "border-box",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Top row: credits / powered by */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "'Schibsted Grotesk', sans-serif",
          fontWeight: 500,
          fontSize: 12,
          color: C.white,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>60/450 credits</span>
          <button
            style={{
              background: C.green,
              color: C.darkBadge,
              border: "none",
              borderRadius: 999,
              padding: "3px 10px",
              cursor: "pointer",
              fontFamily: "'Schibsted Grotesk', sans-serif",
              fontWeight: 500,
              fontSize: 12,
            }}
          >
            Upgrade
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <AiSparkle size={14} color={C.white} />
          <span>Powered by GPT-4o</span>
        </div>
      </div>

      {/* White input card */}
      <div
        style={{
          flex: 1,
          background: C.white,
          borderRadius: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          boxSizing: "border-box",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Input + submit */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <input
            className="hero-input"
            type="text"
            placeholder="Type question..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              color: C.black,
              padding: "2px 0",
            }}
          />
          <button
            aria-label="Submit"
            style={{
              flex: "0 0 auto",
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: C.black,
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowUp size={16} color={C.white} />
          </button>
        </div>

        {/* Bottom row: actions + counter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ActionButton
              icon={<PaperclipIcon size={14} color={C.gray} />}
              label="Attach"
            />
            <ActionButton
              icon={<MicIcon size={14} color={C.gray} />}
              label="Voice"
            />
            <ActionButton
              icon={<SearchIcon size={14} color={C.gray} />}
              label="Prompts"
            />
          </div>
          <span
            style={{
              fontFamily: "'Schibsted Grotesk', sans-serif",
              fontSize: 12,
              color: "#9b9b9b",
            }}
          >
            0/3,000
          </span>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label }) {
  return (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: C.lightGray,
        border: "none",
        borderRadius: 6,
        padding: "6px 10px",
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        fontSize: 13,
        color: C.gray,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero content                                                       */
/* ------------------------------------------------------------------ */
function HeroContent() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 120px",
        paddingTop: 60, // gap between navigation and hero
        marginTop: -50, // hero content moved up 50px
        boxSizing: "border-box",
        position: "relative",
        zIndex: 2,
      }}
    >
      <Badge />

      <h1
        className="hero-title"
        style={{
          margin: 0,
          marginTop: 34, // badge to title
          fontFamily: "'Fustat', sans-serif",
          fontWeight: 700,
          fontSize: 80,
          letterSpacing: "-4.8px",
          lineHeight: 1,
          color: C.black,
          textAlign: "center",
        }}
      >
        Transform Data Quickly
      </h1>

      <p
        className="hero-sub"
        style={{
          margin: 0,
          marginTop: 34, // title to subtitle
          fontFamily: "'Fustat', sans-serif",
          fontWeight: 500,
          fontSize: 20,
          letterSpacing: "-0.4px",
          color: C.gray,
          textAlign: "center",
          width: "min(542px, 100%)",
          maxWidth: 736,
        }}
      >
        Upload your information and get powerful insights right away. Work
        smarter and achieve goals effortlessly.
      </p>

      <div
        style={{
          marginTop: 44,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <SearchBox />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Root                                                               */
/* ------------------------------------------------------------------ */
export default function HeroSection() {
  // Load required fonts
  useEffect(() => {
    const id = "hero-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&family=Fustat:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: C.white,
      }}
    >
      {/* Scoped styles: placeholder color + responsive scaling */}
      <style>{`
        .hero-input::placeholder { color: rgba(0,0,0,0.6); }
        @media (max-width: 900px) {
          .hero-nav { padding-left: 32px !important; padding-right: 32px !important; }
          .hero-content-pad { padding-left: 32px !important; padding-right: 32px !important; }
          .hero-menu { display: none !important; }
          .hero-title { font-size: 48px !important; letter-spacing: -2.4px !important; }
          .hero-sub { font-size: 18px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          video { opacity: 1 !important; }
        }
      `}</style>

      <VideoBackground />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navigation />
        <div className="hero-content-pad" style={{ flex: 1, display: "flex" }}>
          <HeroContent />
        </div>
      </div>
    </div>
  );
}
