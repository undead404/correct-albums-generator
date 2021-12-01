import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';

export default function useUserInput<
  T extends HTMLInputElement | HTMLTextAreaElement,
>(
  defaultValue = '',
): [
  string,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  (event: ChangeEvent<T>) => void,
  (value: string | ((oldValue: string) => string)) => void,
] {
  const [value, setValue] = useState(defaultValue);
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  const handleChange = useCallback((event: ChangeEvent<T>) => {
    setValue(event.target.value);
  }, []);
  return [value, handleChange, setValue];
}
