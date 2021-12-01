import type { SqlStatement } from '@nearform/sql';
import SQL from '@nearform/sql';
import { flow } from 'fp-ts/lib/function';
import * as taskEither from 'fp-ts/TaskEither';
import type { QueryResult } from 'pg';
import { Client } from 'pg';

import handleError from '../common/handle-error';
import type { Album } from '../types';

import logSql from './log-sql';

function preFormat(text: string): string {
  return text.replaceAll("'", "''");
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
  return taskEither.tryCatch(() => database.query(query), handleError);
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
