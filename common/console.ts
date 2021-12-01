import type * as io from 'fp-ts/IO';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function logError(message: any): io.IO<void> {
  return (): void => {
    // eslint-disable-next-line no-console
    console.error('ERROR', message);
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function logInfo(message: any): io.IO<void> {
  return (): void => {
    // eslint-disable-next-line no-console
    console.info('INFO', message);
  };
}
