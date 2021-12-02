import type { SqlStatement } from '@nearform/sql';
import SQL from '@nearform/sql';
import { flow, pipe } from 'fp-ts/lib/function';
import * as taskEither from 'fp-ts/TaskEither';
import type { QueryResult } from 'pg';
import { Client } from 'pg';

import { logInfo } from '../common/console';
import handleError from '../common/handle-error';
import type { Album } from '../types';

import logSql from './log-sql';

const REQUIRED_NUMBER_OF_AFFECTED_ROWS = 1;

function preFormat(text: string): string {
  // return text.replaceAll("'", "''");
  return text;
}

const database = new Client({
  database: process.env.POSTGRES_DATABASE,
  host: 'localhost',
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
  user: process.env.POSTGRES_USER,
});

// eslint-disable-next-line jest/require-hook
database.connect();

// eslint-disable-next-line jest/require-hook
process.on('exit', () => {
  database.end();
});

function queryDatabase(
  query: SqlStatement,
): taskEither.TaskEither<Error, QueryResult> {
  // console.info(query.debug);
  return pipe(
    taskEither.tryCatch(() => database.query(query), handleError),
    taskEither.chain((result) => {
      logInfo(result)();
      return taskEither.of(result);
    }),
    taskEither.chain((result) =>
      result.rowCount < REQUIRED_NUMBER_OF_AFFECTED_ROWS
        ? taskEither.left(new Error('No rows affected'))
        : taskEither.right(result),
    ),
  );
}

export const hideAlbum = flow(
  (album: Readonly<Pick<Album, 'artist' | 'name'>>) => SQL`
UPDATE "public"."Album" SET "hidden" = true WHERE artist = ${preFormat(
    album.artist,
  )} AND "name" = ${preFormat(album.name)};
`,
  taskEither.of,
  taskEither.chainFirst(logSql),
  taskEither.chain(queryDatabase),
);

export const correctAlbum = flow(
  (album: Readonly<Album>) =>
    SQL`UPDATE "public"."Album" SET "numberOfTracks" = ${
      album.numberOfTracks
    }, "date" = ${album.date} WHERE artist = ${preFormat(
      album.artist,
    )} AND "name" = ${preFormat(album.name)};`,
  taskEither.of,
  taskEither.chainFirst(logSql),
  taskEither.chain(queryDatabase),
);
