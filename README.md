# ⚡ Santos Soluções | Hub de Utilitários & Portfólio

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_8-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router_7-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP_3-0AE448?style=for-the-badge&logo=greensock&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-VPS-222222?style=for-the-badge&logo=nginx&logoColor=009639)

Um ambiente híbrido que funciona tanto como portfólio pessoal quanto como uma suíte de ferramentas para desenvolvedores (inspirado no modelo 4Devs). Construído com foco em performance, experiência de usuário e processamento local.

O design adota uma estética *Dark/Tech* (preto e azul), com painéis de vidro, um console interativo no hero e referências a interfaces de linha de comando (CLI). A interface é "montada" na frente do visitante: cursores de agentes trazem cada bloco até o lugar, na abertura da página e conforme a rolagem.

> **🌐 Demo online:** [vinnisantos.com.br](https://vinnisantos.com.br/)

---

## 🛠️ Módulos de Ferramentas Implementados

O hub conta com geradores e validadores de dados frequentemente utilizados no desenvolvimento e teste de software no Brasil. Todos os cálculos são processados localmente no navegador, sem envio de dados para servidores.

* **Validador de Email:** Checagem de sintaxe e formatos válidos.
* **Gerador/Validador de CPF:** Implementação do algoritmo oficial da Receita Federal (dígitos verificadores).
* **Gerador/Validador de CNPJ:** Geração de matrizes (0001) com cálculos matemáticos reais de validação.
* **Buscador de CEP:** Integração com a API ViaCEP para localização de endereços.
* **Validador de Telefone:** Formatação automática para o padrão nacional (DDD + 9 dígitos).
* **Gerador de Dados Fake:** Criação de personas completas (Nome, Email, CPF, Telefone e Endereço) para popular bancos de dados de teste.

---

## 💻 Stack Tecnológica

* **Framework:** React.js 19
* **Bundler:** Vite 8
* **Estilização:** Tailwind CSS v4 (com design tokens customizados)
* **Roteamento:** React Router DOM v7 (SPA architecture)
* **Animação:** GSAP 3 + ScrollTrigger (`@gsap/react`), Lenis para rolagem suave e Motion em interações pontuais
* **Componentes animados:** React Bits (`ScrollReveal`, `Magnet`), baixados do registro para `src/components/reactbits`
* **Ícones:** Phosphor Icons e React Icons (Simple Icons, Tabler, FontAwesome)
* **Deploy:** VPS com Nginx servindo o build estático

---

## 🚀 Como executar localmente

### Pré-requisitos
* Node.js v18+ (recomendado v20)
* Gerenciador de pacotes (NPM, Yarn ou PNPM)

### Instalação

```bash
git clone https://github.com/vinnisntos/port_vinni.git
cd port_vinni
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

### Build de produção

```bash
npm run build      # gera ./dist
npm run preview    # serve ./dist localmente para teste
```

---

## ✨ Animações e rolagem

* **Montagem por agentes:** ao abrir uma página, cursores com nome (`agent·01`…) arrastam as peças da primeira tela até o lugar (`src/components/site/AssembleIntro.jsx`). Ao rolar, cada bloco que entra na tela é colocado da mesma forma (`Reveal.jsx` + `src/lib/agents.js`), com no máximo três cursores por vez; o excedente desliza da lateral.
* **Rolagem suave:** Lenis sincronizado com o ticker do GSAP (`SmoothScroll.jsx`). Toda rolagem programática (topo, âncoras, paleta de comandos) passa por `src/lib/scroll.js`.
* **Fundo em camadas:** aurora, trechos de código e símbolos flutuantes em parallax, reagindo à rolagem e ao cursor (`Backdrop.jsx`).
* **Home:** hero que se afasta ao rolar, projetos em cards empilhados (sticky), esteira da stack que acelera com o scroll e barra de progresso de leitura.
* **Sobre:** experiência em linha do tempo que se desenha com a rolagem.
* **Movimento reduzido:** com `prefers-reduced-motion`, nada disso roda e a rolagem fica nativa.

Para usar um `Reveal` novo, basta embrulhar o bloco; `RevealGroup` aplica o mesmo a todos os filhos diretos de um contêiner.

---

## ☁️ Deploy (VPS + Nginx)

O site roda numa VPS e é servido pelo Nginx no domínio próprio `vinnisantos.com.br`. Não há deploy automático: o push na `main` não publica nada.

Na VPS, o repositório fica clonado em `/var/www/portifolio/port_vinni` e o `root` do Nginx aponta para a pasta `dist` dentro dele. O build é feito na máquina local e enviado pronto (a VPS não tem `node_modules`):

```bash
# 1. build local (gera ./dist, com um HTML por rota via scripts/prerender.mjs)
npm run build

# 2. envia o build para uma pasta temporária na VPS (host configurado em ~/.ssh/config)
scp -r dist oracle-vps:/var/www/portifolio/port_vinni/dist.new

# 3. na VPS: mantém os assets antigos, guarda o build anterior e troca
ssh oracle-vps '
  cd /var/www/portifolio/port_vinni &&
  cp -n dist/assets/* dist.new/assets/ &&
  mv dist dist.bak.$(date +%Y%m%d%H%M%S) &&
  mv dist.new dist &&
  git pull --ff-only origin main
'
```

* **Assets antigos:** os arquivos em `assets/` têm hash no nome e cache de 1 ano. Copiar os antigos para o build novo evita 404 para quem está com uma aba aberta na versão anterior.
* **Rollback:** cada deploy deixa um `dist.bak.<data>`; para voltar, basta trocar as pastas de novo. Vale apagar os backups antigos de vez em quando.
* **Rotas:** o Nginx resolve as rotas da SPA com `try_files $uri $uri.html /index.html` — ver referência em [`deploy/nginx.conf`](./deploy/nginx.conf).
* **HTTPS:** certificado gerenciado na própria VPS pelo Certbot, fora do escopo deste repositório.

---

## 🎨 Princípios de Design

* **Hierarquia visual:** títulos com peso/gradiente, separação clara entre seções.
* **Acessibilidade:** `lang="pt-BR"`, `aria-labels` em botões de ícone, `role="status"` em feedback, contraste mínimo AA em texto muted e respeito a `prefers-reduced-motion` em todas as animações.
* **Consistência:** `PageHeader` reutilizável, paleta centralizada em `@theme` do Tailwind v4.
* **Performance:** CSS purged, JS com tree-shake, preconnect para ViaCEP.

---

## 👨‍💻 Sobre o Autor

Desenvolvido por **Vinnicius Santos**, estudante de Análise e Desenvolvimento de Sistemas. Focado na criação de interfaces robustas, engenharia de software e soluções que facilitam o dia a dia de outros desenvolvedores.

> *"Transformando lógica bruta em soluções reais."*