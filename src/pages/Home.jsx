import { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight, ArrowUpRight, DownloadSimple } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { slugify } from '@/lib/utils';
import GlassCard from '../components/site/GlassCard';
import Reveal from '../components/site/Reveal';
import ScrambleText from '../components/site/ScrambleText';
import HeroConsole from '../components/site/HeroConsole';
import StackMarquee from '../components/site/StackMarquee';
import LiveGenerator from '../components/site/LiveGenerator';
import ScrollReveal from '../components/reactbits/ScrollReveal/ScrollReveal';
import Magnet from '../components/reactbits/Magnet/Magnet';
import Seo from '../components/Seo';
import { itemListSchema, personNode, PERSON_ID } from '../utils/seo';
import { projectsContent } from '../content/projects';
import { toolsPt, toolsEn } from '../content/tools';
import { homeContent } from '../content/home';
import { useLocale, getLocalizedPath } from '../hooks/useLocale';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SITE_URL = 'https://vinnisantos.com.br';

// Projetos da pilha: os que têm sistema público para mostrar em imagem.
const FEATURED = ['PendurAi', 'Life OS', 'Agenda Osvair'];

function homeSchema(locale, path, tools) {
  const toolList = itemListSchema({
    name: locale === 'en' ? 'Developer tools' : 'Ferramentas para desenvolvedores',
    items: tools.map((tool) => ({ name: tool.title, path: tool.path })),
  });
  delete toolList['@context'];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Vinnicius Santos',
        inLanguage: ['pt-BR', 'en-US'],
        author: { '@id': PERSON_ID },
      },
      {
        '@type': 'ProfilePage',
        url: `${SITE_URL}${path}`,
        mainEntity: { '@id': PERSON_ID },
      },
      personNode(locale),
      toolList,
    ],
  };
}

function Hero({ t, projectsHref, locale }) {
  const heroRef = useRef(null);

  // Saída do hero: enquanto a seção rola para fora, o texto sobe e apaga e o
  // console afunda um pouco, em velocidades diferentes (profundidade).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1024px)', () => {
        const scrollTrigger = { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true };
        gsap.to('[data-hero-copy]', { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger });
        gsap.to('[data-hero-console]', { yPercent: 10, scale: 0.92, opacity: 0.35, ease: 'none', scrollTrigger });
      });
    },
    { scope: heroRef }
  );
  return (
    <section
      ref={heroRef}
      className="grid min-h-[100dvh] grid-cols-1 items-center gap-12 pt-28 pb-12 lg:grid-cols-12 lg:gap-10 lg:pt-24"
    >
      <div data-hero-copy className="lg:col-span-6">
        {/* O único rótulo do hero: um prompt de shell, o "comando" que gera o nome abaixo */}
        {/* As peças do hero (data-assemble) são colocadas pelos cursores na abertura */}
        <p data-assemble className="mb-6 font-mono text-sm text-muted-foreground md:text-base">
          <span className="text-[var(--syntax-string)]">~/vinnicius</span>
          <span className="text-primary"> $ </span>
          whoami
        </p>
        <h1 data-assemble className="text-[clamp(3.4rem,7.2vw,6.6rem)] leading-[0.9] font-bold tracking-[-0.05em] text-foreground">
          <ScrambleText text="Vinnicius" className="block" />
          <span className="flex items-end gap-[0.06em]">
            <ScrambleText text="Santos" startDelay={350} />
            <span aria-hidden="true" className="caret mb-[0.12em] inline-block h-[0.72em] w-[0.09em] bg-primary" />
          </span>
        </h1>

        <p data-assemble className="mt-8 max-w-[34rem] text-lg leading-relaxed text-foreground/80 md:text-xl">
          {t.heroLead}
        </p>

        <div data-assemble className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg" className="group font-mono">
            <Link to={projectsHref}>
              <ScrambleText text={t.ctaProjects} trigger="hover" />
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" weight="bold" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="group font-mono">
            <a href={`${import.meta.env.BASE_URL}${t.resumeFile}`} download={t.resumeDownloadName}>
              <span aria-hidden="true" className="text-primary">$</span>
              <ScrambleText text={t.ctaResume} trigger="hover" />
              <DownloadSimple className="transition-transform duration-300 group-hover:translate-y-0.5" weight="bold" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>

      <div id="console" data-assemble className="scroll-mt-28 lg:col-span-6">
        {/* Camada própria para o parallax de saída: a de fora é a peça da abertura */}
        <div data-hero-console className="origin-top">
          <HeroConsole locale={locale} />
        </div>
      </div>
    </section>
  );
}

