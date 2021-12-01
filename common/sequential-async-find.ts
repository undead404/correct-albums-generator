import * as array from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import * as option from 'fp-ts/Option';
import * as taskEither from 'fp-ts/TaskEither';

export default function sequentialAsyncFind<T>(
  collection: T[],
  predicate: (item: T) => taskEither.TaskEither<Error, boolean>,
): taskEither.TaskEither<Error, option.Option<T>> {
  return pipe(
    collection,
    array.head,
    option.map((head) =>
      pipe(
        predicate(head),
        taskEither.chain<
          Error,
          boolean,
          taskEither.TaskEither<Error, option.Option<T>>
        >((result) =>
          result
            ? taskEither.of(taskEither.of(option.of(head)))
            : pipe(
                collection,
                array.tail,
                option.fold(
                  () => taskEither.right(option.none),
                  (tail) => sequentialAsyncFind<T>(tail, predicate),
                ),
                taskEither.of,
              ),
        ),
        taskEither.flatten,
      ),
    ),
    option.fold(
      () => taskEither.of(option.none),
      (x) => x,
    ),
  );
}
