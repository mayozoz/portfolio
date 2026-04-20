import React, { useMemo, useState } from "react";

const DEFAULT_RESUME_URL = `${import.meta.env.BASE_URL || "/"}resume.pdf`;

const cx = (...xs) => xs.filter(Boolean).join(" ");

function Background({ parallax }) {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const bg1 = `${base}/sprites/background1.jpg`;
  const bg2 = `${base}/sprites/background2.jpg`;

  const strength = 40;
  const tx = -(parallax.x * strength);
  const ty = -(parallax.y * strength);

  const sharedLayer = {
    transform: `translate3d(${tx}px, ${ty}px, 0)`,
    transition: "transform 120ms ease-out",
    willChange: "transform",
    backgroundSize: "100% auto",
    backgroundRepeat: "no-repeat",
  };

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-[-10%]">
        {/* Top image */}
        <div
          className="absolute top-[-15%] left-0 right-0 h-[60%]"
          style={{
            ...sharedLayer,
            backgroundImage: `url(${bg1})`,
            backgroundPosition: "top center",
            filter: "brightness(0.35)",
          }}
        />
        {/* Bottom image */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[35%]"
          style={{
            ...sharedLayer,
            backgroundImage: `url(${bg2})`,
            backgroundPosition: "bottom center",
            filter: "brightness(0.8)",
          }}
        />
      </div>

      {/* Fade bottom of image 1 into dark */}
      <div
        className="absolute top-[25%] left-0 right-0 h-[30%]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(2,6,23, 0), rgb(2,6,23,1))",
        }}
      />

      {/* Fade dark into top of image 2 */}
      <div
        className="absolute bottom-[10%] left-0 right-0 h-[20%]"
        style={{
          background:
            "linear-gradient(to top, rgba(2,6,23, 0), rgb(2,6,23,1))",
        }}
      />
    </div>
  );
}

