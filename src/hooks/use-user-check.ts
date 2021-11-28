import { ChangeEvent, useCallback, useState } from "react";

export default function useUserCheck(
  defaultValue = false
): [boolean, (event: ChangeEvent<HTMLInputElement>) => void] {
  const [value, setValue] = useState(defaultValue);
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setValue(event.target.checked),
    []
  );
  return [value, handleChange];
}
