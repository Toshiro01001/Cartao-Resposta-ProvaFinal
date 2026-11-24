# Cartão-Resposta: Prova Final

Meu caderno de estudo para a prova final de duas matérias da faculdade: **Programação em Banco de Dados** e **Sistemas Embarcados**. Fiz na mesma linha do meu [Cartão-Resposta](https://github.com/Toshiro01001/Cartao-Resposta), só que focado nessas duas provas.

**Abrir o site:** https://toshiro01001.github.io/Cartao-Resposta-ProvaFinal/

![Tela inicial no computador](docs/inicio.webp)

## O que tem

| | Banco de Dados | Sistemas Embarcados |
|---|---|---|
| Aulas | 6 | 12 |
| Questões comentadas | 120 | 177 |
| Cartões de memória | 108 | 215 |
| Prática de SQL | 54 | não tem |

## Como funciona

- **Início:** uma tela de osciloscópio com um canal por matéria. Cada questão certa limpa o sinal. Com tudo certo, o sinal trava e o placar marca 4000.
- **Aulas:** curtas, com exemplo, tabela, macete e pegadinha.
- **Cartões:** pergunta na frente, resposta atrás. O que eu não sabia volta no dia seguinte.
- **Questões:** cinco alternativas com comentário. O que eu erro volta na revisão (1, 3, 7 e 15 dias).
- **Prática de SQL:** digito o comando e comparo com o modelo.
- **Simulado:** questões sorteadas, com relógio e nota na escala de 4000.
- **Desempenho:** pontuação por matéria e um código para levar o progresso de um aparelho para outro.

![Sinal travado com 4000 pontos](docs/sinal-4000.webp)

![Telas no celular](docs/celular.webp)

## Para quem entende de programação

- A página chega aqui já compilada (React + WebGL). `index.html` carrega o programa e o estilo de `assets/`. Esses arquivos não são editados à mão.
- O progresso fica só no navegador (`localStorage`). O site não conversa com nenhum outro endereço e tem Content-Security-Policy restritiva: sem CDN, sem fonte externa, sem script ou estilo inline.
- Sem WebGL, ou com "reduzir movimento" ligado, o osciloscópio vira um desenho parado.
- Teste: sirva esta pasta na porta 8321 e rode `node tests/site.cjs`.
- Fontes IBM Plex (licença OFL) e React (licença MIT), em `licencas/`.

## Aviso

É material de estudo pessoal. As questões foram escritas a partir dos slides e do livro da disciplina; o livro não traz gabarito, então algumas respostas foram tiradas do texto e estão marcadas com um aviso na tela.
