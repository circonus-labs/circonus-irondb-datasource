const logEnabled = true;
const getNow = (): string => new Date().toISOString();

export default function Log(category: string): (message: () => string) => void {
    if (logEnabled) {
        return (message) => console.log(`${getNow()} [${category}] ${message()}`);
    }
    else {
        return (message) => {};
    }
}
