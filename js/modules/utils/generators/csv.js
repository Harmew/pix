// @ts-check

/**
 * @typedef {import('../../interfaces/types.js').Pagador} Pagador
 * @typedef {import('../../interfaces/types.js').PagadorCSV} PagadorCSV
 */

/**
 * @class CSV
 * @classdesc Classe para gerar CSV
 */
export default class CSV {
  /**
   * Gera um arquivo CSV
   * @param {Pagador[]} data Dados a serem convertidos em CSV
   * @param {String} filename Nome do arquivo
   * @returns {Void}
   */
  static gerar_csv = (data, filename = "pix") => {
    const csv = this.converter_para_csv(data);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   *  Converte um array de objetos para CSV
   * @param {Pagador[]} data
   * @returns {String} CSV gerado
   */
  static converter_para_csv = (data) => {
    let csv = "\uFEFF";
    csv += "JOGADOR;VALOR;CÓDIGO\r\n";

    data.forEach((pagador) => {
      const referencia = pagador.referencia || "";
      const valor = `R$ ${pagador.valor.replace(".", ",") ?? ""}`;
      const codigo = pagador.pix || "";
      csv += `"${referencia}";"${valor}";"${codigo}"\r\n`;
    });

    return csv;
  };

  /**
   * Converte o conteúdo CSV para um array de objetos pagadores
   * @param {String | ArrayBuffer} csv - Conteúdo CSV
   * @returns {PagadorCSV[]} - Lista de pagadores
   */
  static parse_csv_to_pagadores = (csv) => {
    const lines = csv
      .toString()
      .replace(/"/g, "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    const pagadores = [];

    lines.forEach((line) => {
      const [referencia, valor] = line.split(";").map((item) => item.trim());
      if (referencia && valor) {
        pagadores.push({
          referencia: referencia.substring(0, 20),
          valor: valor.replace("R$ ", "").replace("R$", "").replace(",", "."),
        });
      }
    });
    return pagadores;
  };
}
