// @ts-check

import Chave from "./chave";

// Utils
import N from "./utils/normalizador";
import V from "./utils/validador";
import M from "./utils/merchant";
import E from "./utils/erro";
import QR from "./utils/generators/qrcode";
import CSV from "./utils/generators/csv";
import PDF from "./utils/generators/pdf";

// Constants
import SVGs from "./constants/svg.json";

/**
 * Pagador Object
 * @typedef {Object} Pagador
 * @property {HTMLInputElement} referencia_input - Input do pagador
 * @property {HTMLInputElement} valor_input - Input do pagador
 * @property {String} id - ID do pagador
 * @property {String} referencia - Referencia do pagador
 * @property {String} valor - Valor a ser pago
 * @property {String | Undefined } pix - Código Pix
 */

/**
 * Pagador CSV
 * @typedef {Object} PagadorCSV
 * @property {String} referencia - Referencia do pagador
 * @property {String} valor - Valor a ser pago
 */

/**
 * @class Pix
 * @classdesc Classe para gerar códigos Pix
 */
export default class Pix {
  /**
   * Inicializa o formulário do Pix
   * @param {String} formulario - Formulário do Pix
   * @param {String} tipo_chave_input - Input do tipo de chave
   * @param {String} chave_input - Input da chave
   * @param {String} adicionar_pagador_btn - Botão para adicionar pagador
   * @param {String} importar_pagador_csv_btn - Botão para importar pagadores via CSV
   * @param {String} pagadores_div - Div que contém os pagadores
   * @param {String} recebedor_div - Seção que contém o resultado
   * @param {String} resultado_div - Div que contém o resultado
   */
  constructor(
    formulario,
    tipo_chave_input,
    chave_input,
    adicionar_pagador_btn,
    importar_pagador_csv_btn,
    pagadores_div,
    recebedor_div,
    resultado_div
  ) {
    /** @type {HTMLFormElement | Null} */
    this.formulario = document.querySelector(formulario);
    /** @type {HTMLButtonElement | Null} */
    this.adicionar_pagador_btn = document.querySelector(adicionar_pagador_btn);
    /** @type {HTMLButtonElement | Null} */
    this.importar_pagador_csv_btn = document.querySelector(importar_pagador_csv_btn);
    /** @type {HTMLDivElement | Null} */
    this.pagadores_div = document.querySelector(pagadores_div);
    /** @type {HTMLDivElement | Null} */
    this.recebedor_div = document.querySelector(recebedor_div);
    /** @type {HTMLDivElement | Null} */
    this.resultado_div = document.querySelector(resultado_div);
    /** @type {Number} */
    this.qtd_pagadores = 1;
    /** @type {Chave | Null} */
    this.chave = new Chave(tipo_chave_input, chave_input);

    if (this.adicionar_pagador_btn) {
      this.adicionar_pagador_btn.addEventListener("click", () => this.adicionar_pagador());
    }

    if (this.importar_pagador_csv_btn) {
      this.importar_pagador_csv_btn.addEventListener("click", () => this.importar_pagadores_csv());
    }
  }