// Card da pilha de projetos: captura de um lado, decisões de arquitetura do outro.
function ProjectCard({ project, href, t, index }) {
  const shot = { src: project.image, width: 1440, height: 900 };

  return (
    <article data-stack-card style={{ '--stack-index': index }} className="stack-card rounded-[var(--radius-panel)]">
      {/* O Reveal fica por dentro: o <article> é grudado e escalado pelo GSAP da pilha */}
      <Reveal>
      <Link
        to={href}
        className="group block rounded-[var(--radius-panel)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <GlassCard spotlight className="grid grid-cols-1 gap-6 p-3 md:p-3 lg:grid-cols-12 lg:gap-8">
          <div className="overflow-hidden rounded-[calc(var(--radius-panel)-8px)] lg:col-span-7">
            {/* Camada do parallax (GSAP): separada da <img>, que tem transição de hover própria */}
            <div data-parallax>
              <img
                src={shot.src}
                alt={t.projectsShotAlt(project.name)}
                width={shot.width}
                height={shot.height}
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 px-3 pb-4 lg:col-span-5 lg:justify-center lg:py-6 lg:pr-6 lg:pl-0">
            <p className="font-mono text-sm text-muted-foreground tabular-nums">
              <span className="text-primary">{String(index + 1).padStart(2, '0')}</span> / {project.stack[0]}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">{project.name}</h3>
              <Badge variant="signal">{project.status}</Badge>
            </div>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{project.kind}</p>
            <ul className="mt-1 grid gap-2">
              {project.decisions.slice(0, 3).map((decision) => (
                <li key={decision.title} className="glass-inset rounded-xl px-4 py-3 text-sm leading-snug text-foreground/90">
                  {decision.title}
                </li>
              ))}
            </ul>
            <span className="mt-2 inline-flex items-center gap-2 font-mono text-sm text-primary">
              {t.ctaProjects}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" weight="bold" aria-hidden="true" />
            </span>
          </div>
        </GlassCard>
      </Link>
      </Reveal>
    </article>
  );
}

