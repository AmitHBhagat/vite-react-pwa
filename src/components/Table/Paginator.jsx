import React, { useMemo, useState, useCallback } from "react";
import { Pagination } from "rsuite";
import { useSmallScreen } from "../../utilities/useWindowSize";
import { BREAK_POINTS } from "../../utilities/constants";

const Paginator = ({ data, limit, page, setPage, setLimit }) => {
  console.log("data", data);
  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);
  const handleChangeLimit = (dataKey) => {
    setPage(1);
    setLimit(dataKey);
  };
  return (
    <div className="">
      <Pagination
        prev
        next
        first
        last
        ellipsis
        boundaryLinks
        maxButtons={5}
        size={isSmallScreen ? "xs" : "md"}
        layout={[
          "total",
          "-",
          `${!isSmallScreen ? "limit" : ""}`,
          `${!isSmallScreen ? "|" : ""}`,
          "pager",
          `${!isSmallScreen ? "|" : ""}`,
          `${!isSmallScreen ? "skip" : ""}`,
        ]}
        total={data.length}
        limitOptions={[5, 10, 30, 50]}
        limit={limit}
        activePage={page}
        onChangePage={setPage}
        onChangeLimit={handleChangeLimit}
      />
    </div>
  );
};

// this hook manage state
export const useTableState = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortType, setSortType] = useState(null);
  const [loading, setLoading] = useState(false);

  // const handleSortColumn = (column, type) => {
  //   // Optionally display a loading state if needed
  //   setSort(column, type);
  // };
  // When the search query changes, we reset the page number.
  const updateSearchQuery = useCallback((query) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  // When the limit changes, reset the page number.
  const updateLimit = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  // Update both sort column and sort type together.
  const updateSort = useCallback((column, type) => {
    console.log("column", column, type);
    // const newSortType = !type || type === "desc" ? "asc" : "desc";
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSortColumn(column);
      setSortType(type || "asc");
    }, 500);
  }, []);

  return {
    searchQuery,
    setSearchQuery: updateSearchQuery,
    limit,
    setLimit: updateLimit,
    page,
    setPage,
    sortColumn,
    sortType,
    setSort: updateSort,
    loading,
    setLoading,
  };
};

// this hook manage sort, search query and pagination logic
export const useTableData = ({
  data,
  searchQuery,
  sortColumn,
  sortType,
  page,
  limit,
  filterElement,
  filterElement2,
}) =>
  useMemo(() => {
    // Filter data based on the search query.
    let filteredData = data;
    if (searchQuery) {
      filteredData = data.filter((item) => {
        const match1 =
          filterElement &&
          item[filterElement]
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());
        const match2 =
          filterElement2 &&
          item[filterElement2]
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());
        return match1 || match2;
      });
    }
    console.log("sortColumn:", sortColumn, "sortType:", sortType);
    console.log("filteredData", filteredData);
    // Handle sorting
    // If no sort column or sort type is provided, try to default-sort by "billNo" if available.
    if (!sortColumn || !sortType) {
      if (
        filteredData.length > 0 &&
        filteredData[0][filterElement] !== undefined
      ) {
        filteredData = [...filteredData].sort(
          (a, b) => a[filterElement] - b[filterElement]
        );
      }
    } else {
      filteredData = [...filteredData].sort((a, b) => {
        let x = 0,
          y = 0;
        // If the sortColumn starts with "charge_", use the billCharges array for sorting.
        if (sortColumn.startsWith("charge_")) {
          const chargeId = sortColumn.replace("charge_", "");
          x = a.billCharges?.find((c) => c._id === chargeId)?.value || 0;
          y = b.billCharges?.find((c) => c._id === chargeId)?.value || 0;
        } else {
          x = a[sortColumn];
          y = b[sortColumn];
          // For strings, we use localeCompare for a more natural sort order.
          if (typeof x === "string" && typeof y === "string") {
            return sortType === "asc" ? x.localeCompare(y) : y.localeCompare(x);
          }
        }
        return sortType === "asc" ? x - y : y - x;
      });
    }

    // Calculate the slicing indices for pagination.
    const start = limit * (page - 1);
    const end = start + limit;
    const rowData = filteredData;
    const limitData = filteredData.slice(start, end);

    return { rowData, limitData };
  }, [
    data,
    searchQuery,
    sortColumn,
    sortType,
    page,
    limit,
    filterElement,
    filterElement2,
  ]);

export default Paginator;
