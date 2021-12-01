import axios from 'axios';
import type { FormEventHandler } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import type { Album } from '../../types';
import useUserCheck from '../hooks/use-user-check';
import useUserInput from '../hooks/use-user-input';

import styles from './AlbumForm.module.css';

export type AlbumFormProperties = Readonly<{
  onCorrect: (album: Readonly<Album>) => void;
  onHide: (album: Readonly<Pick<Album, 'artist' | 'name'>>) => void;
}>;

const NOT_FOUND_INDEX = -1;
const START_INDEX = 0;
const MAX_DATE_LENGTH = 10;

const AlbumForm = function AlbumForm(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [artist, handleArtistChange, setArtist] = useUserInput();
  const [name, handleNameChange, setName] = useUserInput();
  const [isToHide, handleIsToHideChange] = useUserCheck();
  const [numberOfTracks, handleNumberOfTracksChange, setNumberOfTracks] =
    useUserInput();
  const [date, handleDateChange, setDate] = useUserInput();

  const artistReference = useRef<HTMLInputElement>(null);
  const isToHideReference = useRef<HTMLInputElement>(null);

  const handleSubmit: FormEventHandler = useCallback(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    (event) => {
      setIsLoading(true);
      event.preventDefault();
      if (isToHide) {
        axios
          .post('/api/hide', { artist, name })
          // eslint-disable-next-line promise/always-return
          .then(() => {
            toast(`${artist} – ${name}: hidden!`, { type: 'success' });
            setIsLoading(false);
          })
          .catch((error) => {
            toast(
              error instanceof Error
                ? error.message
                : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                  `${error || 'Unknown error'}`,
              {
                type: 'error',
              },
            );

            setIsLoading(false);
          });
      } else {
        axios
          .post('/api/correct', {
            artist,
            date,
            name,
            numberOfTracks: Number.parseInt(numberOfTracks, 10),
          })
          // eslint-disable-next-line promise/always-return
          .then(() => {
            toast(`${artist} – ${name}: corrected!`, { type: 'success' });
            setIsLoading(false);
          })
          .catch((error) => {
            toast(
              error instanceof Error
                ? error.message
                : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                  `${error || 'Unknown error'}`,
              {
                type: 'error',
              },
            );
            setIsLoading(false);
          });
      }
      setArtist('');
      setName('');
      setNumberOfTracks('');
      setDate('');
      artistReference.current?.focus();
    },
    [
      artist,
      date,
      isToHide,
      name,
      numberOfTracks,
      setArtist,
      setDate,
      setName,
      setNumberOfTracks,
    ],
  );
  useEffect(() => {
    if (artist.includes('	')) {
      const [artistValue, nameValue] = artist.split('	');
      setArtist(artistValue);
      setName(nameValue);
      isToHideReference.current?.focus();
    } else if (!name) {
      const separatorIndex = artist.indexOf(' - ');
      if (separatorIndex !== NOT_FOUND_INDEX) {
        setArtist(
          artist.slice(START_INDEX, Math.max(START_INDEX, separatorIndex)),
        );
        setName(
          artist.slice(Math.max(START_INDEX, separatorIndex + ' - '.length)),
        );
        isToHideReference.current?.focus();
      }
    }
  }, [artist, name, setArtist, setName]);
  const isValid = !!(artist && name && (isToHide || (numberOfTracks && date)));
  return (
    <form className={styles.root} onSubmit={handleSubmit}>
      <h3>Input album</h3>
      <label htmlFor="artist-input">
        Artist
        <input
          disabled={isLoading}
          id="artist-input"
          ref={artistReference}
          required
          type="text"
          value={artist}
          onChange={handleArtistChange}
        />
      </label>
      <label htmlFor="name-input">
        Name
        <input
          disabled={isLoading}
          required
          type="text"
          id="name-input"
          value={name}
          onChange={handleNameChange}
        />
      </label>
      <label htmlFor="hide-checkbox">
        To hide?
        <input
          disabled={isLoading}
          id="hide-checkbox"
          ref={isToHideReference}
          type="checkbox"
          checked={isToHide}
          onChange={handleIsToHideChange}
        />
      </label>
      <label htmlFor="number-of-tracks-input">
        Number of tracks
        <input
          id="number-of-tracks-input"
          required={!isToHide}
          disabled={isLoading || isToHide}
          type="number"
          min={0}
          value={numberOfTracks}
          onChange={handleNumberOfTracksChange}
        />
      </label>
      <label htmlFor="date-input">
        Date of release
        <input
          id="date-input"
          disabled={isLoading || isToHide}
          pattern="\d{4}(?:-\d{2}){0,2}"
          onChange={handleDateChange}
          required={!isToHide}
          type="text"
          value={date}
        />
      </label>
      <button disabled={isLoading || !isValid} type="submit">
        {isToHide ? 'Add to hidden' : 'Add to corrections'}
      </button>
    </form>
  );
};

export default AlbumForm;
