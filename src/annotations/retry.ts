import { logger } from "../utils/logger.js";

/**
 * Retry decorator that retries a method a specified number of times with optional delay
 * @param retries - Number of retry attempts (default: 3)
 * @param delayMs - Delay between retries in milliseconds (default: 1000)
 * @param exponentialBackoff - Whether to use exponential backoff (default: false)
 */
export function retry(
  retries: number = 3,
  delayMs: number = 1000,
  exponentialBackoff: boolean = false
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: any;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const result = await originalMethod.apply(this, args);
          return result;
        } catch (error) {
          lastError = error;

          if (attempt < retries) {
            const currentDelay = exponentialBackoff
              ? delayMs * Math.pow(2, attempt)
              : delayMs;

            console.log(
              `Retry attempt ${
                attempt + 1
              }/${retries} for ${propertyKey} failed. Retrying in ${currentDelay}ms...`,
              error
            );

            await new Promise((resolve) => setTimeout(resolve, currentDelay));
          }
        }
      }

      logger.error(
        `All ${retries} retry attempts failed for ${propertyKey}`,
        lastError
      );
      throw lastError;
    };

    return descriptor;
  };
}
