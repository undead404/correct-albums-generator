import { ChangeEvent, useCallback, useState } from "react";

export default function useUserInput<
  T extends HTMLInputElement | HTMLTextAreaElement
>(
  defaultValue = ""
): [
  string,
  (event: ChangeEvent<T>) => void,
  (newValue: string | ((oldValue: string) => string)) => void
] {
  const [value, setValue] = useState(defaultValue);
  const handleChange = useCallback(
    (event: ChangeEvent<T>) => setValue(event.target.value),
    []
  );
  return [value, handleChange, setValue];
}
