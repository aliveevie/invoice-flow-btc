
import React, { useEffect, useMemo, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

interface QRCodeProps {
  data: string;
  size?: number;
  className?: string;
}

const QRCode: React.FC<QRCodeProps> = ({ data, size = 250, className }) => {
  const ref = useRef<HTMLDivElement>(null);

  const qrCode = useMemo(() => {
    return new QRCodeStyling({
      width: size,
      height: size,
      data: data,
      dotsOptions: {
        color: '#00d58e',
        type: 'extra-rounded',
      },
      backgroundOptions: {
        color: 'transparent',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 5,
      },
    });
  }, [size]);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = '';
      qrCode.append(ref.current);
    }
    return () => {
      if (ref.current) ref.current.innerHTML = '';
    };
  }, [qrCode]);

  useEffect(() => {
    qrCode.update({ data });
  }, [qrCode, data]);

  return <div ref={ref} className={className} />;
};

export default QRCode;
