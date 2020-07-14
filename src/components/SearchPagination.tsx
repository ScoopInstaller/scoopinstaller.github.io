import React, { PureComponent } from 'react';
import { Pagination } from 'react-bootstrap';

const PAGINATION_OFFSET: number = 2;

class SearchPagination extends PureComponent<ISearchPaginationProps> {
  changePage = (page: number) => {
    const total_pages = Math.ceil(
      this.props.resultsCount! / this.props.resultsPerPage
    );
    page = Math.max(1, Math.min(page, total_pages));
    this.props.onPageChange(page);
  };

  render() {
    const { currentPage, resultsCount, resultsPerPage } = this.props;
    if (resultsCount) {
      const totalPages = Math.ceil(resultsCount / resultsPerPage);
      if (totalPages > 1) {
        let paginationItems = [];

        for (
          let pageIdx = Math.max(2, currentPage - PAGINATION_OFFSET);
          pageIdx <= Math.min(totalPages - 1, currentPage + PAGINATION_OFFSET);
          pageIdx++
        ) {
          if (pageIdx === currentPage - PAGINATION_OFFSET) {
            paginationItems.push(
              <Pagination.Ellipsis key="ellipsis-before" disabled />
            );
          }
          paginationItems.push(
            <Pagination.Item
              key={pageIdx}
              active={pageIdx === currentPage}
              onClick={() => this.changePage(pageIdx)}
            >
              {pageIdx}
            </Pagination.Item>
          );
          if (pageIdx === currentPage + PAGINATION_OFFSET) {
            paginationItems.push(
              <Pagination.Ellipsis key="ellipsis-after" disabled />
            );
          }
        }

        return (
          <Pagination size="sm">
            <Pagination.Prev
              key="prev"
              onClick={() => this.changePage(currentPage - 1)}
            />
            <Pagination.Item
              key={1}
              active={1 === currentPage}
              onClick={() => this.changePage(1)}
            >
              {1}
            </Pagination.Item>
            {paginationItems}
            <Pagination.Item
              key={totalPages}
              active={totalPages === currentPage}
              onClick={() => this.changePage(totalPages)}
            >
              {totalPages}
            </Pagination.Item>
            <Pagination.Next
              key="next"
              onClick={() => this.changePage(currentPage + 1)}
            />
          </Pagination>
        );
      }
    }

    return null;
  }
}

interface ISearchPaginationProps {
  currentPage: number;
  resultsCount?: number;
  resultsPerPage: number;
  onPageChange: (newPage: number) => void;
}

export default SearchPagination;
