const { formatarMoeda } = require('./util');

function gerarFaturaStr(fatura, calc) {
  let totalFatura = 0;
  let creditos = 0;
  let faturaStr = `Fatura ${fatura.cliente}\n`;

  for (const apre of fatura.apresentacoes) {
    const total = calc.calcularTotalApresentacao(apre);
    creditos += calc.calcularCredito(apre);
    faturaStr += `  ${calc.repo.getPeca(apre).nome}: ${formatarMoeda(total)} (${apre.audiencia} assentos)\n`;
    totalFatura += total;
  }

  faturaStr += `Valor total: ${formatarMoeda(totalFatura)}\n`;
  faturaStr += `Créditos acumulados: ${creditos} \n`;
  return faturaStr;
}

module.exports = gerarFaturaStr;
