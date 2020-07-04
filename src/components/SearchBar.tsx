import React, { PureComponent } from 'react';
import {
  ISearchBarProps,
  ISearchBarState,
} from '../interfaces/ISearchBar.interfaces';
import { Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

const DELAY_SEARCH_AFTER_KEYPRESS: number = 250;

class SearchBar extends PureComponent<ISearchBarProps, ISearchBarState> {
  static defaultProps = {
    query: '',
  };

  searchInput: React.RefObject<HTMLInputElement>;
  delayBeforeSearch?: NodeJS.Timeout;

  constructor(props: ISearchBarProps) {
    super(props);
    this.searchInput = React.createRef<HTMLInputElement>();

    this.state = {
      query: this.props.query,
    };
  }

  componentDidMount() {
    this.searchInput.current!.focus();
  }

  componentWillUnmount() {
    this.clearDelayBeforeSearchTimeout();
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ query: e.target.value });

    this.clearDelayBeforeSearchTimeout();

    this.delayBeforeSearch = setTimeout(
      (query) => this.props.onQueryChange(query),
      DELAY_SEARCH_AFTER_KEYPRESS,
      e.target.value
    );
  };

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.props.onQueryChange(this.state.query);
  };

  clearDelayBeforeSearchTimeout() {
    if (this.delayBeforeSearch) {
      clearTimeout(this.delayBeforeSearch);
      this.delayBeforeSearch = undefined;
    }
  }

  render() {
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
            value={this.state.query}
            onChange={this.handleChange}
          />
        </InputGroup>
      </Form>
    );
  }
}

export default SearchBar;
