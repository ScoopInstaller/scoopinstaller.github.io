import React from 'react';

import { Pagination } from 'react-bootstrap';

const PAGINATION_OFFSET = 2;

type SearchPaginationProps = {
  currentPage: number;
  resultsCount: number;
  resultsPerPage: number;
  onPageChange: (newPage: number) => void;
};

const SearchPagination = (props: SearchPaginationProps): JSX.Element => {
  const { currentPage, resultsCount, resultsPerPage, onPageChange } = props;

  const changePage = (page: number): void => {
    const totalPages = Math.ceil(resultsCount / resultsPerPage);
    const newPage = Math.max(1, Math.min(page, totalPages));
    onPageChange(newPage);
  };

  if (resultsCount > 0) {
    const totalPages = Math.ceil(resultsCount / resultsPerPage);
    if (currentPage > totalPages) {
      onPageChange(totalPages);
    }

    if (totalPages > 1) {
      const paginationItems = [];

      let minPage = Math.max(2, currentPage - PAGINATION_OFFSET);
      let maxPage = Math.min(totalPages - 1, currentPage + PAGINATION_OFFSET);

      // Offset minPage and maxPage to always have
      // the same number of pagination items
      const maxPageOffset = PAGINATION_OFFSET * 2 - (maxPage - minPage);
      const minPageOffset = maxPage - (maxPage + maxPageOffset);
      maxPage = Math.min(totalPages - 1, maxPage + maxPageOffset);
      minPage = Math.max(2, minPage + minPageOffset);

      for (let pageIdx = minPage; pageIdx <= maxPage; pageIdx += 1) {
        if (
          pageIdx === currentPage - PAGINATION_OFFSET + minPageOffset ||
          pageIdx === currentPage + PAGINATION_OFFSET + maxPageOffset
        ) {
          paginationItems.push(<Pagination.Ellipsis key={pageIdx} disabled />);
        } else {
          paginationItems.push(
            <Pagination.Item key={pageIdx} active={pageIdx === currentPage} onClick={() => changePage(pageIdx)}>
              {pageIdx}
            </Pagination.Item>
          );
        }
      }

      return (
        <Pagination size="sm">
          <Pagination.Prev key="prev" onClick={() => changePage(currentPage - 1)} />
          <Pagination.Item key={1} active={currentPage === 1} onClick={() => changePage(1)}>
            {1}
          </Pagination.Item>
          {paginationItems}
          <Pagination.Item key={totalPages} active={totalPages === currentPage} onClick={() => changePage(totalPages)}>
            {totalPages}
          </Pagination.Item>
          <Pagination.Next key="next" onClick={() => changePage(currentPage + 1)} />
        </Pagination>
      );
    }
  }

  return <></>;
};

export default React.memo(SearchPagination);
