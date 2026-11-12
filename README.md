# Cookies da Kels

Landing page + mini e-commerce de cookies artesanais. **Projeto de estudo: todos os dados (nomes, preços, telefone, e-mail, depoimentos, redes sociais) são fictícios.**

HTML5 semântico, um único `main.css` e JavaScript puro. Sem frameworks, sem build, sem estilos inline.

## Como rodar

Abra o `index.html` no navegador. Não precisa de servidor nem de instalação.

> O mapa de contato é um iframe do Google Maps e precisa de internet.

## Estrutura

```
index.html            marcação de toda a página, painéis e sprite de ícones
main.css              todos os estilos (tokens, componentes, breakpoints)
assets/
  js/catalogo.js      dados dos sabores (window.KELS_CATALOGO)
  js/main.js          comportamento: carrinho, painéis, filtros, formulários
  fonts/              Lobster e Montserrat (woff2, self-hosted)
  *.png *.jpg *.webp  imagens
  *.svg               divisores de onda, ícones de contato e redes
```

## Seções da página (ordem)

Hero → Receita → Mais vendidos → Sobre → Destaques → Depoimentos → Sabores limitados (com carrossel) → Revendedor → Lançamentos → FAQ → Contato → Rodapé.

Cada `<section class="section">` ocupa no mínimo `100vh`/`100svh` e termina com uma onda SVG na cor da seção seguinte. Em telas menores a seção cresce se o conteúdo precisar.

## Funcionalidades

- **Menu offcanvas** (direita), aberto por botão flutuante. O logo flutuante aparece no canto superior esquerdo ao sair da hero.
- **Cardápio completo**: offcanvas em tela cheia que sobe de baixo, com filtros (categoria, busca e ordenação). Todos os sabores aparecem só aqui.
<<<<<<< HEAD
- **Vitrines** na landing (Mais vendidos, Destaques, Lançamentos), com 3 cards cada, gerados do mesmo catálogo.
=======
- **Vitrines** na landing (Mais vendidos, Destaques, Lançamentos): carrossel arrastável e infinito (loop) com 6 cards cada, gerados do mesmo catálogo. Desktop mostra 3 por vez, tablet 2 e celular 1 (com bolinhas). Arrasta com mouse ou dedo, tem setas no desktop e funciona com as setas do teclado.
>>>>>>> 9ccb47e (criação carrossel de produtos na home)
- **Carrinho**: seletor de tamanho (P, M, G, GG) e quantidade por card; barra inferior com resumo, "Limpar carrinho" (confirmação no próprio botão) e "Finalizar". Salvo em `localStorage` (`kels-carrinho`).
- **Checkout offcanvas**: entrega ou retirada, endereço, data, pagamento e observações. Entrega soma R$ 6,00. O pedido é formatado e aberto no WhatsApp (`wa.me`).
- **Formulário de revenda** (offcanvas): inscrição enviada ao WhatsApp.
- **WhatsApp flutuante**: abre um balão com "Precisa de ajuda com um pedido feito?" e "Quero entrar em contato".
<<<<<<< HEAD
- **Voltar ao topo** ao chegar no rodapé.
- **Animações**: cookie da hero sobe e balança de tempos em tempos; fade-in a cada entrada de seção. Ambos respeitam `prefers-reduced-motion`.
=======
- **Depoimentos**: 8 comentários fictícios, com foto do pedido, em marquee contínuo (pausa no hover/foco; sem animação com `prefers-reduced-motion`).
- **Voltar ao topo** ao chegar no rodapé.
- **Animações**: cookie da hero sobe e balança de tempos em tempos; fade-in a cada entrada de seção; FAQ abre e fecha com transição suave. Ambos respeitam `prefers-reduced-motion`.
>>>>>>> 9ccb47e (criação carrossel de produtos na home)
- **Acessibilidade**: Esc fecha o painel do topo, foco preso nos painéis, região `aria-live` para o carrinho, `:focus-visible` visível.

## Regras de negócio (fictícias)

| Item | Valor |
|---|---|
| Região de entrega | Itapuã, Vila Velha (ES) |
| Prazo de encomenda | 2 dias |
| Pedido mínimo | 1 pacote tamanho P |
| Taxa de entrega | R$ 6,00 |
| Tamanhos | P 120g, M 160g, G 200g, GG 250g |
| WhatsApp | +55 (27) 90000-1234 (`5527900001234`) |
| E-mail | contato@cookiesdakels.example |

Para trocar esses valores, edite as constantes no topo de `assets/js/main.js` (`TAMANHOS`, `PESOS`, `TAXA_ENTREGA`, `PRAZO_DIAS`, `WHATSAPP`) e os links `wa.me` e textos de contato no `index.html`.

## Catálogo

Os sabores ficam em `assets/js/catalogo.js`. Cada item:

```js
{
  id: 'tradicional',
  nome: 'Tradicional',
  desc: '…',
  foto: 'tradicional',        // tradicional | triple | redvelvet | nutella
  categoria: 'Clássicos',
  precos: [12, 17, 23, 30],   // P, M, G, GG
  tags: ['mais-vendido'],     // mais-vendido | destaque | lancamento
  rank: 1                     // posição em "Mais vendidos" (só nessa tag)
}
```

<<<<<<< HEAD
Adicionar ou remover um item atualiza automaticamente o cardápio e as vitrines. O preço do carrinho é sempre relido do catálogo.
=======
Cada vitrine mostra até 6 sabores (`POR_VITRINE` em `main.js`); um sabor pode ter mais de uma tag. Adicionar ou remover um item atualiza automaticamente o cardápio e as vitrines. O preço do carrinho é sempre relido do catálogo.
>>>>>>> 9ccb47e (criação carrossel de produtos na home)

## Design

- Cores: `--rosa #e790a3`, `--rosa-claro #f2d4db`, `--rosa-texto #b8456a` (texto pequeno sobre branco), `--roxo #8562ac`, `--branco`.
- Fontes: Lobster (títulos) e Montserrat 400/500/700 (texto).
- Mobile-first, breakpoints em 640, 900 e 1024 px.
- Layout lateral padronizado: contêiner de 940 px (`--container`) em todas as seções. O offcanvas do cardápio tem largura própria (1240 px).
- Painéis empilhados por z-index: cardápio 40, barra do carrinho 41, overlay 42, demais offcanvas 45.

## Pendências conhecidas

- Fotos dos sabores se repetem (só existem 4 imagens); servem apenas para testar o visual.
- Alergênicos: apenas um alerta geral, sem detalhe por sabor.
- O envio por WhatsApp abre o app/web com a mensagem pronta; não há back-end nem registro de pedidos.
