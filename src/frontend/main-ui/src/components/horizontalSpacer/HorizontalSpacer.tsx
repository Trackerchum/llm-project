interface Props {
    size?: "xs" | "sm" | "lg" | "xl"
}

const HorizontalSpacer = ({ size }: Props) => {
    let style = { height: "1.5rem" }
    if (size) {
        switch (size) {
            case "xs":
                style.height = "0.5rem";
                break;
            case "sm":
                style.height = "1rem";
                break;
            case "lg":
                style.height = "2rem";
                break;
            case "xl":
                style.height = "4rem";
                break;
            default:
                break;
        }
    }

    return <div style={style} />
}

export default HorizontalSpacer;
