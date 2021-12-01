import * as either from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import * as task from 'fp-ts/Task';
import * as taskEither from 'fp-ts/TaskEither';
import type * as T from 'io-ts';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { QueryResult } from 'pg';

import { logInfo } from '../common/console';

function ensurePost(
  request: NextApiRequest,
): either.Either<Error, NextApiRequest> {
  if (request.method === 'POST') {
    return either.right(request);
  }
  return either.left(new Error('Unsupported HTTP method'));
}

const HTTP_SUCCESS_CODE = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_INTERNAL_SERVER_ERROR = 500;

function parseRequestPayload<T1 extends T.Props, T2>(
  codec: T.TypeC<T1>,
): (request: NextApiRequest) => either.Either<Error[] | T.Errors, T2> {
  return flow(
    ensurePost,
    either.map((requestValue) => requestValue.body as unknown),
    // eslint-disable-next-line @typescript-eslint/unbound-method,jest/unbound-method,unicorn/no-array-callback-reference
    either.map((payload) => codec.decode(payload) as T.Validation<T2>),
    either.mapLeft((error) => [error]),
    either.flattenW,
    either.chainFirst<Error[] | T.Errors, T2, any>(
      flow((x) => {
        logInfo(x)();
      }, either.of),
    ),
  );
}

function sendResult(
  response: NextApiResponse,
): (
  resultContainer: either.Either<
    Error[] | T.Errors,
    taskEither.TaskEither<Error[], QueryResult>
  >,
) => task.Task<void> {
  return either.fold(
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    (errors) => task.of(response.status(HTTP_BAD_REQUEST).json({ errors })),
    taskEither.fold(
      (errors) =>
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        task.of(
          // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
          response.status(HTTP_INTERNAL_SERVER_ERROR).json({ errors }),
        ),
      (result) =>
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        task.of(response.status(HTTP_SUCCESS_CODE).json({ result })),
    ),
  );
}

export default function handleApiRequest<T1 extends T.Props, T2>(
  codec: T.TypeC<T1>,
  process: (payload: T2) => taskEither.TaskEither<Error, QueryResult>,
) {
  return (request: NextApiRequest, response: NextApiResponse): Promise<void> =>
    pipe(
      request,
      parseRequestPayload<T1, T2>(codec),
      // eslint-disable-next-line unicorn/no-array-callback-reference
      either.map(
        flow(
          process,
          taskEither.mapLeft((error) => [error]),
        ),
      ),
      sendResult(response),
    )();
}
