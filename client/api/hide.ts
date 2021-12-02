import axios from 'axios';
import * as taskEither from 'fp-ts/TaskEither';

import handleError from '../../common/handle-error';
import type { Album } from '../../types';

export default function hide(
  album: Readonly<Pick<Album, 'artist' | 'name'>>,
): taskEither.TaskEither<Error, never> {
  return taskEither.tryCatch(() => axios.post('/api/hide', album), handleError);
}
