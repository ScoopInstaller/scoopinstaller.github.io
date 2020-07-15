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

        let minPage = Math.max(2, currentPage - PAGINATION_OFFSET);
        let maxPage = Math.min(totalPages - 1, currentPage + PAGINATION_OFFSET);

        // Offset minPage and maxPage to always have the same number of pagination items
        let maxPageOffset = PAGINATION_OFFSET * 2 - (maxPage - minPage);
        let minPageOffset = maxPage - (maxPage + maxPageOffset);
        maxPage = Math.min(totalPages - 1, maxPage + maxPageOffset);
        minPage = Math.max(2, minPage + minPageOffset);

        for (let pageIdx = minPage; pageIdx <= maxPage; pageIdx++) {
          if (
            pageIdx === currentPage - PAGINATION_OFFSET + minPageOffset ||
            pageIdx === currentPage + PAGINATION_OFFSET + maxPageOffset
          ) {
            paginationItems.push(
              <Pagination.Ellipsis key={pageIdx} disabled />
            );
          } else {
            paginationItems.push(
              <Pagination.Item
                key={pageIdx}
                active={pageIdx === currentPage}
                onClick={() => this.changePage(pageIdx)}
              >
                {pageIdx}
              </Pagination.Item>
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
