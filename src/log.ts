const logEnabled = true;
const now = (): string => new Date().toISOString();

export default function Log(category: string): (message: () => string) => void {
  if (logEnabled) {
    category = ' [' + category + '] ';
    return (message) => console.log(now() + category + message());
  } else {
    return (message) => {};
  }
}