  /**
   * Gera um código Pix
   * @returns {Void}
   */
  gerar_pix() {
    if (!this.chave || !this.formulario) throw new Error("Chave ou formulário não encontrados");
    if (!this.recebedor_div || !this.resultado_div) throw new Error("Divs de resultado não encontradas");

    /** @type {Boolean} */
    let valido = true;

    E.limpar_erros(this.formulario);
    this.chave.adicionar_validador();
    valido = this.chave.validar();

    /** @type {HTMLInputElement | Null} */
    const nome_input = this.formulario.querySelector("#pix-nome");
    /** @type {HTMLInputElement | Null} */
    const cidade_input = this.formulario.querySelector("#pix-cidade");

    if (!nome_input || !cidade_input) throw new Error("Inputs de nome e cidade não encontrados");

    valido = this.validarInput(nome_input, N.normalizar, V.validar_nome) && valido;
    this.adicionar_validador(nome_input, N.normalizar, V.validar_nome);

    valido = this.validarInput(cidade_input, N.normalizar, V.validar_cidade) && valido;
    this.adicionar_validador(cidade_input, N.normalizar, V.validar_cidade);

    const pagadores = this.get_pagadores();
    if (!pagadores.length) throw new Error("Nenhum pagador encontrado");

    pagadores.forEach((pagador) => {
      valido = this.validarInput(pagador.referencia_input, N.normalizar_referencia, V.validar_referencia) && valido;
      this.adicionar_validador(pagador.referencia_input, N.normalizar_referencia, V.validar_referencia);

      valido = this.validarInput(pagador.valor_input, N.normalizar_valor, V.validar_valor) && valido;
      this.adicionar_validador(pagador.valor_input, N.normalizar_valor, V.validar_valor);
    });

    if (!valido) return;

    pagadores.forEach((pagador) => {
      if (!this.chave) throw new Error("Chave não encontrada");

      pagador.pix = M.criar_codigo_pix({
        chave: this.chave.get_chave(),
        nome: nome_input.value,
        cidade: cidade_input.value,
        valor: parseFloat(pagador.valor).toFixed(2),
        referencia: pagador.referencia,
      });
    });

    this.renderizar_pixs(this.chave.tipo, this.chave.get_chave_raw(), nome_input.value, pagadores);
  }

  /**
   * Adiciona um validador a um input
   * @param {HTMLInputElement} input
   * @param {Function | Null} normalizador
   * @param {Function} validador
   * @returns {Void}
   */
  adicionar_validador(input, normalizador, validador) {
    if (!input || !normalizador || !validador) throw new Error("Input ou funções inválidas");

    const elemento = /** @type {HTMLInputElement & { __validadorListener?: EventListener }} */ (input);
    if (elemento.__validadorListener) {
      elemento.removeEventListener("input", elemento.__validadorListener);
    }

    /** @param {Event} e */
    const listener = (e) => {
      const target = /** @type {HTMLInputElement} */ (e.target);

      const txt = normalizador(target.value || "");
      const valid = validador(txt);

      valid ? E.limpar_erro(input) : E.mostrar_erro(input);
    };

    elemento.__validadorListener = listener;
    elemento.addEventListener("input", listener);
  }

  /**
   * Adiciona um pagador ao formulário
   * @returns {Void}
   */
  adicionar_pagador() {
    if (!this.pagadores_div) return;

    const pagador_id = `pagador-${this.qtd_pagadores}`;

    const div = document.createElement("div");
    div.classList.add("row", "g-3", "mt-1");
    div.id = pagador_id;

    const referencia_div = document.createElement("div");
    referencia_div.classList.add("col-sm-7");
    referencia_div.innerHTML = `
    <label for="pix-referencia-pagador-${this.qtd_pagadores}" class="form-label w-100 text-start">Referência do pagador <span class="text-muted">(até 20 letras)</span></label>
    <input type="text" class="form-control" id="pix-referencia-pagador-${this.qtd_pagadores}" name="pix-referencia-pagador-${this.qtd_pagadores}" maxlength="20"/>
  `;

    const valor_div = document.createElement("div");
    valor_div.classList.add("col-sm-5");
    valor_div.innerHTML = `
    <label for="pix-valor-pagador-${this.qtd_pagadores}" class="form-label w-100 text-start">Valor</label>
    <div class="input-group w-full"><span class="input-group-text">R$</span><input type="number" step="0.01" min="0.01" max="999999999.99" placeholder="0,00" class="form-control" id="pix-valor-pagador-${this.qtd_pagadores}" name="pix-valor-pagador-${this.qtd_pagadores}"/><button type="button" class="btn btn-danger" id="remove-pagador" data-id="${pagador_id}">${SVGs.TRASH}</button>
    </div>
  `;

    div.appendChild(referencia_div);
    div.appendChild(valor_div);

    /** @type {HTMLButtonElement | Null} */
    const remover_pagador_btn = valor_div.querySelector("#remove-pagador");

    if (!remover_pagador_btn) {
      console.error("Botão de remover pagador não encontrado");
      return;
    }

    if (remover_pagador_btn) {
      remover_pagador_btn.addEventListener("click", () => {
        if (!remover_pagador_btn?.dataset?.id) {
          console.error("ID do pagador não encontrado");
          return;
        }

        this.remover_pagador(remover_pagador_btn?.dataset?.id);
      });
    }

    this.pagadores_div.appendChild(div);
    this.qtd_pagadores++;
  }

