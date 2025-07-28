const { readFileSync } = require('fs');

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR",
    { style: "currency", currency: "BRL",
      minimumFractionDigits: 2 }).format(valor / 100);
}

function getPeca(pecas, apre) {
  return pecas[apre.id];
}

function calcularCredito(pecas, apre) {
  let creditos = 0;
  creditos += Math.max(apre.audiencia - 30, 0);
  if (getPeca(pecas, apre).tipo === "comedia")
    creditos += Math.floor(apre.audiencia / 5);
  return creditos;
}

function calcularTotalApresentacao(pecas, apre) {
  let total = 0;
  const peca = getPeca(pecas, apre);
  switch (peca.tipo) {
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
      throw new Error(`Peça desconhecida: ${peca.tipo}`);
  }
  return total;
}

function calcularTotalCreditos(pecas, apresentacoes) {
  let totalCreditos = 0;
  for (const apre of apresentacoes) {
    totalCreditos += calcularCredito(pecas, apre);
  }
  return totalCreditos;
}

function calcularTotalFatura(pecas, apresentacoes) {
  let totalFatura = 0;
  for (const apre of apresentacoes) {
    totalFatura += calcularTotalApresentacao(pecas, apre);
  }
  return totalFatura;
}

function gerarFaturaStr(fatura, pecas) {
  let totalFatura = 0;
  let creditos = 0;
  let faturaStr = `Fatura ${fatura.cliente}\n`;

  for (let apre of fatura.apresentacoes) {
    const total = calcularTotalApresentacao(pecas, apre);
    creditos += calcularCredito(pecas, apre);
    faturaStr += `  ${getPeca(pecas, apre).nome}: ${formatarMoeda(total)} (${apre.audiencia} assentos)\n`;
    totalFatura += total;
  }

  faturaStr += `Valor total: ${formatarMoeda(totalFatura)}\n`;
  faturaStr += `Créditos acumulados: ${creditos} \n`;
  return faturaStr;
}

function gerarFaturaHTML(fatura, pecas) {
  let html = `<html>\n`;
  html += `<p> Fatura ${fatura.cliente} </p>\n`;
  html += `<ul>\n`;

  for (let apre of fatura.apresentacoes) {
    const total = calcularTotalApresentacao(pecas, apre);
    html += `<li> ${getPeca(pecas, apre).nome}: ${formatarMoeda(total)} (${apre.audiencia} assentos) </li>\n`;
  }

  html += `</ul>\n`;
  html += `<p> Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))} </p>\n`;
  html += `<p> Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} </p>\n`;
  html += `</html>`;

  return html;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));

const faturaTexto = gerarFaturaStr(faturas, pecas);
const faturaHtml = gerarFaturaHTML(faturas, pecas);

console.log(faturaTexto);
console.log('\n-----\n');
console.log(faturaHtml);
