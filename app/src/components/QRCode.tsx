import { QRCodeSVG } from 'qrcode.react';

export function QRCode({ value, size = 200 }: { value: string; size?: number }) {
  return (
    <QRCodeSVG
      value={value}
      size={size}
      bgColor="#ffffff"
      fgColor="#111111"
      level="M"
      style={{ display: 'block', borderRadius: 6 }}
    />
  );
}