  /**
   * Adiciona um pagador do CSV ao formulário
   * @param {PagadorCSV} pagador - Objeto de pagador contendo 'referencia' e 'valor'
   * @returns {Void}
   */
  adicionar_pagador_csv(pagador) {
    if (!this.pagadores_div) return;

    const pagador_id = `pagador-${this.qtd_pagadores}`;

    const div = document.createElement("div");
    div.classList.add("row", "g-3", "mt-1");
    div.id = pagador_id;

    const referencia_div = document.createElement("div");
    referencia_div.classList.add("col-sm-7");
    referencia_div.innerHTML = `
    <label for="pix-referencia-pagador-${this.qtd_pagadores}" class="form-label w-100 text-start">Referência do pagador <span class="text-muted">(até 20 letras)</span></label>
    <input type="text" class="form-control" id="pix-referencia-pagador-${this.qtd_pagadores}" name="pix-referencia-pagador-${this.qtd_pagadores}" maxlength="20" value="${pagador.referencia}" />
  `;

    const valor_div = document.createElement("div");
    valor_div.classList.add("col-sm-5");
    valor_div.innerHTML = `
      <label for="pix-valor-pagador-${this.qtd_pagadores}" class="form-label w-100 text-start">Valor</label>
      <div class="input-group w-full"><span class="input-group-text">R$</span><input type="number" step="0.01" min="0.01" max="999999999.99" placeholder="0,00" class="form-control" id="pix-valor-pagador-${this.qtd_pagadores}" name="pix-valor-pagador-${this.qtd_pagadores}" value="${pagador.valor}" /><button type="button" class="btn btn-danger" id="remove-pagador" data-id="${pagador_id}">${SVGs.TRASH}</button>
    </div>
    `;

    div.appendChild(referencia_div);
    div.appendChild(valor_div);

    /** @type {HTMLButtonElement | Null} */
    const remover_pagador_btn = valor_div.querySelector("#remove-pagador");

    if (!remover_pagador_btn && this.qtd_pagadores > 1) {
      console.error("Botão de remover pagador não encontrado");
      return;
    }

    if (remover_pagador_btn && this.qtd_pagadores > 1) {
      remover_pagador_btn.addEventListener("click", () => {
        if (!remover_pagador_btn?.dataset?.id) {
          console.error("ID do pagador não encontrado");
          return;
        }

        this.remover_pagador(remover_pagador_btn?.dataset?.id);
      });
    }

    this.pagadores_div.appendChild(div);
    this.qtd_pagadores++;

    this.pagadores_div.appendChild(div);
    this.qtd_pagadores++;
  }

  /**
   * Importa pagadores via CSV
   * @returns {Void}
   */
  importar_pagadores_csv() {
    const input_csv = document.createElement("input");
    input_csv.type = "file";
    input_csv.accept = ".csv";

    input_csv.addEventListener("change", (e) => {
      try {
        const target = /** @type {HTMLInputElement} */ (e.target);
        if (!target.files) throw new Error("Arquivo não encontrado");

        const file = target.files[0];
        if (!file) throw new Error("Arquivo não encontrado");

        const reader = new FileReader();
        reader.onload = () => {
          const csv = reader.result;
          if (csv === null) throw new Error("Arquivo CSV inválido");

          const pagadores = CSV.parse_csv_to_pagadores(csv);
          if (!pagadores) throw new Error("Erro ao ler arquivo CSV");

          pagadores.forEach((pagador) => {
            this.adicionar_pagador_csv(pagador);
          });
        };

        // Lê o arquivo CSV como texto
        reader.readAsText(file);
      } catch (error) {
        console.error(error);
      }
    });

    input_csv.click();
  }

