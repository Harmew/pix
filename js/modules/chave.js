// @ts-check

import Validador from "./utils/validador";

// Constants
import chave from "./constants/chave.json";

// Utils
import Erro from "./utils/erro";

/** @classdesc Classe para manipular a chave PIX*/
export default class Chave {
  /** @type {HTMLSelectElement | Null} */ tipo_input;
  /** @type {HTMLInputElement | Null} */ chave_input;
  /** @type {String} */ tipo = "CPF";
  /** @type {Boolean} */ validando = false;

  /**
   * @param {String} tipo_input
   * @param {String} chave_input
   */
  constructor(tipo_input, chave_input) {
    this.tipo_input = document.querySelector(tipo_input);
    this.chave_input = document.querySelector(chave_input);
  }

  /** Atualiza o formulário de acordo com o tipo de chave selecionado  */
  atualizar_input() {
    if (!this.tipo_input || !this.chave_input) return;

    this.tipo = this.tipo_input.value;

    const config = chave[this.tipo];
    if (!config) throw new Error("Tipo de chave inválido");

    const grupo = this.chave_input.parentElement;
    if (!grupo) throw new Error("Input não está dentro de um container");

    let helpElement = grupo.querySelector(".input-group-text");

    if (config.help) {
      if (!helpElement) {
        helpElement = document.createElement("span");
        helpElement.className = "input-group-text";
        grupo.insertBefore(helpElement, this.chave_input);
      }

      helpElement.textContent = config.help;
    } else if (helpElement) {
      helpElement.remove();
    }

    this.chave_input.placeholder = config.placeholder;
    this.chave_input.value = "";
  }

  /**
   *  Valida a chave PIX
   * @returns {Boolean}
   */
  validar() {
    if (!this.chave_input) return false;

    const valor = this.chave_input.value;
    let valido = false;

    switch (this.tipo) {
      case "CPF":
        valido = Validador.validar_cpf(valor);
        break;
      case "CNPJ":
        valido = Validador.validar_cnpj(valor);
        break;
      case "CELULAR":
        valido = Validador.validar_celular(valor);
        break;
      case "EMAIL":
        valido = Validador.validar_email(valor);
        break;
      case "ALEATORIA":
        valido = true;
        break;
    }

    if (valido) Erro.limpar_erro(this.chave_input);
    else Erro.mostrar_erro(this.chave_input);

    return valido;
  }

  /**
   * Retorna o valor da chave PIX
   * @returns {String}
   */
  get_chave() {
    if (!this.chave_input) return "";

    let chave = this.chave_input.value.toLocaleLowerCase();

    if (this.tipo == "CELULAR" || this.tipo == "CNPJ" || this.tipo == "CPF") {
      chave = chave.replaceAll(/\D/g, "");
    }

    if (this.tipo == "CELULAR") {
      chave = "+55" + chave;
    }

    return chave.trim();
  }

  /**
   * Retorna o valor da chave sem formatação
   * @returns {String}
   */
  get_chave_raw() {
    if (!this.chave_input) return "";
    return this.chave_input.value.trim();
  }

  /** Aplica a máscara na chave PIX */
  mascara() {
    if (!this.chave_input) return;

    const valor = this.chave_input.value;
    const config = chave[this.tipo];

    if (!config) throw new Error("Tipo de chave inválido");

    if (!config.mask) {
      this.chave_input.value = valor;
      return;
    }

    const mask = config.mask;
    const numeros = valor.replaceAll(/\D/g, ""); // Remove tudo que não for número

    if (numeros.length < mask.replaceAll(/\D/g, "").length) {
      this.chave_input.value = numeros; // Mantém apenas os números enquanto não completa o tamanho da máscara
      return;
    }

    let i = 0;
    this.chave_input.value = mask.replaceAll(/0/g, () => numeros[i++] || "");
  }

  /** Adiciona o evento de validação na chave PIX */
  adicionar_validador() {
    if (!this.chave_input || this.validando) return;

    this.chave_input.addEventListener("input", () => {
      this.validar();
      this.mascara();
    });

    this.validando = true;
  }

  init() {
    if (!this.tipo_input || !this.chave_input) throw new Error("Chave não inicializado: argumentos inválidos");

    this.tipo_input.addEventListener("change", () => this.atualizar_input());
    this.chave_input.addEventListener("input", () => this.mascara());

    this.atualizar_input();
  }
}
