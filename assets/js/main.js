/* ==========================================================================
   Cookies da Kels — main.js
   Mini e-commerce estático: catálogo → cards, vitrines, cardápio com filtros,
   carrinho, barra flutuante, checkout em offcanvas (envia o pedido ao WhatsApp)
   e menu. Projeto de estudo: sem pagamento online nem back-end.
   Depende de catalogo.js (window.KELS_CATALOGO), carregado antes.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Configuração ---------- */
  var TAMANHOS = ['P', 'M', 'G', 'GG'];
  var PESOS = ['120g', '160g', '200g', '250g'];
  var TAXA_ENTREGA = 6;
  var WHATSAPP = '5527900001234';   // número fictício (projeto de estudo)
  var CHAVE = 'kels-carrinho';
  var MAX_QTD = 99;
  var PRAZO_DIAS = 2;            // antecedência mínima da encomenda
  var POR_VITRINE = 6;           // cards em cada vitrine da landing (carrossel)
  var FOTOS = {                  // dimensões reais das fotos
    tradicional: [640, 957],
    triple: [640, 960],
    redvelvet: [640, 942],
    nutella: [640, 957]
  };
  var SELOS = { 'mais-vendido': null, destaque: 'Destaque da Kel', lancamento: 'Novo' };

  /* ---------- Utilidades ---------- */
  function $(sel, raiz) { return (raiz || document).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }
  function moeda(v) { return 'R$' + v.toFixed(2).replace('.', ','); }
  function criar(tag, classe, texto) {
    var el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto != null) el.textContent = texto;
    return el;
  }
  function icone(nome) {          // ícone do sprite (<symbol id="i-nome"> no index.html)
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    var uso = document.createElementNS(NS, 'use');
    svg.setAttribute('class', 'icone');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    uso.setAttribute('href', '#i-' + nome);
    svg.appendChild(uso);
    return svg;
  }
  function semAcento(t) { return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  /* ---------- Catálogo ---------- */
  var CATALOGO = window.KELS_CATALOGO || [];
  var precosPorNome = {};
  CATALOGO.forEach(function (s) { precosPorNome[s.nome] = s.precos; });

  /* ==========================================================================
     PAINÉIS OFFCANVAS — pilha: o checkout pode abrir por cima do cardápio
     ========================================================================== */
  var fundo = $('.offcanvas__fundo');
  var pilha = [];                // [{ painel, origem }]

  function topo() { return pilha.length ? pilha[pilha.length - 1] : null; }

  function focaveis(painel) {
    return $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])', painel)
      .filter(function (el) { return el.getClientRects().length > 0; });
  }

  function sincronizarPainel() {
    var temLateral = pilha.some(function (p) { return !p.painel.classList.contains('offcanvas--cardapio'); });
    fundo.classList.toggle('is-open', temLateral);       // o cardápio é tela cheia: não precisa de fundo
    document.body.classList.toggle('painel-aberto', pilha.length > 0);
    $('.menu-toggle').setAttribute('aria-expanded', pilha.some(function (p) { return p.painel.id === 'menu-offcanvas'; }) ? 'true' : 'false');
  }

  function abrirPainel(painel, origem) {
    if (topo() && topo().painel === painel) return;
    // menu e cardápio não se empilham com eles mesmos: abrir um fecha o menu
    if (painel.id === 'cardapio' || painel.id === 'menu-offcanvas') {
      pilha.slice().forEach(function (p) { if (p.painel.id === 'menu-offcanvas') fecharPainel(p.painel, false); });
    }
    pilha.push({ painel: painel, origem: origem || document.activeElement });
    painel.classList.add('is-open');
    sincronizarPainel();
    var primeiro = $('.offcanvas__fechar', painel);
    if (primeiro) primeiro.focus();
  }

  function fecharPainel(painel, devolverFoco) {
    painel = painel || (topo() && topo().painel);
    if (!painel) return;
    var i = -1;
    pilha.forEach(function (p, k) { if (p.painel === painel) i = k; });
    if (i < 0) return;
    var origem = pilha[i].origem;
    pilha.splice(i, 1);
    painel.classList.remove('is-open');
    sincronizarPainel();
    if (devolverFoco !== false && origem && origem.focus) origem.focus();
  }

  function fecharTodos() {
    pilha.slice().reverse().forEach(function (p) { fecharPainel(p.painel, false); });
  }

  $$('.offcanvas').forEach(function (painel) {
    $('.offcanvas__fechar', painel).addEventListener('click', function () { fecharPainel(painel); });
  });
  fundo.addEventListener('click', function () { fecharPainel(); });

  document.addEventListener('keydown', function (e) {
    var t = topo();
    if (!t) return;
    if (e.key === 'Escape') { fecharPainel(); return; }
    if (e.key === 'Tab') {            // mantém o foco dentro do painel do topo
      var lista = focaveis(t.painel);
      if (!lista.length) return;
      var primeiro = lista[0];
      var ultimo = lista[lista.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    }
  });

  /* Menu */
  var menu = $('#menu-offcanvas');
  $('.menu-toggle').addEventListener('click', function (e) { abrirPainel(menu, e.currentTarget); });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) fecharPainel(menu, false);   // segue o link sem roubar o foco
  });

  /* Cardápio: qualquer botão .js-abrir-cardapio */
  var cardapio = $('#cardapio');
  document.addEventListener('click', function (e) {
    var gatilho = e.target.closest('.js-abrir-cardapio');
    if (gatilho) abrirPainel(cardapio, gatilho.closest('#menu-offcanvas') ? $('.menu-toggle') : gatilho);
  });
  cardapio.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (link) fecharTodos();                                 // links internos levam para a página
  });

  /* ==========================================================================
     CARRINHO
     ========================================================================== */
  var itens = [];   // { sabor, tam, preco, qtd }

  function itemValido(i) {
    if (!i || !precosPorNome[i.sabor]) return false;
    var idx = TAMANHOS.indexOf(i.tam);
    if (idx < 0) return false;
    i.preco = precosPorNome[i.sabor][idx];            // preço sempre vem do catálogo
    i.qtd = Math.floor(Number(i.qtd));
    return i.qtd >= 1 && i.qtd <= MAX_QTD;
  }

  function carregar() {
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE));
      if (Array.isArray(salvo)) itens = salvo.filter(itemValido);
    } catch (e) { itens = []; }
  }

  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(itens)); } catch (e) { /* sem armazenamento: segue em memória */ }
  }

  function totalItens() { return itens.reduce(function (s, i) { return s + i.qtd; }, 0); }
  function subtotal() { return itens.reduce(function (s, i) { return s + i.preco * i.qtd; }, 0); }
  function recebimento() { var r = $('input[name="receber"]:checked'); return r ? r.value : 'entrega'; }
  function taxa() { return recebimento() === 'entrega' && itens.length ? TAXA_ENTREGA : 0; }

  function achar(sabor, tam) {
    for (var k = 0; k < itens.length; k++) {
      if (itens[k].sabor === sabor && itens[k].tam === tam) return itens[k];
    }
    return null;
  }

  function adicionar(sabor, tam, qtd) {
    var existente = achar(sabor, tam);
    if (existente) existente.qtd = Math.min(MAX_QTD, existente.qtd + qtd);
    else itens.push({ sabor: sabor, tam: tam, preco: precosPorNome[sabor][TAMANHOS.indexOf(tam)], qtd: Math.min(MAX_QTD, qtd) });
    atualizar();
  }

  function mudarQtd(item, delta) {
    item.qtd = Math.max(1, Math.min(MAX_QTD, item.qtd + delta));
    atualizar();
  }

  function limparCarrinho() {
    itens = [];
    atualizar();                    // esvazia a barra e fecha o checkout, se estiver aberto
    status.textContent = 'Carrinho limpo.';
  }

  function remover(item) {
    itens.splice(itens.indexOf(item), 1);
    atualizar();
  }

  /* ---------- Limpar carrinho (barra e checkout): 1º clique pede confirmação ---------- */
  $$('.js-limpar-carrinho').forEach(function (botao) {
    var texto = $('.carrinho-limpar__texto', botao);
    var area = botao.closest('.carrinho-barra');
    var rotulo = botao.dataset.rotulo;
    var temporizador = null;

    function cancelar() {
      clearTimeout(temporizador);
      botao.classList.remove('is-confirmando');
      if (area) area.classList.remove('is-confirmando');
      texto.textContent = rotulo;
      botao.setAttribute('aria-label', 'Limpar carrinho');
    }

    botao.addEventListener('click', function () {
      if (botao.classList.contains('is-confirmando')) {
        cancelar();
        limparCarrinho();
        return;
      }
      botao.classList.add('is-confirmando');
      if (area) area.classList.add('is-confirmando');
      texto.textContent = 'Tem certeza? Limpar';
      botao.setAttribute('aria-label', 'Confirmar: limpar o carrinho');
      temporizador = setTimeout(cancelar, 4000);     // sem confirmar, volta ao normal
    });
    botao.addEventListener('blur', cancelar);
  });

  /* ---------- Barra flutuante do rodapé ---------- */
  var barra = $('.carrinho-barra');
  function renderBarra() {
    var n = totalItens();
    $('.js-barra-qtd', barra).textContent = n + (n === 1 ? ' item' : ' itens');
    $('.js-barra-total', barra).textContent = moeda(subtotal());
    barra.classList.toggle('is-visivel', n > 0);
    document.body.classList.toggle('tem-carrinho', n > 0);
  }

  /* ---------- Checkout ---------- */
  var checkout = $('#checkout');
  var lista = $('#pedido-lista');
  var form = $('#form-pedido');

  function renderCheckout() {
    var vazio = itens.length === 0;
    $('#checkout-vazio').hidden = !vazio || !$('#checkout-sucesso').hidden;
    $('#checkout-conteudo').hidden = vazio;
    lista.textContent = '';

    itens.forEach(function (item) {
      var li = criar('li', 'pedido__item');
      var info = criar('div', 'pedido__info');
      info.appendChild(criar('p', 'pedido__nome', item.sabor));
      info.appendChild(criar('p', 'pedido__detalhe', 'Tamanho ' + item.tam + ' · ' + PESOS[TAMANHOS.indexOf(item.tam)] + ' · ' + moeda(item.preco) + ' cada'));
      li.appendChild(info);
      li.appendChild(criar('p', 'pedido__preco', moeda(item.preco * item.qtd)));

      var acoes = criar('div', 'pedido__acoes');
      var qtd = criar('div', 'qtd');
      qtd.setAttribute('role', 'group');
      qtd.setAttribute('aria-label', 'Quantidade de ' + item.sabor + ', tamanho ' + item.tam);
      var menos = criar('button', 'qtd__btn', '−');
      menos.type = 'button';
      menos.setAttribute('aria-label', 'Diminuir quantidade');
      menos.addEventListener('click', function () { mudarQtd(item, -1); });
      var valorEl = criar('output', null, String(item.qtd));
      var mais = criar('button', 'qtd__btn', '+');
      mais.type = 'button';
      mais.setAttribute('aria-label', 'Aumentar quantidade');
      mais.addEventListener('click', function () { mudarQtd(item, 1); });
      qtd.appendChild(menos); qtd.appendChild(valorEl); qtd.appendChild(mais);

      var rem = criar('button', 'pedido__remover', 'Remover');
      rem.type = 'button';
      rem.setAttribute('aria-label', 'Remover ' + item.sabor + ', tamanho ' + item.tam + ', do pedido');
      rem.addEventListener('click', function () { remover(item); });
      acoes.appendChild(qtd); acoes.appendChild(rem);
      li.appendChild(acoes);
      lista.appendChild(li);
    });

    var entrega = recebimento() === 'entrega';
    $('#resumo-subtotal').textContent = moeda(subtotal());
    $('#resumo-entrega-linha').hidden = !entrega;
    $('#resumo-entrega').textContent = moeda(TAXA_ENTREGA);
    $('#resumo-total').textContent = moeda(subtotal() + taxa());
    $('#btn-enviar').disabled = vazio;
  }

  function atualizar() {
    salvar();
    renderBarra();
    renderCheckout();
    if (!itens.length && topo() && topo().painel === checkout) fecharPainel(checkout);
  }

  $('.js-abrir-checkout').addEventListener('click', function (e) {
    $('#checkout-sucesso').hidden = true;
    renderCheckout();
    abrirPainel(checkout, e.currentTarget);
  });

  /* Campos condicionais do formulário */
  function sincronizarCampos() {
    var entrega = recebimento() === 'entrega';
    $('#campos-entrega').hidden = !entrega;
    $('#f-rua').required = entrega;
    $('#f-bairro').required = entrega;
    $('#campo-retirada').hidden = entrega;
    var dinheiro = $('input[name="pagamento"]:checked').value === 'Dinheiro';
    $('#campo-troco').hidden = !dinheiro;
    renderCheckout();
  }
  $$('input[name="receber"], input[name="pagamento"]').forEach(function (r) {
    r.addEventListener('change', sincronizarCampos);
  });

  /* Data mínima: hoje + prazo de encomenda */
  (function () {
    var d = new Date();
    d.setDate(d.getDate() + PRAZO_DIAS);
    var iso = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    var campo = $('#f-data');
    campo.min = iso;
    campo.value = iso;
  })();

  /* Mensagem do pedido para o WhatsApp */
  function dataBR(iso) { var p = iso.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function valor(id) { return $('#' + id).value.trim(); }

  function montarMensagem() {
    var entrega = recebimento() === 'entrega';
    var pagamento = $('input[name="pagamento"]:checked').value;
    var linhas = ['*Novo pedido — Cookies da Kels*', '', '*Itens*'];
    itens.forEach(function (i) {
      linhas.push(i.qtd + 'x ' + i.sabor + ' (' + i.tam + ', ' + PESOS[TAMANHOS.indexOf(i.tam)] + ') — ' + moeda(i.preco * i.qtd));
    });
    linhas.push('');
    linhas.push('Subtotal: ' + moeda(subtotal()));
    linhas.push(entrega ? 'Entrega: ' + moeda(TAXA_ENTREGA) : 'Entrega: retirada (sem taxa)');
    linhas.push('*Total: ' + moeda(subtotal() + taxa()) + '*');
    linhas.push('');
    linhas.push('*Cliente*');
    linhas.push('Nome: ' + valor('f-nome'));
    linhas.push('WhatsApp: ' + valor('f-tel'));
    linhas.push('');
    linhas.push('*Recebimento*');
    if (entrega) {
      var end = valor('f-rua') + ', ' + valor('f-bairro');
      if (valor('f-compl')) end += ' (' + valor('f-compl') + ')';
      linhas.push('Entrega em: ' + end + ', Vila Velha (ES)');
    } else {
      linhas.push('Retirada em Itapuã (local combinado pelo WhatsApp)');
    }
    linhas.push('Data desejada: ' + dataBR(valor('f-data')));
    linhas.push('');
    var pag = '*Pagamento:* ' + pagamento;
    if (pagamento === 'Dinheiro' && valor('f-troco')) pag += ' (troco para ' + valor('f-troco') + ')';
    linhas.push(pag);
    if (valor('f-obs')) { linhas.push(''); linhas.push('*Observações:* ' + valor('f-obs')); }
    return linhas.join('\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();             // só chega aqui com os campos obrigatórios válidos
    if (!itens.length) return;
    var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(montarMensagem());
    window.open(url, '_blank', 'noopener');

    $('#link-whats-pedido').href = url;
    itens = [];                     // pedido enviado: limpa o carrinho
    salvar();
    renderBarra();
    $('#checkout-sucesso').hidden = false;
    renderCheckout();               // esconde a lista e o formulário
    $('#checkout-sucesso h3').focus();
  });

  $('#btn-sucesso-fechar').addEventListener('click', function () { fecharPainel(checkout); });

  /* ==========================================================================
     CARDS (gerados do catálogo): tamanho, quantidade e "Adicionar"
     ========================================================================== */
  var status = $('#carrinho-status');
  var instancias = 0;

  function criarCard(item, selo) {
    var n = ++instancias;           // o mesmo sabor pode aparecer em mais de um lugar
    var tamAtual = 'P';
    var temporizador = null;
    var dim = FOTOS[item.foto];

    var card = criar('article', 'card card--' + item.foto);

    /* foto + selo */
    var foto = criar('div', 'card__foto');
    var img = criar('img');
    img.src = 'assets/cookie-' + item.foto + '.jpg';
    img.alt = 'Cookie ' + item.nome;
    img.width = dim[0];
    img.height = dim[1];
    img.loading = 'lazy';
    foto.appendChild(img);
    if (selo) foto.appendChild(criar('span', 'card__selo', selo));
    card.appendChild(foto);

    /* corpo */
    var corpo = criar('div', 'card__corpo');
    corpo.appendChild(criar('h3', 'card__nome', item.nome));
    corpo.appendChild(criar('p', 'card__desc', item.desc));

    var tamanhos = criar('fieldset', 'card__tamanhos');
    tamanhos.appendChild(criar('legend', 'visually-hidden', 'Tamanho do pacote'));
    TAMANHOS.forEach(function (t, idx) {
      var label = criar('label', 'tamanho-opcao');
      var radio = criar('input');
      radio.type = 'radio';
      radio.name = 'tamanho-' + n;
      radio.value = t;
      radio.checked = idx === 0;
      label.appendChild(radio);
      label.appendChild(criar('span', null, t));
      tamanhos.appendChild(label);
    });
    corpo.appendChild(tamanhos);

    var infoTam = criar('p', 'card__tamanho');
    infoTam.appendChild(document.createTextNode('Tamanho '));
    var tamEl = criar('span', null, 'P');
    infoTam.appendChild(tamEl);
    infoTam.appendChild(document.createTextNode(' · '));
    var pesoEl = criar('span', null, PESOS[0]);
    infoTam.appendChild(pesoEl);
    corpo.appendChild(infoTam);

    var precoP = criar('p', 'card__preco');
    var dado = criar('data', null, moeda(item.precos[0]));
    dado.value = item.precos[0];
    precoP.appendChild(dado);
    precoP.appendChild(document.createTextNode(' '));
    precoP.appendChild(criar('span', null, '/ pacote'));
    corpo.appendChild(precoP);

    var acoes = criar('div', 'card__acoes');
    var qtd = criar('div', 'qtd');
    qtd.setAttribute('role', 'group');
    qtd.setAttribute('aria-label', 'Quantidade de pacotes');
    var menos = criar('button', 'qtd__btn', '−');
    menos.type = 'button';
    menos.setAttribute('aria-label', 'Diminuir quantidade');
    var qtdEl = criar('output', null, '1');
    qtdEl.value = 1;
    var mais = criar('button', 'qtd__btn', '+');
    mais.type = 'button';
    mais.setAttribute('aria-label', 'Aumentar quantidade');
    qtd.appendChild(menos); qtd.appendChild(qtdEl); qtd.appendChild(mais);
    var botao = criar('button', 'btn btn--contorno');
    botao.type = 'button';
    botao.appendChild(icone('carrinho'));
    var txtBotao = criar('span', null, 'Adicionar');
    botao.appendChild(txtBotao);
    acoes.appendChild(qtd); acoes.appendChild(botao);
    corpo.appendChild(acoes);
    card.appendChild(corpo);

    function rotulo() {
      var q = Number(qtdEl.value);
      botao.setAttribute('aria-label', 'Adicionar ao carrinho: cookie ' + item.nome + ', tamanho ' + tamAtual + ', ' + q + (q === 1 ? ' pacote' : ' pacotes'));
    }
    function definirQtd(v) {
      qtdEl.value = Math.max(1, Math.min(MAX_QTD, v));
      qtdEl.textContent = qtdEl.value;
      rotulo();
    }
    rotulo();

    tamanhos.addEventListener('change', function (e) {
      var i = TAMANHOS.indexOf(e.target.value);
      if (i < 0) return;
      tamAtual = TAMANHOS[i];
      tamEl.textContent = tamAtual;
      pesoEl.textContent = PESOS[i];
      dado.value = item.precos[i];
      dado.textContent = moeda(item.precos[i]);
      rotulo();
    });
    menos.addEventListener('click', function () { definirQtd(Number(qtdEl.value) - 1); });
    mais.addEventListener('click', function () { definirQtd(Number(qtdEl.value) + 1); });

    botao.addEventListener('click', function () {
      var q = Number(qtdEl.value);
      adicionar(item.nome, tamAtual, q);
      status.textContent = q + 'x ' + item.nome + ' (' + tamAtual + ') adicionado ao carrinho.';
      txtBotao.textContent = 'Adicionado';
      botao.classList.add('is-ok');
      clearTimeout(temporizador);
      temporizador = setTimeout(function () {
        txtBotao.textContent = 'Adicionar';
        botao.classList.remove('is-ok');
      }, 1400);
      definirQtd(1);
    });

    return card;
  }

  /* ==========================================================================
     VITRINES DA LANDING (Mais vendidos, Destaques, Lançamentos)
     ========================================================================== */
  $$('[data-vitrine]').forEach(function (grade) {
    var tag = grade.dataset.vitrine;
    var escolhidos = CATALOGO.filter(function (s) { return s.tags.indexOf(tag) >= 0; });
    if (tag === 'mais-vendido') escolhidos.sort(function (a, b) { return a.rank - b.rank; });
    var itens = escolhidos.slice(0, POR_VITRINE);
    for (var rep = 0; rep < 3; rep++) {        // 3 conjuntos: o do meio é o real, os outros formam o loop infinito
      itens.forEach(function (s, i) {
        var selo = tag === 'mais-vendido' ? 'Nº ' + (i + 1) : SELOS[tag];
        var card = criarCard(s, selo);
        if (rep !== 1) {
          card.setAttribute('aria-hidden', 'true');
          $$('button, input', card).forEach(function (el) { el.tabIndex = -1; });
        }
        grade.appendChild(card);
      });
    }
    grade.dataset.total = itens.length;
    montarCarrosselVitrine(grade, itens.length);
  });

  /* ==========================================================================
     CARDÁPIO COMPLETO: todos os sabores + filtros
     ========================================================================== */
  var grade = $('#cardapio-grade');
  var entradas = CATALOGO.map(function (s, ordem) {
    var el = criarCard(s, null);
    grade.appendChild(el);
    return { item: s, el: el, ordem: ordem, busca: semAcento(s.nome + ' ' + s.desc) };
  });

  /* Categorias vêm do catálogo, com contagem */
  var categorias = [];
  CATALOGO.forEach(function (s) { if (categorias.indexOf(s.categoria) < 0) categorias.push(s.categoria); });
  categorias.forEach(function (c) {
    var qtd = CATALOGO.filter(function (s) { return s.categoria === c; }).length;
    var label = criar('label', 'filtros__opcao');
    var cb = criar('input');
    cb.type = 'checkbox';
    cb.name = 'categoria';
    cb.value = c;
    label.appendChild(cb);
    label.appendChild(document.createTextNode(' ' + c + ' (' + qtd + ')'));
    $('#filtro-categorias').appendChild(label);
  });

  var formFiltros = $('#filtros');

  function dentroDaFaixa(preco, faixa) {
    if (faixa === 'ate13') return preco <= 13;
    if (faixa === '14a15') return preco >= 14 && preco <= 15;
    if (faixa === '16mais') return preco >= 16;
    return true;
  }

  function filtrar() {
    var termo = semAcento($('#filtro-busca').value.trim());
    var cats = $$('input[name="categoria"]:checked', formFiltros).map(function (c) { return c.value; });
    var faixa = $('input[name="faixa"]:checked', formFiltros).value;
    var ordem = $('#filtro-ordem').value;

    var visiveis = entradas.filter(function (e) {
      var ok = (!termo || e.busca.indexOf(termo) >= 0) &&
               (!cats.length || cats.indexOf(e.item.categoria) >= 0) &&
               dentroDaFaixa(e.item.precos[0], faixa);
      e.el.hidden = !ok;
      return ok;
    });

    visiveis.sort(function (a, b) {
      if (ordem === 'menor') return a.item.precos[0] - b.item.precos[0] || a.ordem - b.ordem;
      if (ordem === 'maior') return b.item.precos[0] - a.item.precos[0] || a.ordem - b.ordem;
      if (ordem === 'az') return a.item.nome.localeCompare(b.item.nome, 'pt-BR');
      return a.ordem - b.ordem;
    });
    visiveis.forEach(function (e) { grade.appendChild(e.el); });   // reordena sem recriar os cards

    $('#cardapio-contagem').textContent = visiveis.length + (visiveis.length === 1 ? ' sabor' : ' sabores');
    $('#cardapio-vazio').hidden = visiveis.length > 0;

    var ativos = cats.length + (faixa ? 1 : 0) + (termo ? 1 : 0);
    $('#filtros-toggle').textContent = ativos ? 'Filtros (' + ativos + ')' : 'Filtros';
  }

  formFiltros.addEventListener('input', filtrar);
  formFiltros.addEventListener('change', filtrar);
  formFiltros.addEventListener('submit', function (e) { e.preventDefault(); });
  formFiltros.addEventListener('reset', function () { setTimeout(filtrar, 0); });

  /* Filtros recolhíveis no celular */
  $('#filtros-toggle').addEventListener('click', function (e) {
    var aberto = $('#filtros-campos').classList.toggle('is-aberto');
    e.currentTarget.setAttribute('aria-expanded', aberto ? 'true' : 'false');
  });

  filtrar();

  /* ==========================================================================
     LOGO FLUTUANTE (depois do hero) e WHATSAPP FLUTUANTE
     ========================================================================== */
  (function () {
    var logo = $('.logo-flutuante');
    var hero = $('#inicio');
    if (!logo || !hero || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entradas) {
      logo.classList.toggle('is-visivel', !entradas[0].isIntersecting);
    }).observe(hero);
  })();

  (function () {
    var botaoZap = $('.whats-flutuante');
    var contato = $('#contato');
    if (!botaoZap || !contato || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entradas) {
      botaoZap.classList.toggle('whats-flutuante--oculto', entradas[0].isIntersecting);
    }, { threshold: 0.35 }).observe(contato);
  })();

  /* ==========================================================================
     WHATSAPP FLUTUANTE COM BALÃO
     ========================================================================== */
  (function () {
    var widget = $('#whats-widget');
    var btn = $('.whats-flutuante__btn');
    var balao = $('#whats-balao');
    if (!widget || !btn || !balao) return;

    function definir(aberto) {
      balao.classList.toggle('is-aberto', aberto);
      btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      if (aberto) $('.whats-balao__opcao', balao).focus();
    }
    btn.addEventListener('click', function () { definir(!balao.classList.contains('is-aberto')); });
    $('.whats-balao__fechar', balao).addEventListener('click', function () { definir(false); btn.focus(); });
    balao.addEventListener('click', function (e) { if (e.target.closest('a')) definir(false); });
    document.addEventListener('click', function (e) {
      if (balao.classList.contains('is-aberto') && !widget.contains(e.target)) definir(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && balao.classList.contains('is-aberto') && !topo()) { definir(false); btn.focus(); }
    });
    // se o widget sumir (seção de contato), fecha o balão
    new MutationObserver(function () {
      if (widget.classList.contains('whats-flutuante--oculto')) definir(false);
    }).observe(widget, { attributes: true, attributeFilter: ['class'] });
  })();

  /* ==========================================================================
     VOLTAR AO TOPO (aparece quando o rodapé entra na tela)
     ========================================================================== */
  (function () {
    var botaoTopo = $('.topo-flutuante');
    var rodape = $('.rodape');
    if (!botaoTopo || !rodape || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entradas) {
      botaoTopo.classList.toggle('is-visivel', entradas[0].isIntersecting);
    }).observe(rodape);
  })();

  /* ==========================================================================
     FADE-IN DAS SEÇÕES (repete toda vez que a seção entra na tela)
     ========================================================================== */
  (function () {
    var alvos = $$('main .section:not(.hero) > .container');
    if (!alvos.length || !('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { e.target.classList.toggle('is-visivel', e.isIntersecting); });
    }, { threshold: 0.1 });
    alvos.forEach(function (el) { el.classList.add('reveal'); obs.observe(el); });
  })();

  /* ==========================================================================
     CARROSSEL (Sabores Limitados)
     ========================================================================== */
  (function () {
    var raiz = $('#carrossel');
    if (!raiz) return;
    var pista = $('#carrossel-pista');
    var slides = $$('.carrossel__slide', pista);
    var n = slides.length;
    var pontosEl = $('#carrossel-pontos');
    var auto = null;
    var ocioso = null;
    var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function mod(a, b) { return ((a % b) + b) % b; }
    function largura() { return pista.clientWidth; }
    function absoluto() { return Math.round(pista.scrollLeft / largura()); }

    /* Loop infinito: cópias dos slides antes e depois dos reais */
    function copias() {
      return slides.map(function (sl) {
        var c = sl.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        return c;
      });
    }
    copias().forEach(function (c) { pista.appendChild(c); });
    copias().reverse().forEach(function (c) { pista.insertBefore(c, pista.firstChild); });

    var pontos = slides.map(function (_, i) {
      var p = criar('button', 'carrossel__ponto');
      p.type = 'button';
      p.setAttribute('aria-label', 'Ir para a foto ' + (i + 1));
      p.addEventListener('click', function () { ir(n + i); parar(); });
      pontosEl.appendChild(p);
      return p;
    });

    function marcar() {
      var i = mod(absoluto(), n);
      pontos.forEach(function (p, k) { p.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    }
    function ir(abs) {
      pista.scrollTo({ left: abs * largura(), behavior: reduz ? 'auto' : 'smooth' });
    }
    function parar() { clearInterval(auto); auto = null; }
    function iniciar() {
      if (reduz || auto) return;
      auto = setInterval(function () { ir(absoluto() + 1); }, 4500);
    }

    $('.carrossel__btn--ant', raiz).addEventListener('click', function () { ir(absoluto() - 1); parar(); });
    $('.carrossel__btn--prox', raiz).addEventListener('click', function () { ir(absoluto() + 1); parar(); });

    pista.addEventListener('scroll', function () {   // arrastar/rolar com o dedo atualiza os pontos
      marcar();
      clearTimeout(ocioso);
      ocioso = setTimeout(function () {                // volta ao conjunto do meio sem que se perceba
        var conjunto = n * largura();
        var x = pista.scrollLeft;
        var alvo = mod(x, conjunto) + conjunto;
        if (Math.abs(alvo - x) > 1) pista.scrollLeft = alvo;
      }, 120);
    }, { passive: true });
    window.addEventListener('resize', function () {
      pista.scrollLeft = (mod(absoluto(), n) + n) * largura();
      marcar();
    });

    raiz.addEventListener('mouseenter', parar);
    raiz.addEventListener('focusin', parar);
    raiz.addEventListener('mouseleave', iniciar);

    pista.scrollLeft = n * largura();
    marcar();
    iniciar();
  })();

  /* ==========================================================================
     DEPOIMENTOS EM MARQUEE (faixa contínua; pausa ao passar o mouse/foco)
     ========================================================================== */
  (function () {
    var lista = $('.depoimentos__lista');
    if (!lista) return;
    Array.prototype.slice.call(lista.children).forEach(function (li) {
      var c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.classList.add('depoimento-clone');
      lista.appendChild(c);
    });
    var faixa = document.createElement('div');
    faixa.className = 'depoimentos__faixa';
    lista.parentNode.insertBefore(faixa, lista);
    faixa.appendChild(lista);
    lista.classList.add('is-marquee');
  })();

  /* ==========================================================================
     INSCRIÇÃO DE REVENDEDOR (offcanvas → WhatsApp)
     ========================================================================== */
  (function () {
    var painel = $('#revenda');
    var formRev = $('#form-revenda');
    var sucesso = $('#revenda-sucesso');
    if (!painel || !formRev) return;

    $$('.js-abrir-revenda').forEach(function (b) {
      b.addEventListener('click', function (e) {
        sucesso.hidden = true;
        formRev.hidden = false;
        abrirPainel(painel, e.currentTarget);
      });
    });

    function v(id) { return $('#' + id).value.trim(); }

    formRev.addEventListener('submit', function (e) {
      e.preventDefault();             // só chega aqui com os campos obrigatórios válidos
      var linhas = ['*Inscrição de revendedor — Cookies da Kels*', '', '*Dados*',
        'Nome: ' + v('r-nome'), 'WhatsApp: ' + v('r-tel')];
      if (v('r-email')) linhas.push('E-mail: ' + v('r-email'));
      linhas.push('Cidade e bairro: ' + v('r-cidade'), '', '*Negócio*',
        'Como pretende revender: ' + v('r-tipo'), 'Volume estimado por mês: ' + v('r-volume'));
      if (v('r-msg')) linhas.push('', '*Mensagem:* ' + v('r-msg'));
      var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(linhas.join('\n'));
      window.open(url, '_blank', 'noopener');

      $('#link-whats-revenda').href = url;
      formRev.reset();
      formRev.hidden = true;
      sucesso.hidden = false;
      $('h3', sucesso).focus();
    });

    $('#btn-revenda-fechar').addEventListener('click', function () { fecharPainel(painel); });
  })();


  /* ==========================================================================
     CARROSSEL ARRASTÁVEL DAS VITRINES (mouse, toque e teclado)
     Desktop: 3 cards visíveis · tablet: 2 · celular: 1 por vez (CSS).
     ========================================================================== */
  function montarCarrosselVitrine(pista, n) {
    var cards = Array.prototype.slice.call(pista.children);
    if (!cards.length || !n) return;
    var secao = pista.closest('section');
    var titulo = secao && $('h2', secao);

    var moldura = document.createElement('div');
    moldura.className = 'vitrine__carrossel';
    pista.parentNode.insertBefore(moldura, pista);
    moldura.appendChild(pista);

    pista.setAttribute('role', 'region');
    pista.setAttribute('aria-roledescription', 'carrossel');
    pista.setAttribute('aria-label', titulo ? titulo.textContent : 'Sabores');
    pista.tabIndex = 0;

    function criarSeta(lado) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'vitrine__seta vitrine__seta--' + lado;
      b.setAttribute('aria-label', lado === 'ant' ? 'Sabores anteriores' : 'Próximos sabores');
      b.appendChild(icone(lado === 'ant' ? 'seta-esq' : 'seta-dir'));
      moldura.appendChild(b);
      return b;
    }
    var ant = criarSeta('ant');
    var prox = criarSeta('prox');

    var pontos = document.createElement('div');
    pontos.className = 'vitrine__pontos';
    for (var k = 0; k < n; k++) {
      (function (i) {
        var p = document.createElement('button');
        p.type = 'button';
        p.className = 'vitrine__ponto';
        p.setAttribute('aria-label', 'Ir para o sabor ' + (i + 1));
        p.addEventListener('click', function () { irPara(n + i); });
        pontos.appendChild(p);
      })(k);
    }
    moldura.appendChild(pontos);

    function passo() {
      var gap = parseFloat(getComputedStyle(pista).columnGap) || 0;
      return cards[0].getBoundingClientRect().width + gap;
    }
    function comportamento() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    }
    function irPara(i) { pista.scrollTo({ left: i * passo(), behavior: comportamento() }); }
    function absoluto() { return Math.round(pista.scrollLeft / passo()); }
    function mod(a, b) { return ((a % b) + b) % b; }

    function marcar() {
      var i = mod(absoluto(), n);
      Array.prototype.forEach.call(pontos.children, function (p, k2) {
        if (k2 === i) p.setAttribute('aria-current', 'true'); else p.removeAttribute('aria-current');
      });
    }

    /* Loop infinito: ao parar de rolar, volta ao conjunto do meio (visualmente idêntico) */
    var ocioso = null;
    function recentralizar() {
      if (arrastando) return;
      var conjunto = n * passo();
      var x = pista.scrollLeft;
      var alvo = mod(x, conjunto) + conjunto;
      if (Math.abs(alvo - x) > 1) pista.scrollLeft = alvo;
    }
    pista.addEventListener('scroll', function () {
      marcar();
      clearTimeout(ocioso);
      ocioso = setTimeout(recentralizar, 120);
    }, { passive: true });
    window.addEventListener('resize', function () {
      pista.scrollLeft = (mod(absoluto(), n) + n) * passo();
      marcar();
    });

    ant.addEventListener('click', function () { irPara(absoluto() - 1); });
    prox.addEventListener('click', function () { irPara(absoluto() + 1); });
    pista.addEventListener('keydown', function (e) {
      if (e.target !== pista) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); irPara(absoluto() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); irPara(absoluto() - 1); }
    });

    /* Arrastar com o mouse (toque e caneta já rolam nativamente) */
    var inicioX = 0, inicioScroll = 0, apontando = false, arrastando = false, moveu = false;
    pista.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      apontando = true; arrastando = false; moveu = false;
      inicioX = e.clientX; inicioScroll = pista.scrollLeft;
    });
    pista.addEventListener('pointermove', function (e) {
      if (!apontando) return;
      var dx = e.clientX - inicioX;
      if (!arrastando && Math.abs(dx) > 5) {
        arrastando = true; moveu = true;
        pista.classList.add('is-arrastando');
        try { pista.setPointerCapture(e.pointerId); } catch (_) { /* ignora */ }
      }
      if (arrastando) pista.scrollLeft = inicioScroll - dx;
    });
    function soltar(e) {
      if (!apontando) return;
      apontando = false;
      if (!arrastando) return;
      arrastando = false;
      try { pista.releasePointerCapture(e.pointerId); } catch (_) { /* ignora */ }
      var alvo = Math.round(pista.scrollLeft / passo()) * passo();
      pista.classList.remove('is-arrastando');
      pista.scrollTo({ left: alvo, behavior: comportamento() });
    }
    pista.addEventListener('pointerup', soltar);
    pista.addEventListener('pointercancel', soltar);
    /* Um arraste não pode virar clique em tamanho, quantidade ou Adicionar */
    pista.addEventListener('click', function (e) {
      if (moveu) { e.preventDefault(); e.stopPropagation(); moveu = false; }
    }, true);
    pista.addEventListener('dragstart', function (e) { e.preventDefault(); });

    pista.scrollLeft = n * passo();   // começa no conjunto do meio
    marcar();
  }

  /* ==========================================================================
     FAQ: abertura e fechamento suaves (Web Animations API)
     ========================================================================== */
  $$('.faq__item').forEach(function (item) {
    var resumo = $('summary', item);
    var corpo = $('p', item);
    if (!resumo || !corpo || !corpo.animate) return;
    var anim = null;

    function animar(abrindo) {
      if (anim) anim.cancel();
      var cs = getComputedStyle(corpo);
      var alturaCheia = corpo.scrollHeight;
      var pad = cs.paddingBottom;
      var de = { height: '0px', paddingBottom: '0px', opacity: 0 };
      var ate = { height: alturaCheia + 'px', paddingBottom: pad, opacity: 1 };
      corpo.style.overflow = 'hidden';
      anim = corpo.animate(abrindo ? [de, ate] : [ate, de], { duration: 280, easing: 'ease' });
      anim.onfinish = anim.oncancel = function () {
        anim = null;
        corpo.style.overflow = '';
        if (!abrindo) item.removeAttribute('open');
      };
    }

    resumo.addEventListener('click', function (e) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      e.preventDefault();
      if (item.open && !anim) animar(false);
      else if (item.open && anim) animar(false);
      else { item.setAttribute('open', ''); animar(true); }
    });
  });

  /* ---------- Início ---------- */
  carregar();
  sincronizarCampos();
  atualizar();
})();
