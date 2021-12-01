export default function handleError(reason: unknown): Error {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return reason instanceof Error ? reason : new Error(`${reason}`);
}
