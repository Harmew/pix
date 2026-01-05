// @ts-check

/** @classdesc Classe para validar dados */
export default class Validador {
  /**
   * Valida se um CPF é válido
   * @param {String} cpf CPF a ser validado
   * @returns {Boolean} true se o CPF é válido, false se não é válido
   */
  static validar_cpf = (cpf) => {
    if (typeof cpf !== "string") return false;
    cpf = cpf.replace(/[\s.-]*/gim, "");
    if (
      !cpf ||
      cpf.length != 11 ||
      cpf == "00000000000" ||
      cpf == "11111111111" ||
      cpf == "22222222222" ||
      cpf == "33333333333" ||
      cpf == "44444444444" ||
      cpf == "55555555555" ||
      cpf == "66666666666" ||
      cpf == "77777777777" ||
      cpf == "88888888888" ||
      cpf == "99999999999"
    ) {
      return false;
    }
    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto == 10 || resto == 11) resto = 0;
    if (resto != parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto == 10 || resto == 11) resto = 0;
    if (resto != parseInt(cpf.substring(10, 11))) return false;
    return true;
  };

  /**
   * Valida se um CNPJ é válido
   * @param {String} cnpj CNPJ a ser validado
   * @returns {Boolean} true se o CNPJ é válido, false se não é válido
   */
  static validar_cnpj = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]+/g, "");

    if (cnpj === "") {
      return false;
    }

    if (cnpj.length !== 14) {
      return false;
    }

    if (
      cnpj === "00000000000000" ||
      cnpj === "11111111111111" ||
      cnpj === "22222222222222" ||
      cnpj === "33333333333333" ||
      cnpj === "44444444444444" ||
      cnpj === "55555555555555" ||
      cnpj === "66666666666666" ||
      cnpj === "77777777777777" ||
      cnpj === "88888888888888" ||
      cnpj === "99999999999999"
    ) {
      return false;
    }

    // Valida DVs
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;

    return true;
  };

  /**
   * Valida se um celular é válido
   * @param {String} celular Celular a ser validado
   * @returns {Boolean} true se o celular é válido, false se não é válido
   */
  static validar_celular = (celular) => {
    celular = celular.replaceAll(/\D/g, "");
    if (!(celular.length >= 10 && celular.length <= 11)) return false;

    if (celular.length == 11 && Number.parseInt(celular.substring(2, 3)) != 9) return false;

    for (let n = 0; n < 10; n++) {
      if (celular == new Array(11).join(n.toString()) || celular == new Array(12).join(n.toString())) return false;
    }

    const codigosDDD = [
      11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51,
      53, 54, 55, 61, 62, 64, 63, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94,
      95, 96, 97, 98, 99,
    ];

    if (!codigosDDD.includes(Number.parseInt(celular.substring(0, 2)))) return false;

    if (new Date().getFullYear() < 2017) return true;
    if (celular.length == 10 && ![2, 3, 4, 5, 7].includes(Number.parseInt(celular.substring(2, 3)))) return false;

    return true;
  };

  /**
   * Valida se um e-mail é válido
   * @param {String} email E-mail a ser validado
   * @returns {Boolean} true se o e-mail é válido, false se não é válido
   */
  static validar_email = (email) => {
    if (typeof email !== "string") return false;

    const regex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}(\.[0-9]{1,3}){3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return regex.test(email.toLowerCase());
  };

  /**
   * Valida se um nome é válido
   * @param {String} nome Nome a ser validado
   * @returns {Boolean} true se o nome é válido, false se não é válido
   */
  static validar_nome = (nome) => {
    return nome.length > 0 && nome.length <= 25;
  };

  /**
   * Valida se uma referencia é válida
   * @param {String} referencia Referencia a ser validada
   * @returns {Boolean} true se a referencia é válida, false se não é válida
   */
  static validar_referencia = (referencia) => {
    return referencia.length > 0 && referencia.length <= 20;
  };

  /**
   * Valida se um valor é válido
   * @param {String} valor Valor a ser validado
   * @returns {Boolean} true se o valor é válido, false se não é válido
   */
  static validar_valor = (valor) => {
    if (!valor) return false;
    return !isNaN(parseFloat(valor));
  };
}
