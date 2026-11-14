import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Trechos de código das decisões de arquitetura dos projetos (MarcAi, Mocidade,
// PendurAi, Life OS, Agenda e o próprio deploy deste site), espalhados pelo
// fundo. É textura: fica bem apagado e atrás do vidro.
const SNIPPETS = [
  { code: 'EXCLUDE USING gist (profissional_id WITH =, periodo WITH &&);', x: '4%', y: '9%', d: 0 },
  { code: 'await using var tx = await conn.BeginTransactionAsync(IsolationLevel.Serializable);', x: '52%', y: '4%', d: 4 },
  { code: 'var signature = HMACSHA256.HashData(secret, payload);', x: '62%', y: '24%', d: 9 },
  { code: 'WHERE tenant_id = @TenantId', x: '8%', y: '30%', d: 2 },
  { code: 'CREATE POLICY own_rows ON entries USING (user_id = auth.uid());', x: '30%', y: '44%', d: 6 },
  { code: 'const code = hotp(secret, Math.floor(Date.now() / 30_000));', x: '58%', y: '54%', d: 11 },
  { code: "INSERT INTO ledger (tipo, valor) VALUES ('sangria', -50.00);", x: '3%', y: '60%', d: 7 },
  { code: 'try_files $uri $uri.html /index.html;', x: '70%', y: '40%', d: 3 },
  { code: 'docker save app | gzip | ssh oracle-vps deploy', x: '22%', y: '18%', d: 13 },
  { code: "await supabase.rpc('aprovar_orcamento', { id });", x: '40%', y: '72%', d: 8 },
  { code: 'SELECT pg_advisory_xact_lock(hashtext(@Slot));', x: '12%', y: '82%', d: 5 },
  { code: 'git push origin main && gh run watch', x: '60%', y: '90%', d: 10 },
];

// Símbolos soltos que flutuam em três profundidades. `s` é o tamanho em rem,
// `depth` escolhe a camada (0 = fundo, 2 = perto).
const GLYPHS = [
  { text: '{ }', x: '1.5%', y: '7%', s: 5, depth: 2, d: 0 },
  { text: '</>', x: '84%', y: '12%', s: 4, depth: 1, d: 3 },
  { text: '=>', x: '72%', y: '34%', s: 6, depth: 2, d: 6 },
  { text: '[ ]', x: '18%', y: '42%', s: 3.5, depth: 0, d: 2 },
  { text: '&&', x: '90%', y: '56%', s: 4.5, depth: 1, d: 8 },
  { text: '::', x: '4%', y: '66%', s: 5.5, depth: 1, d: 5 },
  { text: '0x1F', x: '46%', y: '26%', s: 2.5, depth: 0, d: 9 },
  { text: '( )', x: '62%', y: '76%', s: 5, depth: 2, d: 1 },
  { text: '!=', x: '28%', y: '86%', s: 4, depth: 0, d: 7 },
  { text: '/**/', x: '80%', y: '92%', s: 3, depth: 1, d: 4 },
];

const KEYWORDS = /\b(await|using|var|const|WHERE|CREATE|POLICY|ON|USING|INSERT|INTO|VALUES|EXCLUDE|WITH|SELECT)\b/;

// Realce mínimo: palavras-chave em azul, o resto em tom de comentário.
function Highlight({ code }) {
  return code.split(/(\s+|[(),;])/).map((part, i) =>
    KEYWORDS.test(part) ? (
      <span key={i} className="text-[var(--syntax-keyword)]">
        {part}
      </span>
    ) : (
      part
    )
  );
}

function CodeLayer({ items, speed }) {
  return (
    <div className="aurora__layer aurora__code hidden md:block" data-speed={speed}>
      {items.map((s) => (
        <code key={s.code} style={{ left: s.x, top: s.y, animationDelay: `-${s.d}s` }}>
          <Highlight code={s.code} />
        </code>
      ))}
    </div>
  );
}

/**
 * Fundo fixo do site: a aurora que o vidro desfoca, a matriz de pontos no
 * topo, o código e os símbolos flutuantes e a granulação, tudo atrás do
 * conteúdo e fora da árvore de acessibilidade.
 *
 * As camadas têm profundidades diferentes: cada uma sobe numa velocidade
 * própria conforme a página rola (data-speed) e desvia um pouco do cursor
 * (data-pointer). O movimento contínuo (deriva, flutuação) é CSS.
 */
export default function Backdrop() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Rolagem: cada camada percorre uma fração da própria altura extra.
        gsap.utils.toArray('[data-speed]').forEach((layer) => {
          gsap.to(layer, {
            yPercent: -Number(layer.dataset.speed),
            ease: 'none',
            scrollTrigger: { start: 0, end: 'max', scrub: 0.6 },
          });
        });

        // A aurora muda de lugar e de tom ao longo da página.
        gsap.to('.aurora__blobs', {
          rotate: 28,
          scale: 1.15,
          ease: 'none',
          scrollTrigger: { start: 0, end: 'max', scrub: 1 },
        });
      });

      // Cursor: só com ponteiro fino (mouse), e sem movimento reduzido.
      mm.add('(prefers-reduced-motion: no-preference) and (pointer: fine)', () => {
        const movers = gsap.utils.toArray('[data-pointer]').map((el) => ({
          strength: Number(el.dataset.pointer),
          x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }),
          y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' }),
        }));
        const onMove = (event) => {
          const nx = event.clientX / window.innerWidth - 0.5;
          const ny = event.clientY / window.innerHeight - 0.5;
          movers.forEach((m) => {
            m.x(-nx * m.strength);
            m.y(-ny * m.strength);
          });
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="aurora" aria-hidden="true">
      <div className="aurora__blobs">
        <div className="aurora__blob aurora__blob--1" />
        <div className="aurora__blob aurora__blob--2" />
        <div className="aurora__blob aurora__blob--3" />
      </div>
      <div className="aurora__matrix" />

      {/* Código em duas profundidades: o de trás anda menos que o da frente */}
      <div data-pointer="14" className="absolute inset-0">
        <CodeLayer items={SNIPPETS.filter((_, i) => i % 2 === 0)} speed={18} />
      </div>
      <div data-pointer="30" className="absolute inset-0">
        <CodeLayer items={SNIPPETS.filter((_, i) => i % 2 === 1)} speed={34} />
      </div>

      {/* Símbolos flutuantes em três profundidades */}
      {[0, 1, 2].map((depth) => (
        <div key={depth} data-pointer={12 + depth * 22} className="absolute inset-0">
          <div className={`aurora__layer aurora__glyphs aurora__glyphs--${depth}`} data-speed={14 + depth * 16}>
            {GLYPHS.filter((g) => g.depth === depth).map((g) => (
              <span key={g.text} style={{ left: g.x, top: g.y, fontSize: `${g.s}rem`, animationDelay: `-${g.d}s` }}>
                {g.text}
              </span>
            ))}
          </div>
        </div>
      ))}

      <div className="aurora__grain" />
    </div>
  );
}
