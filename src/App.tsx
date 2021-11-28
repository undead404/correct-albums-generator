import SQL from "@nearform/sql";
import { useCallback } from "react";
import "./App.css";
import AlbumForm from "./components/AlbumForm";
import useUserInput from "./hooks/use-user-input";
import { Album } from "./types";

function preFormat(text: string): string {
  return text.replaceAll("'", "''");
}

function App() {
  const [sql, handleSqlChange, setSqlValue] = useUserInput("");
  const handleCorrect = useCallback(
    (album: Album) => {
      const sqlStatement = SQL`UPDATE "public"."Album" SET "numberOfTracks" = ${
        album.numberOfTracks
      }, "date" = ${album.date} WHERE artist = ${preFormat(
        album.artist
      )} AND "name" = ${preFormat(album.name)};`;
      setSqlValue((oldSqlValue) => `${oldSqlValue}\n${sqlStatement.debug}`);
    },
    [setSqlValue]
  );
  const handleHide = useCallback(
    (album: Album) => {
      const sqlStatement = SQL`UPDATE "public"."Album" SET "hidden" = true WHERE artist = ${preFormat(
        album.artist
      )} AND "name" = ${preFormat(album.name)};`;
      setSqlValue((oldSqlValue) => `${oldSqlValue}\n${sqlStatement.debug}`);
    },
    [setSqlValue]
  );
  return (
    <div className="App">
      <header className="App-header">Correct albums</header>
      <AlbumForm onCorrect={handleCorrect} onHide={handleHide} />
      <p>Number of lines: {sql.split("\n").length}</p>
      <textarea value={sql} onChange={handleSqlChange} />
    </div>
  );
}

export default App;
