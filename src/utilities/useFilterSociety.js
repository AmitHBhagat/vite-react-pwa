import { useMemo } from "react";

const useFilterSocieties = ({
  societies,
  searchQuery,
  sortColumn,
  sortType,
  page,
  limit,
}) => {
  const filteredData = useMemo(() => {
    let filtered = [...societies];

    if (searchQuery) {
      filtered = filtered.filter((society) =>
        society.societyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortColumn && sortType) {
      filtered.sort((a, b) => {
        let x = a[sortColumn];
        let y = b[sortColumn];
        if (typeof x === "string") x = x.charCodeAt();
        if (typeof y === "string") y = y.charCodeAt();
        return sortType === "asc" ? x - y : y - x;
      });
    }

    return filtered;
  }, [societies, searchQuery, sortColumn, sortType]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredData.slice(start, end);
  }, [filteredData, page, limit]);

  const total = filteredData.length;

  return { paginatedData, total };
};

export default useFilterSocieties;
