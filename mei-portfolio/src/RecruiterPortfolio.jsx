import React, { useMemo, useState } from "react";

const DEFAULT_RESUME_URL = `${import.meta.env.BASE_URL || "/"}resume.pdf`;

const cx = (...xs) => xs.filter(Boolean).join(" ");

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
      ? "bg-zinc-50 text-zinc-950 hover:bg-white focus-visible:ring-white"
      : variant === "soft"
        ? "bg-white/10 text-zinc-50 hover:bg-white/15 border border-white/10 focus-visible:ring-white/60"
        : "bg-transparent text-zinc-50 hover:bg-white/10 border border-white/15 focus-visible:ring-white/60";

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
    <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-200">
      {children}
    </span>
  );
}

export default function RecruiterPortfolio({ resumeUrl = DEFAULT_RESUME_URL }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const baseUrl = import.meta.env.BASE_URL || "/";
  const rpgHref = `${baseUrl}?mode=rpg`;

  const profile = useMemo(
    () => ({
      name: "Mei Yi Yang",
      headline: "Software Engineer • Game Engine / Gameplay • UI polish",
      blurb:
        "I build interactive, shippable experiences—recently a 3D mini‑adventure game and a growing 3D modeling gallery—alongside product‑grade web and tooling work. I care about feel (controls/UX), performance, and clear, maintainable systems.",
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
        items: ["Python", "C++", "JavaScript", "Java", "SQL"],
      },
      {
        group: "Game / Engine",
        items: [
          "Unity (C#)",
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
        items: ["Linux", "Distributed concepts", "Debugging (GDB)", "Databases"],
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
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-white selection:text-zinc-950">
      <a
        id="top"
        href="#top"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-zinc-900 focus:px-3 focus:py-2 focus:ring-2 focus:ring-white"
      >
        Skip to top
      </a>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/75 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            <a href="#top" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/10">
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
                className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
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
              <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
                <a href="#about" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/10">
                  About
                </a>
                <a href="#skills" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/10">
                  Skills
                </a>
                <a href="#work" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/10">
                  Work
                </a>
                <a href="#portfolios" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/10">
                  Links
                </a>
                <a href="#contact" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/10">
                  Contact
                </a>
                <div className="h-px bg-white/10 my-1" />
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
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="font-medium text-zinc-50">What you get</div>
                    <ul className="mt-2 grid gap-1.5 list-disc pl-5">
                      <li>Impact-first communication: metrics, trade-offs, outcomes.</li>
                      <li>Engineering range: ML evaluation + product-grade UI.</li>
                      <li>Creative instincts: design taste, storytelling, polish.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5">
                <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-5">
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

                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-zinc-300">
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
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 leading-relaxed text-zinc-200">
                <p>
                  I’m a software engineer who enjoys building interactive systems end-to-end: from
                  core mechanics and tools to UI, iteration loops, and performance. I’m happiest
                  when I can prototype quickly, then tighten things into something shippable and
                  readable.
                </p>
                <p className="mt-3">
                  I’m currently focusing more on{" "}
                  <span className="text-white font-medium">game engine / gameplay development</span>{" "}
                  while bringing along strong web + tooling instincts.
                </p>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
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
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
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
              <div key={x.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
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

        <Section id="portfolios" eyebrow="Easy access" title="Resume, game, and 3D models">
          <div className="grid gap-4 md:grid-cols-3">
            {portfolios.map((c) => (
              <div
                key={c.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 flex flex-col"
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
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-semibold text-zinc-50">Email</div>
              <a className="mt-2 inline-block text-sm text-zinc-200 underline underline-offset-4 hover:text-white" href={profile.links.email}>
                {profile.links.email.replace("mailto:", "")}
              </a>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-semibold text-zinc-50">LinkedIn</div>
              <a className="mt-2 inline-block text-sm text-zinc-200 underline underline-offset-4 hover:text-white" href={profile.links.linkedin} target="_blank" rel="noreferrer">
                /in/meiyy
              </a>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-semibold text-zinc-50">GitHub</div>
              <a className="mt-2 inline-block text-sm text-zinc-200 underline underline-offset-4 hover:text-white" href={profile.links.github} target="_blank" rel="noreferrer">
                github.com/mayozoz
              </a>
            </div>
          </div>
        </Section>
      </main>

      <footer className="border-t border-white/10 py-10">
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
  );
}

