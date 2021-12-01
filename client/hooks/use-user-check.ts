import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';

export default function useUserCheck(
  defaultValue = false,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
): [boolean, (event: ChangeEvent<HTMLInputElement>) => void] {
  const [value, setValue] = useState(defaultValue);
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.checked);
  }, []);
  return [value, handleChange];
}
