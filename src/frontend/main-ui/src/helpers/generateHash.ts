const generateHash = (input: string) => {
    let hash = 0;
    for (const char of input) {
        hash = (hash << 5) - hash + char.charCodeAt(0);
        hash |= 0; // Constrain to 32bit integer
    }
    return hash;
};

export { generateHash }