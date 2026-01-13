
import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

interface QRCodeProps {
  data: string;
  size?: number;
}

const QRCode: React.FC<QRCodeProps> = ({ data, size = 250 }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const qrCode = new QRCodeStyling({
      width: size,
      height: size,
      data: data,
      dotsOptions: {
        color: "#00d58e",
        type: "extra-rounded"
      },
      backgroundOptions: {
        color: "transparent",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5
      }
    });

    if (ref.current) {
      ref.current.innerHTML = '';
      qrCode.append(ref.current);
    }
  }, [data, size]);

  return <div ref={ref} className="bg-white p-4 rounded-2xl inline-block" />;
};

export default QRCode;
