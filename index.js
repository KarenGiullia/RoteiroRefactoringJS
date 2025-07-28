const { readFileSync } = require('fs');

function criarFaturaCalculada(fatura, pecas) {

  function getPeca(apre) {
    return pecas[apre.id];
  }

  function calcularTotalApresentacao(apre) {
    let total = 0;
    switch (getPeca(apre).tipo) {
      case "tragedia":
        total = 40000;
        if (apre.audiencia > 30) {
          total += 1000 * (apre.audiencia - 30);
        }
        break;
      case "comedia":
        total = 30000;
        if (apre.audiencia > 20) {
          total += 10000 + 500 * (apre.audiencia - 20);
        }
        total += 300 * apre.audiencia;
        break;
      default:
        throw new Error(`Peça desconhecida: ${getPeca(apre).tipo}`);
    }
    return total;
  }

  function calcularCredito(apre) {
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (getPeca(apre).tipo === "comedia") 
      creditos += Math.floor(apre.audiencia / 5);
    return creditos;
  }

  const resultado = {};
  resultado.cliente = fatura.cliente;
  resultado.apresentacoes = fatura.apresentacoes.map(apre => {
    const peca = getPeca(apre);
    const total = calcularTotalApresentacao(apre);
    return {
      peca,
      audiencia: apre.audiencia,
      total,
      creditos: calcularCredito(apre)
    };
  });

  resultado.totalFatura = resultado.apresentacoes.reduce((total, a) => total + a.total, 0);
  resultado.totalCreditos = resultado.apresentacoes.reduce((total, a) => total + a.creditos, 0);

  return resultado;
}

function gerarFaturaStr(dados) {

  function formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR",
      { style: "currency", currency: "BRL",
        minimumFractionDigits: 2 }).format(valor / 100);
  }

  let faturaStr = `Fatura ${dados.cliente}\n`;

  for (let apre of dados.apresentacoes) {
    faturaStr += `  ${apre.peca.nome}: ${formatarMoeda(apre.total)} (${apre.audiencia} assentos)\n`;
  }

  faturaStr += `Valor total: ${formatarMoeda(dados.totalFatura)}\n`;
  faturaStr += `Créditos acumulados: ${dados.totalCreditos} \n`;
  return faturaStr;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));

const dadosCalculados = criarFaturaCalculada(faturas, pecas);
const faturaStr = gerarFaturaStr(dadosCalculados);

console.log(faturaStr);
