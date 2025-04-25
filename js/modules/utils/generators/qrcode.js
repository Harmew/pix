// @ts-check

import QRCodeWithLogo from "qrcode-with-logos";

/** @classdesc Classe para gerar QRCode */
export default class QRCode {
  /**
   * Gera um QRCode a partir de um texto
   * @param {String} pix
   * @returns {Promise<HTMLImageElement>}
   */
  static async gerar_qrcode(pix) {
    try {
      const qrCode = new QRCodeWithLogo({
        content: pix,
        width: 300,
        logo: {
          src: "public/logo.png",
          borderWidth: 0,
          borderRadius: 50,
        },
      });
      return await qrCode.getImage();
    } catch (err) {
      throw new Error("Falha ao gerar o QRCode");
    }
  }
}
