import { FormEvent, useCallback, useEffect, useRef } from "react";
import useUserCheck from "../hooks/use-user-check";
import useUserInput from "../hooks/use-user-input";
import { Album } from "../types";
import styles from "./AlbumForm.module.css";

export interface AlbumFormProps {
  onCorrect: (album: Album) => void;
  onHide: (album: Pick<Album, "artist" | "name">) => void;
}


export default function AlbumForm({
  onCorrect,
  onHide,
}: AlbumFormProps): JSX.Element {
  const [artist, handleArtistChange, setArtist] = useUserInput();
  const [name, handleNameChange, setName] = useUserInput();
  const [isToHide, handleIsToHideChange] = useUserCheck();
  const [numberOfTracks, handleNumberOfTracksChange, setNumberOfTracks] =
    useUserInput();
  const [date, handleDateChange, setDate] = useUserInput();

  const artistReference = useRef<HTMLInputElement>(null);
  const isToHideReference = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (isToHide) {
        onHide({ artist, name });
      } else {
        onCorrect({
          artist,
          date,
          name,
          numberOfTracks: Number.parseInt(numberOfTracks),
        });
      }
      setArtist("");
      setName("");
      setNumberOfTracks("");
      setDate("");
      artistReference.current?.focus?.();
    },
    [
      artist,
      date,
      isToHide,
      name,
      numberOfTracks,
      onCorrect,
      onHide,
      setArtist,
      setDate,
      setName,
      setNumberOfTracks,
    ]
  );
  useEffect(() => {
    if(artist.includes('	')) {
      const [artistValue, nameValue] = artist.split('	');
      setArtist(artistValue);
      setName(nameValue);
      isToHideReference.current?.focus?.();
    } else if (!name ){
      const separatorIndex = artist.indexOf(' - ');
      if (separatorIndex !== -1) {
        setArtist(artist.substring(0, separatorIndex));
        setName(artist.substring(separatorIndex + 3));
        isToHideReference.current?.focus?.();
      }
    }
  }, [artist, name, setArtist, setName])
  const isValid = !!(artist && name && (isToHide || (numberOfTracks && date)));
  return (
    <form className={styles.root} onSubmit={handleSubmit}>
      <h3>Input album</h3>
      <label>
        Artist
        <input
          ref={artistReference}
          required
          type="text"
          value={artist}
          onChange={handleArtistChange}
        />
      </label>
      <label>
        Name
        <input required type="text" value={name} onChange={handleNameChange} />
      </label>
      <label>
        To hide?
        <input
          ref={isToHideReference}
          type="checkbox"
          checked={isToHide}
          onChange={handleIsToHideChange}
        />
      </label>
      <label>
        Number of tracks
        <input
          required={!isToHide}
          disabled={isToHide}
          type="number"
          min={0}
          value={numberOfTracks}
          onChange={handleNumberOfTracksChange}
        />
      </label>
      <label>
        Date of release
        <input
          disabled={isToHide}
          max={new Date().toISOString().substring(0, 10)}
          min="1900-01-01"
          onChange={handleDateChange}
          required={!isToHide}
          type="date"
          value={date}
        />
      </label>
      <button disabled={!isValid} type="submit">
        {isToHide ? "Add to hidden" : "Add to corrections"}
      </button>
    </form>
  );
}
