// import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import SocietyService from "../services/society.service";
// import { toast } from "react-toastify";
// import { trackPromise } from "react-promise-tracker";
// import { setRouteData } from "../../src/stores/appSlice";
// // import {
// //   page,
// //   limit,
// //   sortColumn,
// //   sortType,
// //   searchQuery,
// // } from "../../src/utilities/constants";

// const useFetchSocietyList = (pageTitle) => {
//   // console.log("useFetchSocietyList");
//   const dispatch = useDispatch();
//   // const [societies, setSocieties] = useState([]);
//   const societyData = [];
//   // console.log("societies", societies);
//   // const [searchQuery, setSearchQuery] = useState("");
//   // const [limit, setLimit] = useState(6);
//   // const [page, setPage] = useState(1);
//   // const [sortColumn, setSortColumn] = useState();
//   // const [sortType, setSortType] = useState();
//   useEffect(() => {
//     dispatch(setRouteData({ pageTitle }));
//     console.log("useEffect");
//     getSocieties();
//   }, [dispatch, pageTitle]);

//   const getSocieties = async () => {
//     try {
//       const resp = await trackPromise(SocietyService.getSocietyList());
//       console.log("resp", resp);
//       societyData = resp.data.societies;
//       // setSocieties(resp.data.societies);
//       // setSocieties(getData());
//     } catch (error) {
//       toast.error(error.response.data.message);
//       console.error("Failed to fetch societies", error);
//     }
//   };

//   // const getData = () => {
//   //   let filteredSocieties = societies.filter((society) =>
//   //     society.societyName.toLowerCase().includes(searchQuery.toLowerCase())
//   //   );

//   //   if (sortColumn && sortType) {
//   //     filteredSocieties.sort((a, b) => {
//   //       let x = a[sortColumn];
//   //       let y = b[sortColumn];
//   //       if (typeof x === "string") {
//   //         x = x.charCodeAt();
//   //       }
//   //       if (typeof y === "string") {
//   //         y = y.charCodeAt();
//   //       }
//   //       return sortType === "asc" ? x - y : y - x;
//   //     });
//   //   }

//   //   const start = limit * (page - 1);
//   //   const end = start + limit;
//   //   return filteredSocieties.slice(start, end);
//   // };
//   return {
//     normalSociety: societyData,
//     // filteredSociety: getData(),
//     // filterUtilities: [
//     //   searchQuery,
//     //   setSearchQuery,
//     //   limit,
//     //   setLimit,
//     //   page,
//     //   setPage,
//     //   sortColumn,
//     //   setSortColumn,
//     //   sortType,
//     //   setSortType,
//     // ],
//   };
// };

// export default useFetchSocietyList;
import { useState, useEffect } from "react";
import SocietyService from "../services/society.service";
import { trackPromise } from "react-promise-tracker";

const useFetchSocieties = () => {
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSocieties = async () => {
    try {
      setLoading(true);
      const response = await trackPromise(SocietyService.getSocietyList());
      setSocieties(response.data.societies);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch societies");
      console.error("Failed to fetch societies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocieties();
  }, []);

  return { societies, loading, error, refresh: fetchSocieties };
};

export default useFetchSocieties;
