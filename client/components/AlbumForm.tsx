import { pipe } from 'fp-ts/lib/function';
import * as task from 'fp-ts/Task';
import * as taskEither from 'fp-ts/TaskEither';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import type { Album } from '../../types';
import correct from '../api/correct';
import hide from '../api/hide';
import useUserCheck from '../hooks/use-user-check';
import useUserInput from '../hooks/use-user-input';

import styles from './AlbumForm.module.css';

export type AlbumFormProperties = Readonly<{
  onCorrect: (album: Readonly<Album>) => void;
  onHide: (album: Readonly<Pick<Album, 'artist' | 'name'>>) => void;
}>;

const NOT_FOUND_INDEX = -1;
const START_INDEX = 0;

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

  const handleHide = useCallback(
    (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      setIsLoading(true);
      void pipe(
        { artist, name },
        hide,
        // eslint-disable-next-line array-callback-return
        taskEither.fold(
          (error) => {
            toast(error.message, {
              type: 'error',
            });
            return task.of(null);
          },
          () => {
            toast(`${artist} – ${name}: hidden!`, { type: 'success' });
            setArtist('');
            setName('');
            setNumberOfTracks('');
            setDate('');
            artistReference.current?.focus();
            return task.of(null);
          },
        ),
        // eslint-disable-next-line array-callback-return
        task.map(() => {
          setIsLoading(false);
        }),
      )();
    },
    [artist, name],
  );

  const handleCorrect = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsLoading(true);
      void pipe(
        {
          artist,
          date,
          name,
          numberOfTracks: Number.parseInt(numberOfTracks, 10),
        },
        correct,
        // eslint-disable-next-line array-callback-return
        taskEither.fold(
          (error) => {
            toast(error.message, {
              type: 'error',
            });
            return task.of(null);
          },
          () => {
            toast(`${artist} – ${name}: corrected!`, { type: 'success' });
            setArtist('');
            setName('');
            setNumberOfTracks('');
            setDate('');
            artistReference.current?.focus();
            setIsLoading(false);
            return task.of(null);
          },
        ),
        // eslint-disable-next-line array-callback-return
        task.map(() => {
          setIsLoading(false);
        }),
      )();
    },
    [artist, date, name, numberOfTracks],
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
    <form
      className={styles.root}
      onSubmit={isToHide ? handleHide : handleCorrect}
    >
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
