// @ts-check

/**
 * @typedef {import('../../interfaces/types.js').Pagador} Pagador
 */

import QR from "./qrcode";

// Logo
import logo from "../../constants/logo.json";

/**
 * @class Pdf
 * @classdesc Classe para gerar PDF
 */
export default class Pdf {
  /**
   * Gera um arquivo CSV
   * @param {String} chave Chave do recibo
   * @param {String} nome Nome do recibo
   * @param {Pagador[]} data Dados a serem convertidos em CSV
   * @returns {Promise<void>}
   */
  static gerar_pdf = async (chave, nome, data) => {
    try {
      const html = await this.gerar_html(chave, nome, data);

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
      setTimeout(() => iframe.remove(), 1500);
    } catch (error) {
      console.error(error);
    }
  };
  /**
   * @param {String} chave Chave do recibo
   * @param {String} nome Nome do recibo
   * @param {Pagador[]} data Dados a serem convertidos em CSV
   * @returns {Promise<String>} HTML gerado
   */
  static async gerar_html(chave, nome, data) {
    const qrCodes = await Promise.all(
      data.map(async (pagador) => {
        if (!pagador.pix) throw new Error("O código Pix não foi gerado");
        const qr = await QR.gerar_qrcode(pagador.pix);

        return `
            <div class="pagador">
              <div class="pagador-content">
                <div class="d-flex justify-content-between">
                  <img class="logo img-fluid" src="${logo.base64}" />
                </div>

                <div class="d-flex justify-content-between">
                  <img class="qrcode img-fluid rounded-start" src="${qr}" alt="${pagador.referencia}" />
                </div>

                <ul class="list-group text-start text-center">
                  <li class="card-text text-truncate"><b>Chave Pix:</b> ${chave}</li>
                  <li class="card-text text-truncate"><b>Jogador:</b> ${pagador.referencia}</li>
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
          <script>
            window.addEventListener('DOMContentLoaded', function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 500);
            });
          </script>
          <style>

            *,
            ::after,
            ::before {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
              font-size: 1rem;
              font-weight: 400;
              line-height: 1.2;
              color: #000000;
              background-color: #ffffff;
              -webkit-text-size-adjust: 100%;
              -webkit-tap-highlight-color: transparent;
              display: block;
            }

            ul {
              margin-top: 0;
              margin-bottom: 1rem;
              padding-left: 2rem;
            }

            img,
            svg {
              vertical-align: middle;
            }

            b {
              font-weight: bolder;
            }

            li {
              display: list-item;
              text-align: -webkit-match-parent;
              unicode-bidi: isolate;
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

            .logo {
              margin: 0 auto;
              display: block;
              width: 100px;
              height: 100px;
            }

            .text-start {
              text-align: left !important;
            }

            .text-center {
              text-align: center !important;
            }

            .d-flex {
              display: flex !important;
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

            .img-fluid {
              max-width: 100%;
              height: auto;
            }

            .rounded-start {
              border-bottom-left-radius: 0.25rem !important;
              border-top-left-radius: 0.25rem !important;
            }

            .text-truncate {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            @media print {

              @page {
                size: 40mm auto;
                margin: 0;
              }

              body {
                width: 100%;
                font-size: 10px;
                margin: 0 auto;
                padding: 0;
              }

              .pagador {
                page-break-after: always;
                break-after: page;
              }

              .pagador:last-child {
                page-break-after: auto;
                break-after: auto;
              }

              ul {
                padding-left: 5px;
              }

            }
          </style>
        </head>
        <body>
          ${qrCodes.join("")}
        </body>
      </html>
  `;
  }
}
