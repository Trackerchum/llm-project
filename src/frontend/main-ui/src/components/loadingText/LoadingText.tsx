import { useEffect, useState } from "react";

interface Props {
    text?: string,
    dotsNum?: number
}

const LoadingText = ({ text = "Loading", dotsNum = 5 }: Props) => {
    const [dots, setDots] = useState(".");
    let interval: NodeJS.Timer;

    useEffect(() => {
        if (!interval) {
            interval = setInterval(() => {
                if (dots.length === dotsNum) {
                    setDots(".");
                }
                else {
                    setDots(dots => dots + ".");
                }
            }, 500);
        }

        return () => clearInterval(interval);
    }, [dots]);

    return <>{text + dots}</>
}

export default LoadingText;
