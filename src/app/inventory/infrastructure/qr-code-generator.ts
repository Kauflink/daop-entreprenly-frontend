import { ErrorCorrectLevel, QRCode } from 'qrcode-generator-ts/js';

export function buildQrCodeDataUrl(value: string, size = 90): string {
  const text = value.trim() || ' ';
  const maxTypeNumber = 40;

  for (let typeNumber = 1; typeNumber <= maxTypeNumber; typeNumber += 1) {
    try {
      const qr = new QRCode();
      qr.setTypeNumber(typeNumber);
      qr.setErrorCorrectLevel(ErrorCorrectLevel.M);
      qr.addData(text);
      qr.make();

      const moduleCount = qr.getModuleCount();
      const cellSize = Math.max(2, Math.floor(size / (moduleCount + 8)));
      return qr.toDataURL(cellSize, cellSize * 4);
    } catch {
      // Try the next QR version until the value fits.
    }
  }

  throw new Error('QR value is too long to encode.');
}
