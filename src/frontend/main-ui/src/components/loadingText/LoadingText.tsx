import { useEffect, useState } from "react";

interface Props {
    text?: string,
    dotsNum?: number
}

const LoadingText = ({ text = "Loading", dotsNum = 5 }: Props) => {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const timer = setInterval(() => {
      setDots((prev) => (prev.length >= dotsNum ? "." : prev + "."));
    }, 500);

    return () => clearInterval(timer);
  }, [dotsNum]);

  return <>{text + dots}</>;
};

export default LoadingText;
