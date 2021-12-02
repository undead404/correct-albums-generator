import axios from 'axios';
import * as taskEither from 'fp-ts/TaskEither';

import handleError from '../../common/handle-error';
import type { Album } from '../../types';

export default function correct(
  album: Readonly<Album>,
): taskEither.TaskEither<Error, never> {
  return taskEither.tryCatch(
    () => axios.post('/api/correct', album),
    handleError,
  );
}
