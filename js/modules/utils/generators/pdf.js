// @ts-check

/**
 * @typedef {import('../../interfaces/types.js').Pagador} Pagador
 */

import QR from "./qrcode";

// Constants
import SVGs from "../../constants/svg.json";

/**
 * @class Pdf
 * @classdesc Classe para gerar PDF
 */
export default class Pdf {
  /**
   * Gera um arquivo CSV
   * @param {String} tipo Tipo do recibo
   * @param {String} chave Chave do recibo
   * @param {String} nome Nome do recibo
   * @param {Pagador[]} data Dados a serem convertidos em CSV
   * @returns {Promise<void>}
   */
  static gerar_pdf = async (tipo, chave, nome, data) => {
    try {
      const html = await this.gerar_html(tipo, chave, nome, data);

      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";

      document.body.appendChild(iframe);
      if (!iframe.contentWindow) throw new Error("Não foi possível criar o iframe");

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.writeln(html);
      doc.close();

      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  };
  /**
   * Gera um arquivo CSV
   * @param {String} tipo Tipo do recibo
   * @param {String} chave Chave do recibo
   * @param {String} nome Nome do recibo
   * @param {Pagador[]} data Dados a serem convertidos em CSV
   * @returns {Promise<String>} HTML gerado
   */
  static async gerar_html(tipo, chave, nome, data) {
    const qrCodes = await Promise.all(
      data.map(async (pagador, i, arr) => {
        if (!pagador.pix) throw new Error("O código Pix não foi gerado");
        const qr = await QR.gerar_qrcode(pagador.pix);
        qr.classList.add("qrcode", "img-fluid", "rounded-start");
        qr.alt = pagador.referencia;

        return `
          <div class="card ${i === 0 ? "" : "mt-4"}">
            <div class="d-flex justify-content-between">
              ${qr.outerHTML}
            </div>
            <div class="card-body overflow-hidden">
              <ul class="list-group text-start h-100 text-center">
                <li class="card-text list-item text-truncate"><b>Chave Pix:</b> ${chave}</li>
                <li class="card-text list-item text-truncate"><b>Referência:</b> ${pagador.referencia}</li>
                <li class="card-text text-truncate"><b>Valor:</b> R$ ${pagador.valor.replace(".", ",")}</li>
                </ul>
            </div>
          </div>
          `;
      }),
    );

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Recibo de ${nome}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            *,
            ::after,
            ::before {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans",
                sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
              font-size: 1rem;
              font-weight: 400;
              line-height: 1.5;
              color: #212529;
              background-color: #fff;
              -webkit-text-size-adjust: 100%;
              -webkit-tap-highlight-color: transparent;
              display: block;
            }

            ul {
              margin-top: 0;
              margin-bottom: 1rem;
            }

            ul {
              padding-left: 2rem;
            }

            hr:not([size]) {
              height: 1px;
            }

            hr {
              margin: 1rem 0;
              color: inherit;
              background-color: currentColor;
              border: 0;
              opacity: 0.25;
            }

            img,
            svg {
              vertical-align: middle;
            }

            h4 {
              font-size: calc(1.275rem + 0.3vw);
            }

            b {
              font-weight: bolder;
            }

            h4 {
              margin-top: 0;
              margin-bottom: 0.5rem;
              font-weight: 500;
              line-height: 1.2;
            }

            h4 {
              display: block;
              margin-block-start: 1.33em;
              margin-block-end: 1.33em;
              margin-inline-start: 0px;
              margin-inline-end: 0px;
              font-weight: bold;
              unicode-bidi: isolate;
            }

            li {
              display: list-item;
              text-align: -webkit-match-parent;
              unicode-bidi: isolate;
            }

            .container {
              width: 100%;
              padding-right: 0.75rem;
              padding-left: 0.75rem;
              margin-right: auto;
              margin-left: auto;
            }

            @media (min-width: 576px) {
              .container {
                max-width: 540px;
              }
            }

            @media (min-width: 768px) {
              .container {
                max-width: 720px;
              }
            }

            @media (min-width: 992px) {
              .container {
                max-width: 960px;
              }
            }

            .pt-2 {
              padding-top: 0.5rem !important;
            }

            .qrcode {
              margin: 0 auto;
              display: block;
              min-width: 150px;
              max-width: 150px;
              max-height: 150px;
              min-height: 150px;
              height: 150px;
              border-radius: 10px;
            }

            .text-start {
              text-align: left !important;
            }

            .text-center {
              text-align: center !important;
            }

            .mb-3 {
              margin-bottom: 1rem !important;
            }

            .mt-4 {
              margin-top: 1.5rem !important;
            }

            .d-flex {
              display: flex !important;
            }

            .card {
              position: relative;
              display: flex;
              flex-direction: column;
              min-width: 0;
              word-wrap: break-word;
              background-color: #fff;
              background-clip: border-box;
              border: 1px solid rgba(0, 0, 0, 0.125);
              border-radius: 0.25rem;
              padding: 1rem 1rem;
            }

            .card > .list-group:last-child {
              border-bottom-width: 0;
              border-bottom-right-radius: calc(0.25rem - 1px);
              border-bottom-left-radius: calc(0.25rem - 1px);
            }
            .card > .list-group:first-child {
              border-top-width: 0;
              border-top-left-radius: calc(0.25rem - 1px);
              border-top-right-radius: calc(0.25rem - 1px);
            }

            .list-group-flush {
              border-radius: 0;
            }

            .list-group-item:first-child {
              border-top-left-radius: inherit;
              border-top-right-radius: inherit;
            }

            .list-group-flush > .list-group-item {
              border-width: 0 0 1px;
            }

            .list-group {
              list-style: none;
              display: flex;
              flex-direction: column;
              padding-left: 0;
              margin-bottom: 0;
              border-radius: 0.25rem;
            }

            .justify-content-between {
              justify-content: space-between !important;
            }

            .flex-row {
              flex-direction: row !important;
            }

            .img-fluid {
              max-width: 100%;
              height: auto;
            }

            .rounded-start {
              border-bottom-left-radius: 0.25rem !important;
              border-top-left-radius: 0.25rem !important;
            }

            .overflow-hidden {
              overflow: hidden !important;
            }

            .card-body {
              flex: 1 1 auto;
              padding: 0.5rem 0.5rem;
            }

            .h-100 {
              height: 100% !important;
            }

            .text-truncate {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .my-3 {
              margin-top: 1rem !important;
              margin-bottom: 1rem !important;
            }

            @media print {
              @page {
                size: 40mm auto;
                margin: 0;
              }
              body {
                width: 40mm;
                font-size: 10px;
                line-height: 1.2;
              }
              .container {
                padding: 2px;
              }
              h4 {
                font-size: 12px;
                text-align: center;
              }
              ul {
                padding-left: 5px;
              }
            }
          </style>
        </head>
        <body class="container pt-2">
          <div class="text-center">${SVGs.PIX}</div>
          <div class="text-start">
            <hr />
            <h4 class="mb-3">Informacões do Recebedor</h4>
            <div class="card">
              <ul class="list-group list-group-flush">
                <li class="list-group-item text-start"><b>Chave PIX:</b> ${chave}</li>
                <li class="list-group-item text-start"><b>Nome:</b> ${nome}</li>
                <li class="list-group-item text-start"><b>Tipo de Chave:</b> ${tipo}</li>
              </ul>
            </div>
          </div>

          <h4 class="my-3">QR Codes</h4>
            ${qrCodes.join("")}
        </body>
      </html>
  `;
  }
}
