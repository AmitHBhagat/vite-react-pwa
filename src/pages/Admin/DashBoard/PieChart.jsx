import React from "react";
import Chart from "react-apexcharts";

const PieChart = ({ labels, series, type }) => {
  const chartOptions = {
    dataLabels: {
      enabled: true,
      formatter: (val, { seriesIndex }) => series[seriesIndex],
      style: {
        fontSize: "14px",

        colors: ["#fff"],
      },
    },
    plotOptions: {
      pie: {
        customScale: 0.8,
        offsetY: 0,
        dataLabels: {
          offset: -5,
        },
      },
    },
    colors: [
      "#7898E3",
      "#54B399",
      "#F78A6C",
      "#FF5959",
      "#47D9E6",
      "#2E9FED",
      "#A4C7F0",
      "#FFB48F",
      "#FFE087",
      "#FF99B1",
      "#90DFAA",
      "#FF867D",
      "#BD97DB",
      "#FFCD73",
      "#FFAC6B",
      "#729EF0",
      "#6FCFC4",
      "#F48A9C",
      "#FFE7B5",
      "#AC9EDB",
    ],
    tooltip: {
      y: {
        formatter: (val) => `Value: ${val}`,
      },
    },
    legend: {
      show: true,
      position: "right",
      floating: false,
    },
    labels,
  };

  return (
    <div>
      <Chart options={chartOptions} series={series} type={type} height={295} />
    </div>
  );
};

export default PieChart;
