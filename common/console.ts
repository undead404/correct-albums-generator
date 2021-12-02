import type * as io from 'fp-ts/IO';

export function logError<T>(message: T): io.IO<T> {
  return (): T => {
    // eslint-disable-next-line no-console
    console.error('ERROR', message);
    return message;
  };
}

export function logInfo<T>(message: T): io.IO<T> {
  return (): T => {
    // eslint-disable-next-line no-console
    console.info('INFO', message);
    return message;
  };
}
