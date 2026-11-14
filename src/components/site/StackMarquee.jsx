import {
  SiDotnet,
  SiPostgresql,
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiDocker,
  SiSupabase,
  SiNginx,
  SiTailwindcss,
  SiGithubactions,
  SiFedora,
} from 'react-icons/si';
import { TbBrandCSharp } from 'react-icons/tb';
import { FaAws } from 'react-icons/fa';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Logos reais das marcas (react-icons/si), só logo e nome, sem rótulo de categoria.
const STACK = [
  { name: 'C#', icon: TbBrandCSharp },
  { name: '.NET', icon: SiDotnet },
  { name: 'PostgreSQL', icon: SiPostgresql },
  { name: 'Next.js', icon: SiNextdotjs },
  { name: 'React', icon: SiReact },
  { name: 'TypeScript', icon: SiTypescript },
  { name: 'Docker', icon: SiDocker },
  { name: 'AWS', icon: FaAws },
  { name: 'Supabase', icon: SiSupabase },
  { name: 'nginx', icon: SiNginx },
  { name: 'GitHub Actions', icon: SiGithubactions },
  { name: 'Tailwind CSS', icon: SiTailwindcss },
  { name: 'Fedora Linux', icon: SiFedora },
];

function Row({ hidden = false }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-3 pr-3">
      {STACK.map(({ name, icon: Icon }) => (
        <li
          key={name}
          className="glass-inset flex items-center gap-2.5 rounded-full px-4 py-2.5 text-base font-medium whitespace-nowrap text-foreground/85"
        >
          <Icon className="size-[18px] text-foreground/70" aria-hidden="true" />
          {name}
        </li>
      ))}
    </ul>
  );
}

export default function StackMarquee({ label }) {
  const track = useRef(null);

  // A esteira responde à rolagem: acelera com a velocidade do scroll (e inverte
  // ao rolar para cima), depois volta sozinha ao ritmo normal. O movimento base
  // continua sendo a animação CSS; aqui só muda a taxa de reprodução dela.
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const animation = track.current.getAnimations()[0];
      if (!animation) return;
      const rate = { value: 1 };
      const apply = () => {
        animation.playbackRate = rate.value;
      };
      const trigger = ScrollTrigger.create({
        trigger: track.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const boost = gsap.utils.clamp(-6, 6, self.getVelocity() / 350);
          gsap.to(rate, {
            value: Math.abs(boost) < 0.4 ? 1 : boost,
            duration: 0.3,
            overwrite: true,
            onUpdate: apply,
            onComplete: () => gsap.to(rate, { value: 1, duration: 1.2, ease: 'power2.out', onUpdate: apply }),
          });
        },
      });
      return () => {
        trigger.kill();
        animation.playbackRate = 1;
      };
    });
  });

  return (
    <section aria-label={label} className="marquee overflow-hidden py-2">
      <div ref={track} className="marquee__track">
        <Row />
        <Row hidden />
      </div>
    </section>
  );
}