export default function Home() {
  const locale = useLocale();
  const { pathname } = useLocation();
  const t = homeContent[locale];
  const tools = locale === 'en' ? toolsEn : toolsPt;
  const projectsHref = locale === 'en' ? '/en/projects' : '/projects';
  const allProjects = projectsContent[locale].projects;
  const featured = FEATURED.map((name) => allProjects.find((p) => p.name === name));
  const currentPath = locale === 'en' ? '/en' : '/';
  const projectsRef = useRef(null);

  // Parallax das capturas: cada uma desliza alguns % enquanto o card cruza a tela.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Mesma condição do CSS que deixa os cards grudados (.stack-card).
      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (min-height: 760px)', () => {
        // Pilha: enquanto o próximo card desliza por cima, o de baixo encolhe e
        // escurece. As posições saem das alturas (e não do getBoundingClientRect
        // de cada card) porque um card grudado (sticky) está fora do lugar natural.
        const cards = gsap.utils.toArray('[data-stack-card]');
        const stack = cards[0]?.parentElement;
        const stickyTop = (card) => parseFloat(getComputedStyle(card).top) || 0;
        const naturalTop = (index) => {
          const gap = parseFloat(getComputedStyle(stack).rowGap) || 0;
          const above = cards.slice(0, index).reduce((sum, card) => sum + card.offsetHeight + gap, 0);
          return stack.getBoundingClientRect().top + window.scrollY + above;
        };
        cards.slice(0, -1).forEach((card, i) => {
          // O brilho parte de um valor explícito: saindo de "none", o GSAP
          // interpolaria a partir de brightness(0) e o card piscaria preto.
          gsap.fromTo(card, { scale: 1, filter: 'brightness(1)' }, {
            scale: 0.95 - (cards.length - 2 - i) * 0.02,
            filter: 'brightness(0.7)',
            ease: 'none',
            scrollTrigger: {
              start: () => naturalTop(i + 1) - (stickyTop(card) + card.offsetHeight),
              end: () => naturalTop(i + 1) - stickyTop(cards[i + 1]),
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('[data-parallax]').forEach((layer) => {
          gsap.fromTo(
            layer,
            { yPercent: -4, scale: 1.1 },
            {
              yPercent: 4,
              scale: 1.1,
              ease: 'none',
              scrollTrigger: { trigger: layer.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
            }
          );
        });
      });
    },
    { scope: projectsRef }
  );

  return (
    <div>
      <Seo
        title={t.seo.title}
        description={t.seo.description}
        path={currentPath}
        lang={locale === 'en' ? 'en-US' : 'pt-BR'}
        structuredData={homeSchema(locale, currentPath, tools)}
        alternates={[
          { hreflang: 'pt-BR', href: SITE_URL + getLocalizedPath(pathname, 'pt') },
          { hreflang: 'en-US', href: SITE_URL + getLocalizedPath(pathname, 'en') },
          { hreflang: 'x-default', href: SITE_URL + getLocalizedPath(pathname, 'pt') },
        ]}
      />

      <Hero t={t} projectsHref={projectsHref} locale={locale} />

      {/* Stack: o único marquee da página */}
      <Reveal className="-mx-4 md:-mx-8">
        <StackMarquee label={t.stackLabel} />
      </Reveal>

      {/* Projetos: bento com capturas reais */}
      <section ref={projectsRef} aria-labelledby="projects-heading" className="mt-32 md:mt-44">
        {/* React Bits ScrollReveal: as palavras do título desfocam e acendem conforme a rolagem */}
        <Reveal>
        <ScrollReveal
          id="projects-heading"
          baseRotation={0}
          baseOpacity={0.15}
          blurStrength={6}
          wordAnimationEnd="bottom 60%"
          containerClassName="my-0 max-w-3xl"
          textClassName="text-4xl leading-[1.02] font-bold tracking-[-0.035em] md:text-6xl"
        >
          {t.projectsTitle}
        </ScrollReveal>
        </Reveal>
        <Reveal delay={0.07}>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{t.projectsLead}</p>
        </Reveal>

        {/* Pilha de projetos: cada card gruda e o seguinte desliza por cima */}
        <div className="mt-12 flex flex-col gap-6 lg:gap-10">
          {featured.map((project, i) => (
            <ProjectCard
              key={project.name}
              project={project}
              href={`${projectsHref}#${slugify(project.name)}`}
              t={t}
              index={i}
            />
          ))}
        </div>

        <div className="mt-6 lg:mt-10">
          <Reveal>
            <Link
              to={projectsHref}
              className="group flex flex-col gap-4 rounded-[var(--radius-panel)] bg-primary p-7 text-primary-foreground transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-primary-hover active:scale-[0.99] md:flex-row md:items-center md:justify-between md:p-10"
            >
              <span>
                <span className="block text-3xl font-bold tracking-[-0.03em] md:text-4xl">
                  {t.projectsAll(allProjects.length)}
                </span>
                <span className="mt-2 block text-base text-primary-foreground/75">{t.projectsAllHint}</span>
              </span>
              {/* React Bits Magnet: a seta é atraída pelo cursor quando ele chega perto */}
              <Magnet padding={70} magnetStrength={3} wrapperClassName="shrink-0">
                <span className="flex size-14 items-center justify-center rounded-full bg-primary-foreground text-primary">
                  <ArrowRight className="size-6" weight="bold" aria-hidden="true" />
                </span>
              </Magnet>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Ferramentas: lista + elemento vivo */}
      <section aria-labelledby="tools-heading" className="mt-32 grid grid-cols-1 gap-12 md:mt-44 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal>
          <ScrollReveal
            id="tools-heading"
            baseRotation={0}
            baseOpacity={0.15}
            blurStrength={6}
            wordAnimationEnd="bottom 60%"
            containerClassName="my-0"
            textClassName="text-4xl leading-[1.02] font-bold tracking-[-0.035em] md:text-5xl"
          >
            {t.toolsTitle}
          </ScrollReveal>
          </Reveal>
          <Reveal delay={0.07}>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">{t.toolsLead}</p>
          </Reveal>
          <ul className="mt-10 grid gap-1">
            {tools.map((tool, i) => (
              <Reveal as="li" key={tool.path} delay={0.08 + i * 0.05}>
                <Link
                  to={tool.path}
                  aria-label={t.toolAriaLabel(tool.title)}
                  className="group flex items-center gap-4 rounded-xl px-3 py-3 transition-colors duration-300 hover:bg-white/5"
                >
                  <span className="glass-inset flex size-11 shrink-0 items-center justify-center rounded-full text-primary">
                    <tool.icon className="size-5" weight="duotone" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-foreground">{tool.title}</span>
                    <span className="block text-sm text-muted-foreground md:truncate">{tool.description}</span>
                  </span>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-muted-foreground transition-[transform,color] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                    weight="bold"
                    aria-hidden="true"
                  />
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={0.12} className="lg:col-span-7 lg:pt-28">
          <LiveGenerator t={t.live} />
        </Reveal>
      </section>
    </div>
  );
}
