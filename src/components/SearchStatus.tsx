import React, { PureComponent } from 'react';
import { Spinner } from 'react-bootstrap';

class SearchStatus extends PureComponent<ISearchStatusProps> {
  render() {
    if (this.props.searching) {
      return (
        <span>
          <span>Searching for matching {this.props.type}...</span>{' '}
          <Spinner animation="border" size="sm" variant="secondary" />
        </span>
      );
    } else if (this.props.resultsCount) {
      return (
        <span>
          Found {this.props.resultsCount} {this.props.type}
          {this.props.query && (
            <span>
              {' '}
              for '<strong>{this.props.query}</strong>'
            </span>
          )}
          .
        </span>
      );
    } else {
      return (
        <span>
          No result found
          {this.props.query && (
            <span>
              {' '}
              for '<strong>{this.props.query}</strong>'
            </span>
          )}
          .
        </span>
      );
    }
  }
}

interface ISearchStatusProps {
  query?: string;
  resultsCount: number;
  searching: boolean;
  type: string;
}

export default SearchStatus;
