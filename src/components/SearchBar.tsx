import React, { PureComponent } from 'react';

import { Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

const DELAY_SEARCH_AFTER_KEYPRESS = 250;

type SearchBarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
};

class SearchBar extends PureComponent<SearchBarProps> {
  searchInput: React.RefObject<HTMLInputElement>;

  delayBeforeSubmit?: NodeJS.Timeout;

  constructor(props: SearchBarProps) {
    super(props);
    this.searchInput = React.createRef<HTMLInputElement>();
  }

  componentDidMount(): void {
    this.searchInput.current?.focus();
  }

  componentWillUnmount(): void {
    this.clearDelayBeforeSubmitTimeout();
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { onQueryChange, onSubmit } = this.props;
    onQueryChange(e.target.value);

    this.clearDelayBeforeSubmitTimeout();
    this.delayBeforeSubmit = setTimeout(onSubmit, DELAY_SEARCH_AFTER_KEYPRESS);
  };

  handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    const { onSubmit } = this.props;
    e.preventDefault();

    this.clearDelayBeforeSubmitTimeout();
    onSubmit();
  };

  clearDelayBeforeSubmitTimeout(): void {
    if (this.delayBeforeSubmit) {
      clearTimeout(this.delayBeforeSubmit);
      this.delayBeforeSubmit = undefined;
    }
  }

  render(): JSX.Element {
    const { query } = this.props;

    return (
      <Form onSubmit={this.handleSubmit}>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            ref={this.searchInput}
            size="lg"
            type="text"
            placeholder="Search an app"
            value={query}
            onChange={this.handleChange}
          />
        </InputGroup>
      </Form>
    );
  }
}

export default SearchBar;
