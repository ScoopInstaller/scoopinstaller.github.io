import React, { useRef, useEffect, useCallback } from 'react';

import { Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

const DELAY_SEARCH_AFTER_KEYPRESS = 250;

type SearchBarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
};

const SearchBar = (props: SearchBarProps): JSX.Element => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const delayBeforeSubmit = useRef<NodeJS.Timeout>();
  const { query, onQueryChange, onSubmit } = props;

  const clearDelayBeforeSubmitTimeout = (): void => {
    if (delayBeforeSubmit.current) {
      clearTimeout(delayBeforeSubmit.current);
      delayBeforeSubmit.current = undefined;
    }
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      onQueryChange(e.target.value);

      clearDelayBeforeSubmitTimeout();
      delayBeforeSubmit.current = setTimeout(
        () => formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })),
        DELAY_SEARCH_AFTER_KEYPRESS
      );
    },
    [onQueryChange]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();

      clearDelayBeforeSubmitTimeout();
      onSubmit();
    },
    [onSubmit]
  );

  useEffect(() => {
    searchInputRef.current?.focus();

    return () => clearDelayBeforeSubmitTimeout();
  }, []);

  return (
    <Form onSubmit={handleSubmit} ref={formRef}>
      <InputGroup>
        <InputGroup.Text>
          <FaSearch />
        </InputGroup.Text>
        <Form.Control
          ref={searchInputRef}
          size="lg"
          type="text"
          placeholder="Search an app"
          spellCheck={false}
          value={query}
          onChange={handleChange}
        />
      </InputGroup>
    </Form>
  );
};

export default React.memo(SearchBar);
