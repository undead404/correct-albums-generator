import { createReadStream } from 'fs';
import { appendFile, readdir } from 'fs/promises';
import path from 'path';

import type { SqlStatement } from '@nearform/sql';
import * as array from 'fp-ts/Array';
import { flow, pipe } from 'fp-ts/lib/function';
import * as option from 'fp-ts/Option';
import * as taskEither from 'fp-ts/TaskEither';

import handleError from '../common/handle-error';
import sequentialAsyncFind from '../common/sequential-async-find';

const CORRECTIONS_DIR = path.join(process.cwd(), 'corrections');
const START_INDEX = 0;
const LINE_FEED = '\n'.codePointAt(START_INDEX);
const NUMBER_OF_LINES_LIMIT = 500;
const COUNT_STEP = 1;
const NUMBER_OF_DIGITS_IN_NUMBER = 3;
const INITIAL_NUMBER_OF_LINES = 1;

function readDirectory(
  directoryPath: string,
): taskEither.TaskEither<Error, string[]> {
  return taskEither.tryCatch(() => readdir(directoryPath), handleError);
}

const countNumberOfLines = flow(
  (filename: string) => path.join(CORRECTIONS_DIR, filename),
  createReadStream,
  (readStream) =>
    taskEither.tryCatch(
      () =>
        new Promise<number>((resolve, reject) => {
          let count = INITIAL_NUMBER_OF_LINES;
          readStream
            .on('data', (chunk) => {
              for (
                let index = START_INDEX;
                index < chunk.length;
                index += COUNT_STEP
              )
                if (chunk[index] === LINE_FEED) count += COUNT_STEP;
            })
            .on('end', () => {
              resolve(count);
              readStream.close();
            })
            .on('error', (reason) => {
              reject(reason);
              readStream.close();
            })
            .on('close', () => {
              readStream.close();
            });
        }),
      handleError,
    ),
);

const findRecentUnfinalizedSqlFile = (
  filepaths: string[],
): taskEither.TaskEither<Error, option.Option<string>> =>
  sequentialAsyncFind(
    filepaths,
    flow(
      countNumberOfLines,
      taskEither.map((numberOfLines) => numberOfLines < NUMBER_OF_LINES_LIMIT),
    ),
  );

const findCurrentSqlFile = flow(
  () => readDirectory(CORRECTIONS_DIR),
  taskEither.map(array.filter((filename) => filename.endsWith('.sql'))),
  // eslint-disable-next-line unicorn/no-array-callback-reference
  taskEither.map(array.reverse),
  taskEither.chain((filepaths) =>
    pipe(
      findRecentUnfinalizedSqlFile(filepaths),
      taskEither.map(
        option.fold(
          () =>
            pipe(
              filepaths,
              array.head,
              option.map((lastSqlFile) => {
                const indexOfDot = lastSqlFile.indexOf('.');
                return `${`${
                  Number.parseInt(
                    lastSqlFile.slice(
                      START_INDEX,
                      Math.max(START_INDEX, indexOfDot),
                    ),
                    10,
                  ) + COUNT_STEP
                }`.padStart(NUMBER_OF_DIGITS_IN_NUMBER, '0')}.sql`;
              }),
            ),
          option.of,
        ),
      ),
    ),
  ),
  taskEither.map(
    option.fold(
      () => '001.sql',
      (value) => value,
    ),
  ),
  taskEither.map((filename) => path.join(CORRECTIONS_DIR, filename)),
);

export default function logSql(
  sqlStatement: SqlStatement,
): taskEither.TaskEither<Error, void> {
  return pipe(
    findCurrentSqlFile(),
    taskEither.chain((currentSqlFile) =>
      taskEither.tryCatch(
        () => appendFile(currentSqlFile, `\n${sqlStatement.debug}`),
        handleError,
      ),
    ),
  );
}
