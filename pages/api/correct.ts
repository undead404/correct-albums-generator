import * as T from 'io-ts';

import { correctAlbum } from '../../server/database';
import handleApiRequest from '../../server/handle-api-request';

const CorrectRequest = T.type({
  artist: T.string,
  date: T.string,
  name: T.string,
  numberOfTracks: T.number,
});

const correct = handleApiRequest(CorrectRequest, correctAlbum);
export default correct;
