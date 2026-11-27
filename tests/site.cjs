/* Teste do site pronto, no computador (1366 px), no iPhone 13, em 320 px e com "reduzir movimento".
   Como rodar: compile (npx vite build), sirva a pasta dist na porta 8321 e rode: node testes/site.cjs [pasta para as fotos] */
const { chromium, devices } = require('playwright')
const URL = process.env.SITE || 'http://localhost:8321/'
const fotos = process.argv[2]
const falhas = []
const ok = (cond, msg) => { if (!cond) falhas.push(msg) }

async function rodar(b, nome, opts) {
  const c = await b.newContext(opts); const p = await c.newPage()
  p.on('console', (m) => { if (m.type() === 'error') falhas.push(nome + ' console: ' + m.text()) })
  p.on('pageerror', (e) => falhas.push(nome + ' erro: ' + e.message))
  const semRolagem = async (onde) => { const r = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); ok(r <= 0, `${nome} ${onde}: rolagem lateral de ${r}px`) }
  const foto = async (n, cheia) => { if (fotos) await p.screenshot({ path: `${fotos}/${nome}-${n}.png`, fullPage: !!cheia }) }
  const abrir = async (rota) => { await p.goto(URL + '#/' + rota); await p.waitForTimeout(350) }

  await abrir(''); await p.waitForTimeout(700)
  ok(await p.locator('h1').first().innerText() === 'Prova Final', nome + ' título')
  ok(await p.locator('.assinatura img[alt="M1L!"]').count() === 1, nome + ' assinatura M1L!')
  ok(await p.locator('.rtj-vivo').count() === 1, nome + ' assinatura RTJ')
  const vivo = await p.locator('.sinal-vivo').count()
  if (opts.reducedMotion === 'reduce') { ok(vivo === 0, nome + ' sinal deveria ficar parado'); ok(await p.locator('.rtj-on').count() === 0, nome + ' RTJ deveria ficar parado') }
  ok(await p.locator('.sinal svg path').count() === 2, nome + ' desenho parado do sinal')
  await semRolagem('início'); await foto('inicio', true)

  /* todas as aulas abrem e não estouram a largura */
  const ids = await p.evaluate(() => [...document.querySelectorAll('.pino')].map((a) => a.getAttribute('href').split('aula/')[1]))
  ok(ids.length === 6, nome + ' 6 pinos de BD')
  for (const m of ['bd', 'se']) {
    await abrir('aulas'); await p.locator(`.topo .materia[data-mat="${m}"]`).locator('visible=true').first().click(); await p.waitForTimeout(150)
    const links = await p.evaluate(() => [...document.querySelectorAll('.aula-linha')].map((a) => a.getAttribute('href')))
    ok(links.length === (m === 'bd' ? 6 : 3), `${nome} aulas de ${m}: ${links.length}`)
    for (const l of links) { await p.goto(URL + l); await p.waitForTimeout(120); ok(await p.locator('.aula-corpo h2').count() > 2, nome + ' aula vazia ' + l); await semRolagem(l) }
  }
  await abrir('aula/bd-u3s2'); await foto('aula', false)
  await p.locator('.aula-acoes .botao').first().click(); ok(await p.locator('.aula-acoes .botao[aria-pressed="true"]').count() === 1, nome + ' marcar aula lida')

  /* questão: marca, confirma, vê comentário */
  await abrir('treino?sec=bd-u3s1'); await p.locator('.alt').nth(1).click(); await p.locator('.questao + .fila .botao, .questao .fila .botao').first().click()
  await p.waitForTimeout(150); ok(await p.locator('.comentario').count() === 1, nome + ' comentário da questão'); ok(await p.locator('.alt-certa').count() === 1, nome + ' alternativa certa marcada')
  await semRolagem('questão'); await foto('questao', true)
  await p.locator('.fila-fim .botao').first().click(); await p.waitForTimeout(100); ok(await p.locator('.comentario').count() === 0, nome + ' próxima questão')

  /* formulário do professor (Sistemas Embarcados 3.1): 10 questões na ordem original, com 4 alternativas */
  await abrir('treino?sec=se-u3s1&f=prof'); await p.waitForTimeout(200)
  ok((await p.locator('.questao-conta').first().innerText()).includes('de 10'), nome + ' formulário com 10 questões')
  ok((await p.locator('.questao-topo').first().innerText()).includes('Formulário do professor · 1'), nome + ' formulário começa na questão 1')
  ok(await p.locator('.alt').count() === 4, nome + ' formulário com 4 alternativas')
  ok(await p.locator('.fila-ordem .chip').getAttribute('aria-pressed') === 'true', nome + ' formulário começa com as alternativas embaralhadas')
  await p.locator('.fila-ordem .chip').click(); await p.waitForTimeout(150)
  ok((await p.locator('.alt-texto').nth(1).innerText()).startsWith('O BusyBox será compilado nativamente'), nome + ' ordem do formulário ao desligar o embaralhar')
  await p.locator('.alt').nth(1).click(); await p.locator('.questao .fila .botao').first().click(); await p.waitForTimeout(150)
  ok(await p.locator('.comentario-certo').count() === 1, nome + ' gabarito do formulário')
  ok(await p.locator('.comentario-erradas li').count() === 3 && (await p.locator('.comentario-erradas li b').allInnerTexts()).join('') === 'ACD', nome + ' por que as outras estão erradas'); await semRolagem('formulário'); await foto('formulario', true)
  await p.evaluate(() => localStorage.removeItem('prova-final-ordem-formulario'))

  /* formulários 3.2 e 3.3: 10 questões cada, com o aviso de gabarito conferido com o livro */
  for (const sx of ['se-u3s2', 'se-u3s3']) { await abrir('treino?sec=' + sx + '&f=prof'); await p.waitForTimeout(200); ok((await p.locator('.questao-conta').first().innerText()).includes('de 10'), nome + ' formulário ' + sx + ' com 10 questões'); ok(await p.locator('.alt').count() === 4, nome + ' formulário ' + sx + ' com 4 alternativas') }
  await p.evaluate(() => localStorage.setItem('prova-final-ordem-formulario', '1')); await abrir('treino?sec=se-u3s2&f=prof'); await p.reload(); await p.waitForTimeout(400)
  await p.locator('.alt').nth(1).click(); await p.locator('.questao .fila .botao').first().click(); await p.waitForTimeout(150)
  ok(await p.locator('.comentario-certo').count() === 1 && (await p.locator('.comentario').innerText()).includes('conferido com o livro'), nome + ' formulário 3.2 questão 1 e aviso de gabarito')
  await p.evaluate(() => localStorage.removeItem('prova-final-ordem-formulario'))

  /* decorar: respostas dos formulários, esconder e ver uma a uma; nas duas matérias */
  await abrir('decorar'); ok(await p.locator('.dec-sec').count() === 3 && await p.locator('.dec-form .dec-linha').count() === 30, nome + ' decorar com os 3 formulários')
  await semRolagem('decorar'); await foto('decorar', false)
  await abrir('decorar?sec=se-u3s2'); ok(await p.locator('.dec-sec').count() === 1 && await p.locator('.dec-form .dec-linha').count() === 10, nome + ' decorar de uma seção')
  ok(await p.locator('.dec-aviso').count() === 1, nome + ' aviso da questão 4 do formulário 3.2')
  await p.locator('.tela-decorar .chip').click(); await p.waitForTimeout(100); ok(await p.locator('.dec-r').count() === 0, nome + ' respostas escondidas')
  await p.locator('.dec-ver').first().click(); ok(await p.locator('.dec-r').count() === 1, nome + ' ver uma resposta'); await semRolagem('decorar escondido'); await foto('decorar-escondido', false)
  await p.locator(`.topo .materia[data-mat="bd"]`).locator('visible=true').first().click(); await abrir('decorar'); await p.waitForTimeout(150)
  ok(await p.locator('.dec-sec').count() === 6 && await p.locator('.dec-linha').count() === 108, nome + ' decorar de Banco de Dados'); await semRolagem('decorar bd'); await foto('decorar-bd', false)
  await p.locator(`.topo .materia[data-mat="se"]`).locator('visible=true').first().click()

  /* cartões */
  await abrir('cartoes?sec=se-u3s3'); await p.locator('.cartao').click({ force: true }); await p.waitForTimeout(900); await foto('cartao', false)
  ok(await p.locator('.hc__card .cartao-virado').count() === 1, nome + ' cartão holográfico virado'); ok(await p.locator('.botao-acertei').count() === 1, nome + ' botões do cartão'); await p.locator('.botao-acertei').click(); await semRolagem('cartões')

  /* prática de SQL */
  await abrir('pratica?sec=bd-u3s2'); await p.locator('.editor').first().fill('select count( * )  FROM veiculos'); await p.locator('.pratica .botao').first().click()
  await p.waitForTimeout(120); ok(await p.locator('.comentario-certo').count() === 1, nome + ' prática igual ao modelo'); await semRolagem('prática'); await foto('pratica', false)

  /* simulado de 10 */
  await abrir('simulado'); await p.locator('.chip').first().click(); await p.locator('.botao-grande').click(); await p.waitForTimeout(200)
  for (let i = 0; i < 10; i++) { await p.locator('.alt').first().click(); if (i < 9) await p.locator('.fila-fim .botao').nth(1).click() }
  await semRolagem('simulado'); await foto('simulado', false)
  await p.locator('.prova-barra .botao').click(); await p.locator('.prova-barra .botao').first().click(); await p.waitForTimeout(250)
  ok(await p.locator('.resultado-pontos').count() === 1, nome + ' nota do simulado'); ok(await p.locator('.correcao .questao').count() === 10, nome + ' correção do simulado')
  await semRolagem('resultado'); await foto('resultado', false)

  /* desempenho, código de progresso */
  await abrir('desempenho'); await semRolagem('desempenho')
  await p.locator('.painel .botao').first().click(); await p.waitForTimeout(150)
  const cod = await p.locator('#codigo').inputValue(); ok(cod.startsWith('PF1.'), nome + ' código de progresso')
  const antes = await p.evaluate(() => localStorage.getItem('prova-final-v1'))
  await p.locator('.painel-perigo .botao').click(); await p.locator('.painel-perigo .botao-errei').click(); await p.waitForTimeout(100)
  ok((await p.evaluate(() => JSON.parse(localStorage.getItem('prova-final-v1')).sims.length)) === 0, nome + ' zerar')
  await p.locator('#codigo').fill(cod); await p.locator('.painel .botao-claro').first().click(); await p.waitForTimeout(100)
  ok(JSON.stringify(JSON.parse(await p.evaluate(() => localStorage.getItem('prova-final-v1'))).q) === JSON.stringify(JSON.parse(antes).q), nome + ' carregar código')
  await p.locator('#codigo').fill('PF1.<img src=x onerror=alert(1)>'); await p.locator('.painel .botao-claro').first().click(); ok((await p.locator('.painel p[aria-live]').innerText()).includes('inválido'), nome + ' código inválido recusado')
  await foto('desempenho', true)
  /* dock: no computador os oito ícones; no celular o botão que abre a lista */
  await abrir(''); await p.waitForTimeout(400)
  if (await p.locator('.fd-dock').isVisible()) {
    ok(await p.locator('.fd-dock__item').count() === 8, nome + ' dock com 8 itens')
    await p.locator('.fd-dock__item[aria-label="Aulas"]').hover(); await p.waitForTimeout(350); ok(await p.locator('.fd-dock__tip').count() === 1, nome + ' balão da dock'); await foto('dock', false)
    await p.locator('.fd-dock__item[aria-label="Aulas"]').click()
  } else {
    await p.locator('.fd-mobile__toggle').click(); await p.waitForTimeout(450); ok(await p.locator('.fd-mobile__item').count() === 8, nome + ' menu com 8 itens'); await foto('menu', false); await semRolagem('menu aberto')
    await p.locator('.fd-mobile__item[aria-label="Aulas"]').click()
  }
  await p.waitForTimeout(350); ok((await p.locator('h1').first().innerText()) === 'Aulas', nome + ' dock leva às aulas')
  ok(await p.locator('[aria-current="page"]').locator('visible=true').count() >= (await p.locator('.fd-dock').isVisible() ? 1 : 0), nome + ' item atual marcado')
  await c.close()
}

;(async () => {
  const b = await chromium.launch()
  await rodar(b, 'pc', { viewport: { width: 1366, height: 860 } })
  await rodar(b, 'iphone', { ...devices['iPhone 13'] })
  await rodar(b, 'p320', { viewport: { width: 320, height: 640 }, hasTouch: true })
  await rodar(b, 'calmo', { viewport: { width: 1366, height: 860 }, reducedMotion: 'reduce' })
  await b.close()
  console.log(falhas.length ? falhas.join('\n') : 'Tudo certo: 4 cenários, sem erro no console e sem rolagem lateral.')
  process.exit(falhas.length ? 1 : 0)
})()
