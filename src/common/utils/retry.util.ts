export async function retryRequest<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    if (retries > 0) {
      // && err.message.includes('503')) {
      console.warn(`Retrying after 503 error. Attempts left: ${retries}`);
      await new Promise((res) => setTimeout(res, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}