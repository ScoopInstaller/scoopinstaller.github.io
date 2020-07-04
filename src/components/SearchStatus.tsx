import React, { PureComponent } from 'react';
import { Spinner } from 'react-bootstrap';
import { ISearchStatusProps } from '../interfaces/ISearchStatus.interfaces';

class SearchStatus extends PureComponent<ISearchStatusProps> {
  render() {
    if (this.props.searching) {
      return (
        <span>
          <span>Searching for matching applications...</span>{' '}
          <Spinner animation="border" size="sm" variant="secondary" />
        </span>
      );
    } else if (this.props.resultsCount) {
      return (
        <span>
          Found {this.props.resultsCount} applications
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
          No result found for '<strong>{this.props.query}</strong>'
        </span>
      );
    }
  }
}

export default SearchStatus;