function Icon({ name, className }) {
  const common = "w-5 h-5";
  switch (name) {
    case "link":
      return (
        <svg
          viewBox="0 0 24 24"
          className={cx(common, className)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10 13a5 5 0 0 0 7.07 0l1.83-1.83a5 5 0 0 0-7.07-7.07L10.5 3.43" />
          <path d="M14 11a5 5 0 0 0-7.07 0L5.1 12.83a5 5 0 0 0 7.07 7.07L13.5 20.57" />
        </svg>
      );
    case "download":
      return (
        <svg
          viewBox="0 0 24 24"
          className={cx(common, className)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="M7 10l5 5 5-5" />
          <path d="M12 15V3" />
        </svg>
      );
    case "sparkles":
      return (
        <svg
          viewBox="0 0 24 24"
          className={cx(common, className)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2l1.5 5L19 8.5l-5.5 1.5L12 15l-1.5-5L5 8.5 10.5 7 12 2z" />
          <path d="M4 14l.8 2.6L7.4 18 4.8 18.8 4 21l-.8-2.2L1 18l2.2-1.4L4 14z" />
          <path d="M19 14l.8 2.6L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-1.4L19 14z" />
        </svg>
      );
    default:
      return null;
  }
}

function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 py-12 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        {eyebrow ? (
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-zinc-50">
          {title}
        </h2>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

function ButtonLink({ href, children, variant = "primary", icon, className }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";
  const styles =
    variant === "primary"
      ? "bg-sky-300 text-slate-950 hover:bg-sky-200 focus-visible:ring-sky-200"
      : variant === "soft"
        ? "bg-slate-900/70 text-zinc-50 hover:bg-slate-900/90 border border-sky-300/30 focus-visible:ring-sky-300/60"
        : "bg-transparent text-zinc-50 hover:bg-slate-900/70 border border-sky-300/40 focus-visible:ring-sky-300/60";

  return (
    <a
      href={href}
      className={cx(base, styles, className)}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noreferrer" : undefined}
    >
      {icon ? <Icon name={icon} className="opacity-80" /> : null}
      {children}
    </a>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-sky-300/25 bg-slate-900/80 px-2 py-1 text-xs text-zinc-200">
      {children}
    </span>
  );
}

export default function RecruiterPortfolio({ resumeUrl = DEFAULT_RESUME_URL }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const baseUrl = import.meta.env.BASE_URL || "/";
  const rpgHref = `${baseUrl}?mode=rpg`;
  const faceSrc = `${baseUrl.replace(/\/$/, "")}/sprites/face.jpg`;
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x, y });
  };

  const profile = useMemo(
    () => ({
      name: "Mei Yi Yang",
      headline: "Software Engineer • Game Engine / Gameplay • UI polish",
      blurb:
        "Hi! My name is Mei. Welcome to my portfolio! I'm a computer science student at the University of Michigan who believes the best things in life come from a little experimentation and chaos — whether that's making bagels at 3am or filming myself to get an animation just right.",
      links: {
        resume: resumeUrl,
        linkedin: "https://www.linkedin.com/in/meiyy",
        github: "https://github.com/mayozoz",
        email: "mailto:mei.yang0508@gmail.com",
        games: "https://runnyeggpie.itch.io/the-boot",
        art3d: "https://eecs298.com/galleries/students/meiyy/gallery.html",
      },
    }),
    [resumeUrl],
  );

  const skills = useMemo(
    () => [
      {
        group: "Languages",
        items: ["Python", "C++", "C#", "HTML", "CSS", "JavaScript", "Java", "SQL"],
      },
      {
        group: "Game / Engine",
        items: [
          "Unity (C#)",
          "Godot (GDScript)",
          
          "Gameplay systems",
          "Tools / editor workflows",
          "Debugging & iteration",
          "3D fundamentals (transforms, cameras, collisions)",
        ],
      },
      {
        group: "AI / ML",
        items: [
          "PyTorch",
          "Transformers",
          "MT evaluation (COMET / chrF++ / BERTScore)",
          "Data tooling (NumPy / Pandas)",
        ],
      },
      {
        group: "Frontend",
        items: ["React", "UX polish", "Tailwind CSS", "Canvas/Web APIs"],
      },
      {
        group: "Systems",
        items: ["Linux", "OSX", "Windows", "Distributed concepts", "Debugging (GDB)", "Databases"],
      },
      {
        group: "Art",
        items: ["Blender", "Procreate", "Aseprite", "Adobe Photoshop", "Adobe Illustrator", "Adobe Animate"],
      },
    ],
    [],
  );

  const experience = useMemo(
    () => [
      {
        title: "AI Engineer — NetEase YouDao",
        bullets: [
          "Machine translation quality estimation for low‑resource pairs.",
          "Built evaluation workflows and analysis using modern metrics + LLM-ranked eval.",
        ],
      },
      {
        title: "Frontend Research Assistant",
        bullets: [
          "React app for zebrafish thrombosis analysis with drag‑and‑drop UX.",
          "Focused on usability for non-technical users and reproducible analysis pipelines.",
        ],
      },
      {
        title: "Cloud Ops / Analytics — Tencent Cloud",
        bullets: [
          "Pricing analytics + competitor benchmarks to support product decisions.",
          "Automated workflows with internal bot integrations.",
        ],
      },
    ],
    [],
  );

  const portfolios = useMemo(() => {
    const cards = [
      {
        title: "Resume",
        desc: "One click to the PDF. Skimmable, impact-first.",
        href: profile.links.resume,
        icon: "download",
        cta: "Open resume",
      },
      {
        title: "3D mini-adventure game",
        desc: "Playable build on itch.io. Short, focused, and interactive.",
        href: profile.links.games,
        icon: "link",
        cta: "Play on itch.io",
      },
      {
        title: "3D models gallery",
        desc: "A growing set of 3D studies and environment models.",
        href: profile.links.art3d,
        icon: "link",
        cta: "Open gallery",
      },
    ];

    return cards;
  }, [profile.links.art3d, profile.links.games, profile.links.resume]);

  return (
    <div
      className="relative min-h-screen text-zinc-50 selection:bg-white selection:text-zinc-950"
      onMouseMove={handleMouseMove}
    >
      <Background parallax={parallax} />

      <div className="relative z-10">
      <a
        id="top"
        href="#top"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-zinc-900 focus:px-3 focus:py-2 focus:ring-2 focus:ring-white"
      >
        Skip to top
      </a>

      <header className="sticky top-0 z-50 border-b border-sky-300/20 bg-slate-950/75 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            <a href="#top" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/80 border border-sky-300/30">
                <Icon name="sparkles" className="w-4 h-4" />
              </span>
              <span className="text-sm font-semibold tracking-tight">
                {profile.name}
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-200">
              <a href="#about" className="hover:text-white">
                About
              </a>
              <a href="#skills" className="hover:text-white">
                Skills
              </a>
              <a href="#work" className="hover:text-white">
                Work
              </a>
              <a href="#demo" className="hover:text-white">
                Demo
              </a>
              <a href="#portfolios" className="hover:text-white">
                Links
              </a>
              <a href="#contact" className="hover:text-white">
                Contact
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                <ButtonLink href={profile.links.resume} variant="primary" icon="download">
                  Resume
                </ButtonLink>
                <ButtonLink href={rpgHref} variant="soft">
                  View archived interactive portfolio
                </ButtonLink>
              </div>

              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center rounded-xl border border-sky-300/30 bg-slate-900/80 px-3 py-2 text-sm hover:bg-slate-900/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
                aria-label="Open menu"
                aria-expanded={menuOpen ? "true" : "false"}
                onClick={() => setMenuOpen((v) => !v)}
              >
                Menu
              </button>
            </div>
          </div>

          {menuOpen ? (
            <div className="md:hidden pb-4">
              <div className="grid gap-2 rounded-2xl border border-sky-300/30 bg-slate-950/90 p-3 text-sm">
                <a href="#about" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-900/80">
                  About
                </a>
                <a href="#skills" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-900/80">
                  Skills
                </a>
                <a href="#work" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-900/80">
                  Work
                </a>
                <a href="#demo" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-900/80">
                  Demo
                </a>
                <a href="#portfolios" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-900/80">
                  Links
                </a>
                <a href="#contact" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-900/80">
                  Contact
                </a>
                <div className="h-px bg-sky-300/25 my-1" />
                <ButtonLink href={profile.links.resume} variant="primary" icon="download" className="w-full">
                  Resume
                </ButtonLink>
                <ButtonLink href={rpgHref} variant="soft" className="w-full">
                  View archived interactive portfolio
                </ButtonLink>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <main>
        <section className="pt-10 md:pt-16 pb-10">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="grid gap-8 md:grid-cols-12 md:items-end">
              <div className="md:col-span-7">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Recruiter-first portfolio
                </p>
                <h1 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">
                  {profile.headline}
                </h1>
                <p className="mt-4 text-zinc-200 leading-relaxed max-w-[60ch]">
                  {profile.blurb}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <ButtonLink href={profile.links.resume} variant="primary" icon="download">
                    Resume (PDF)
                  </ButtonLink>
                  <ButtonLink href={profile.links.linkedin} variant="soft" icon="link">
                    LinkedIn
                  </ButtonLink>
                  <ButtonLink href={profile.links.github} variant="soft" icon="link">
                    GitHub
                  </ButtonLink>
                  <ButtonLink href="#portfolios" variant="ghost">
                    Game + 3D links
                  </ButtonLink>
                </div>

                <div className="mt-6 grid gap-2 text-sm text-zinc-200">
                  <div className="rounded-2xl border border-sky-300/25 bg-slate-950/90 p-4">
                    <div className="font-medium text-zinc-50">What you get</div>
                    <ul className="mt-2 grid gap-1.5 list-disc pl-5">
                      <li>Impact-first communication: metrics, trade-offs, outcomes.</li>
                      <li>Full-stack range: frontend to ML pipelines, React to PyTorch.</li>
                      <li>creative problem-solving: thinking in systems, interactions, and user experience.</li>
                      <li>Self-directed learning: picks up new tools fast — from CUDA to Unity to Blender.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 flex flex-col gap-4 md:items-end">
                <div className="w-full max-w-xs md:max-w-sm">
                  <div className="overflow-hidden rounded-3xl border border-sky-300/35 bg-slate-950/90 shadow-[0_18px_45px_rgba(0,0,0,0.65)]">
                    <img
                      src={faceSrc}
                      alt="Portrait of Mei Yi Yang"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="w-full rounded-3xl border border-sky-300/30 bg-gradient-to-b from-slate-950/80 to-slate-900/80 p-5">
                  <div className="text-sm font-semibold">Fast links</div>
                  <div className="mt-3 grid gap-2">
                    <ButtonLink href={profile.links.resume} variant="primary" icon="download" className="w-full">
                      Open resume
                    </ButtonLink>
                    <ButtonLink href={profile.links.games} variant="soft" icon="link" className="w-full">
                      Play my 3D game
                    </ButtonLink>
                    <ButtonLink href={profile.links.art3d} variant="soft" icon="link" className="w-full">
                      View 3D models
                    </ButtonLink>
                    <ButtonLink href={profile.links.email} variant="ghost" className="w-full">
                      Email
                    </ButtonLink>
                  </div>

                  <div className="mt-4 rounded-2xl border border-sky-300/25 bg-slate-950/90 p-4 text-xs text-zinc-300">
                    Want something fun?{" "}
                    <a className="underline underline-offset-4 hover:text-white" href={rpgHref}>
                      View the archived interactive version
                    </a>{" "}
                    of my portfolio.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Section id="about" eyebrow="Intro" title="About me">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="rounded-3xl border border-sky-300/25 bg-slate-950/90 p-6 leading-relaxed text-zinc-200">
                {/* <p>
                  I'm a computer science student at the University of Michigan who believes the best
                  things in life come from a little experimentation and chaos — whether that's making
                  bagels at 3am or filming myself kicking a chair across the room to get an animation just right.
                </p> */}
                <p className="mt-3">
                  By day, I write code — I've interned at NetEase and Tencent, built distributed
                  systems, and trained ML models. I've developed my own game last semester--which you 
                  can try with the link above--and am currently working to make my own 2d engine. 
                  By night, I'm probably in the kitchen inventing something my friends are both 
                  excited and slightly afraid to try.
                </p>
                <p className="mt-3">
                  When I'm not debugging or cooking, you can find me dancing with K-Motion (UMich's
                  K-pop dance crew 🪩), making posters and running socials as CSA's publicity chair,
                  or doodling future tattoo flash sheets in the margins of my notes. Tattooing is my
                  ultimate side quest — one day I'll poke some ink for real.
                </p>
                <p className="mt-3">
                  I love making things that feel alive: games with worlds you want to wander through,
                  food that surprises you, art that sticks with you (literally, if it's a tattoo). I
                  care about craft, play, and the little details that make someone go "oh, that's
                  cool".
                </p>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-3xl border border-sky-300/25 bg-slate-950/90 p-6">
                <div className="text-sm font-semibold text-zinc-50">Core strengths</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Tag>Evaluation-minded engineering</Tag>
                  <Tag>Human-friendly UX</Tag>
                  <Tag>Clear writing</Tag>
                  <Tag>Debugging &amp; iteration</Tag>
                  <Tag>Design polish</Tag>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section id="skills" eyebrow="Toolbox" title="Skills">
          <div className="grid gap-4 md:grid-cols-2">
            {skills.map((s) => (
              <div
                key={s.group}
                className="rounded-3xl border border-sky-300/25 bg-slate-950/90 p-6"
              >
                <div className="text-sm font-semibold text-zinc-50">{s.group}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.items.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-zinc-400">
            Tip: Update these lists in <code className="text-zinc-200">src/RecruiterPortfolio.jsx</code> so everything stays consistent.
          </div>
        </Section>

        <Section id="work" eyebrow="Signals" title="Experience highlights">
          <div className="grid gap-4 md:grid-cols-3">
            {experience.map((x) => (
              <div key={x.title} className="rounded-3xl border border-sky-300/25 bg-slate-950/90 p-6">
                <div className="text-sm font-semibold text-zinc-50">{x.title}</div>
                <ul className="mt-3 grid gap-2 list-disc pl-5 text-sm text-zinc-200">
                  {x.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section id="demo" eyebrow="Featured demo" title="Game Engines — custom feature">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-8">
              <div
                className="relative w-full overflow-hidden rounded-3xl border border-sky-300/25 bg-slate-950/90"
                style={{ paddingTop: "56.25%" }}
              >
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/9QY-SHEKz_U"
                  title="Custom feature demo — 2D game engine"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
            <div className="md:col-span-4">
              <div className="rounded-3xl border border-sky-300/25 bg-slate-950/90 p-6 text-sm leading-relaxed text-zinc-200">
                <p>
                  Final custom feature for my Game Engines course. Our class built the same 2D
                  engine across the semester; for the final project, each student designed and
                  implemented one feature on top of it.
                </p>
                <p className="mt-3">
                  This clip demos my feature running on the shared engine.
                </p>
                <div className="mt-4">
                  <ButtonLink
                    href="https://youtu.be/9QY-SHEKz_U"
                    variant="soft"
                    icon="link"
                  >
                    Open on YouTube
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section id="portfolios" eyebrow="Easy access" title="Resume, game, and 3D models">
          <div className="grid gap-4 md:grid-cols-3">
            {portfolios.map((c) => (
              <div
                key={c.title}
                className="rounded-3xl border border-sky-300/25 bg-slate-950/90 p-6 flex flex-col"
              >
                <div className="text-sm font-semibold text-zinc-50">{c.title}</div>
                <p className="mt-2 text-sm text-zinc-200 leading-relaxed">{c.desc}</p>
                <div className="mt-4">
                  <ButtonLink href={c.href} variant="soft" icon={c.icon}>
                    {c.cta}
                  </ButtonLink>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="contact" eyebrow="Let’s talk" title="Contact">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-sky-300/25 bg-slate-950/90 p-6">
              <div className="text-sm font-semibold text-zinc-50">Email</div>
              <a className="mt-2 inline-block text-sm text-zinc-200 underline underline-offset-4 hover:text-white" href={profile.links.email}>
                {profile.links.email.replace("mailto:", "")}
              </a>
            </div>
            <div className="rounded-3xl border border-sky-300/25 bg-slate-950/90 p-6">
              <div className="text-sm font-semibold text-zinc-50">LinkedIn</div>
              <a className="mt-2 inline-block text-sm text-zinc-200 underline underline-offset-4 hover:text-white" href={profile.links.linkedin} target="_blank" rel="noreferrer">
                /in/meiyy
              </a>
            </div>
            <div className="rounded-3xl border border-sky-300/25 bg-slate-950/90 p-6">
              <div className="text-sm font-semibold text-zinc-50">GitHub</div>
              <a className="mt-2 inline-block text-sm text-zinc-200 underline underline-offset-4 hover:text-white" href={profile.links.github} target="_blank" rel="noreferrer">
                github.com/mayozoz
              </a>
            </div>
          </div>
        </Section>
      </main>

      <footer className="border-t border-sky-300/20 py-10">
        <div className="mx-auto w-full max-w-6xl px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-zinc-400">
          <div>
            © {new Date().getFullYear()} {profile.name}. Built with React + Tailwind.
          </div>
          <div className="flex flex-wrap gap-3">
            <a className="hover:text-zinc-200" href={profile.links.resume} target="_blank" rel="noreferrer">
              Resume
            </a>
            <a className="hover:text-zinc-200" href={profile.links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className="hover:text-zinc-200" href={profile.links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="hover:text-zinc-200" href={rpgHref}>
              Archived interactive version
            </a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

