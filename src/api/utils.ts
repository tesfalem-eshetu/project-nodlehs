export const SIMULATED_DELAY = 300;

export function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), SIMULATED_DELAY);
  });
}
