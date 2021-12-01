import * as T from 'io-ts';

import { hideAlbum } from '../../server/database';
import handleApiRequest from '../../server/handle-api-request';

const HideRequest = T.type({
  artist: T.string,
  name: T.string,
});

const hide = handleApiRequest(HideRequest, hideAlbum);

export default hide;