  /**
   * Remove um pagador do formulário
   * @param {String} id - ID do pagador
   */
  remover_pagador(id) {
    const pagador = document.getElementById(id);

    if (!pagador) {
      console.error("Pagador não encontrado");
      return;
    }

    pagador.remove();
  }

  /**
   * Renderiza os códigos Pix ao HTML
   * @param {String} tipo - Tipo de chave
   * @param {String} chave - Chave Pix
   * @param {String} nome - Nome do recebedor
   * @param {Pagador[]} pagadores
   */
  async renderizar_pixs(tipo, chave, nome, pagadores) {
    if (!this.recebedor_div || !this.resultado_div) {
      console.error("Div resultado não encontrado");
      return;
    }

    this.resultado_div.innerHTML = "";
    this.recebedor_div.innerHTML = `
      <hr />
      <h4 class="mb-3">Informacões do Recebedor</h4>
      <div class="card">
        <ul class="list-group list-group-flush">
          <li class="list-group-item text-start"><b>Chave PIX:</b> ${chave}</li>
          <li class="list-group-item text-start"><b>Nome:</b> ${nome}</li>
          <li class="list-group-item text-start"><b>Tipo de Chave:</b> ${tipo}</li>
        </ul>
      </div>
    `;

    const pagadores_div = document.createElement("div");
    pagadores_div.classList.add("d-flex", "justify-content-between", "align-items-center", "g-3");

    const pagadores_titulo = document.createElement("h4");
    pagadores_titulo.classList.add("my-3");
    pagadores_titulo.innerText = "QR Codes";

    const div_buttons = document.createElement("div");
    div_buttons.classList.add("d-flex", "gap-1");

    const btn_export_csv = document.createElement("button");
    btn_export_csv.id = "pix-export-csv-btn";
    btn_export_csv.classList.add("btn", "btn-dark", "btn-sm");
    btn_export_csv.type = "button";
    btn_export_csv.innerHTML = `${SVGs.CSV}`;

    btn_export_csv.addEventListener("click", () => {
      CSV.gerar_csv(pagadores, "pix");
    });

    const btn_print_csv = document.createElement("button");
    btn_print_csv.id = "pix-print-btn";
    btn_print_csv.classList.add("btn", "btn-secondary", "btn-sm");
    btn_print_csv.type = "button";
    btn_print_csv.innerHTML = `${SVGs.PRINTER}`;

    btn_print_csv.addEventListener("click", async () => {
      await PDF.gerar_pdf(tipo, chave, nome, pagadores);
    });

    this.resultado_div.appendChild(pagadores_div);
    pagadores_div.appendChild(pagadores_titulo);
    pagadores_div.appendChild(div_buttons);
    div_buttons.appendChild(btn_print_csv);
    div_buttons.appendChild(btn_export_csv);

    for (let pagador of pagadores) {
      if (!pagador.pix) continue;

      const card_resultado = document.createElement("div");
      card_resultado.classList.add("card", "mb-3", "d-flex", "justify-content-between", "flex-row");

      const qr_div = document.createElement("div");
      qr_div.classList.add("d-flex", "justify-content-between");
      qr_div.innerHTML = `<img class="qrcode img-fluid rounded-start" src="${await QR.gerar_qrcode(
        pagador.pix
      )}" alt="${pagador.referencia}" />`;

      const card_body = document.createElement("div");
      card_body.classList.add("card-body", "overflow-hidden");

      const ul_pagador = document.createElement("ul");
      ul_pagador.classList.add("list-group", "text-start", "h-100");

      const li_referencia = document.createElement("li");
      li_referencia.classList.add("card-text", "list-item", "text-truncate");
      li_referencia.innerHTML = `<b>Referência:</b> ${pagador.referencia}`;

      const li_valor = document.createElement("li");
      li_valor.classList.add("card-text", "text-truncate");
      li_valor.innerHTML = `<b>Valor:</b> R$ ${pagador.valor.replace(".", ",")}`;

      const li_clipboard = document.createElement("li");
      li_clipboard.classList.add("card-text", "pt-2");
      li_clipboard.innerHTML = `
        <div class="align-items-center">
          <div class="input-group mb-3">
            <button id="btn-${pagador.id}" class="btn btn-secondary d-flex align-items-center" type="button" data-clipboard-target="#in-${pagador.id}"title="Copiar">${SVGs.COPY}</button>
            <input id="in-${pagador.id}" type="text" class="form-control" aria-describedby="btn-${pagador.id}" value="${pagador.pix}" readonly/>
          </div>
        </div>
      `;

      ul_pagador.appendChild(li_referencia);
      ul_pagador.appendChild(li_valor);
      ul_pagador.appendChild(li_clipboard);

      card_body.appendChild(ul_pagador);
      card_resultado.appendChild(qr_div);
      card_resultado.appendChild(card_body);
      this.resultado_div.appendChild(card_resultado);

      const copy_btn = document.getElementById(`btn-${pagador.id}`);
      if (copy_btn) {
        copy_btn.addEventListener("click", () => {
          /** @type {HTMLInputElement | Null} */
          const input = document.querySelector(`#in-${pagador.id}`);

          if (!input) {
            console.error("Input não encontrado");
            return;
          }

          navigator.clipboard.writeText(input.value);
        });
      }

      this.recebedor_div.scrollIntoView({ behavior: "smooth" });
    }
  }

