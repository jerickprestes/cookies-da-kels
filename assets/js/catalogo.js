/* ==========================================================================
   Cookies da Kels — catalogo.js
   Fonte única dos sabores. Os cards do cardápio e das vitrines (Mais vendidos,
   Destaques, Lançamentos) são gerados a partir desta lista por main.js.
   Sabores e preços FICTÍCIOS: projeto de estudo.

   Campos:
     id         identificador do sabor
     nome       nome exibido
     desc       descrição curta
     foto       arquivo de foto usado: tradicional | triple | redvelvet | nutella
     categoria  filtro do cardápio
     precos     preço por tamanho, na ordem [P, M, G, GG]
     tags       vitrines em que aparece: mais-vendido | destaque | lancamento
     rank       posição em "Mais vendidos" (só para a tag mais-vendido)
   ========================================================================== */
window.KELS_CATALOGO = [
  { id: 'tradicional', nome: 'Tradicional', foto: 'tradicional', categoria: 'Clássicos',
    desc: 'Massa de baunilha e mix de chocolates 40% cacau e ao leite',
    precos: [12, 17, 23, 30], tags: ['mais-vendido'], rank: 1 },

  { id: 'triple', nome: 'Triple Chocolate', foto: 'triple', categoria: 'Chocolates',
    desc: 'Massa de cacau 100% com mix de chocolate 40%, ao leite e branco',
    precos: [14, 19, 25, 32], tags: ['mais-vendido'], rank: 2 },

  { id: 'redvelvet', nome: 'Red Velvet', foto: 'redvelvet', categoria: 'Especiais',
    desc: 'Massa de cacau com chocolate branco',
    precos: [14, 19, 25, 32], tags: ['destaque'] },

  { id: 'nutella', nome: 'Tradicional com recheio de Nutella', foto: 'nutella', categoria: 'Recheados',
    desc: 'Massa de baunilha, mix de chocolate 40% e ao leite com recheio de Nutella',
    precos: [14, 19, 25, 32], tags: ['mais-vendido'], rank: 3 },

  { id: 'cafe', nome: 'Café com Chocolate Branco', foto: 'triple', categoria: 'Especiais',
    desc: 'Massa de café com gotas de chocolate branco',
    precos: [14, 19, 25, 32], tags: ['destaque'] },

  { id: 'docedeleite', nome: 'Doce de Leite Recheado', foto: 'nutella', categoria: 'Recheados',
    desc: 'Massa de baunilha com recheio cremoso de doce de leite',
    precos: [15, 20, 26, 33], tags: [] },

  { id: 'limao', nome: 'Limão Siciliano', foto: 'redvelvet', categoria: 'Frutas e castanhas',
    desc: 'Massa de limão siciliano com raspas e chocolate branco',
    precos: [13, 18, 24, 31], tags: ['lancamento'] },

  { id: 'caju', nome: 'Castanha de Caju e Caramelo', foto: 'tradicional', categoria: 'Frutas e castanhas',
    desc: 'Massa amanteigada com castanha de caju e calda de caramelo',
    precos: [15, 20, 26, 33], tags: [] },

  { id: 'brigadeiro', nome: 'Brigadeiro Gourmet', foto: 'triple', categoria: 'Chocolates',
    desc: 'Massa de cacau com brigadeiro cremoso e granulado',
    precos: [14, 19, 25, 32], tags: [] },

  { id: 'ninho', nome: 'Ninho com Morango', foto: 'redvelvet', categoria: 'Recheados',
    desc: 'Massa de leite Ninho com recheio de morango',
    precos: [16, 21, 27, 34], tags: ['lancamento'] },

  { id: 'churros', nome: 'Churros com Doce de Leite', foto: 'tradicional', categoria: 'Especiais',
    desc: 'Massa com canela e açúcar, recheada com doce de leite',
    precos: [15, 20, 26, 33], tags: ['destaque'] },

  { id: 'pistache', nome: 'Pistache Cremoso', foto: 'nutella', categoria: 'Especiais',
    desc: 'Massa de pistache com chocolate branco e pistache picado',
    precos: [16, 21, 27, 34], tags: ['lancamento'] }
];