  /**
   * Retorna os pagadores do formulário
   * @returns {Pagador[]} Lista de pagadores do formulário
   */
  get_pagadores() {
    /** @type {Pagador[]} */
    const pagadores = [];

    if (!this.formulario) {
      console.error("Formulário não encontrado");
      return pagadores;
    }

    this.formulario.querySelectorAll("div[id^='pagador-']").forEach((pagador) => {
      const id = pagador.id;

      /** @type {HTMLInputElement | Null} */
      const referencia_input = pagador.querySelector(`input[id^='pix-referencia-${id}']`);
      /** @type {HTMLInputElement | Null} */
      const valor_input = pagador.querySelector(`input[id^='pix-valor-${id}']`);

      if (!referencia_input || !valor_input) {
        console.error("Inputs de referencia e valor não encontrados");
        return;
      }

      const referencia = N.normalizar_referencia(referencia_input.value);
      const valor = N.normalizar_valor(Number(valor_input.value).toFixed(2));

      pagadores.push({
        id: id.split("-")[1],
        referencia_input,
        valor_input,
        referencia,
        valor,
        pix: undefined,
      });
    });

    return pagadores;
  }

  /**
   * Normaliza e valida um input.
   * @param {HTMLInputElement} input
   * @param {Function} normalizador
   * @param {Function} validador
   * @returns {boolean} Se for válido retorna true, senão false
   */
  validarInput(input, normalizador, validador) {
    const valorNormalizado = normalizador(input.value);
    if (!validador(valorNormalizado)) {
      E.mostrar_erro(input);
      return false;
    }
    E.limpar_erro(input);
    return true;
  }

  init() {
    if (
      !this.formulario ||
      !this.adicionar_pagador_btn ||
      !this.importar_pagador_csv_btn ||
      !this.pagadores_div ||
      !this.recebedor_div ||
      !this.resultado_div ||
      !this.chave
    ) {
      console.error("Pix não inicializado: argumentos inválidos");
      return;
    }

    this.chave.init();
    this.adicionar_pagador();

    this.formulario.addEventListener("submit", (event) => {
      event.preventDefault();
      this.gerar_pix();
    });
  }
}
