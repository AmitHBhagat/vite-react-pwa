import React from "react";
import Chart from "react-apexcharts";

const PieChart = () => {
  const chartOptions = {
    chart: { type: "donut" },
    labels: ["Category A", "Category B", "Category C", "Category D"],
    colors: ["#4caf50", "#f44336", "#ff9800", "#2196f3"],
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: { width: "100%" },
        },
        legend: {
          position: "bottom",
        },
      },
    ],
  };

  const chartSeries = [35, 25, 20, 20];

  return (
    <Chart
      options={chartOptions}
      series={chartSeries}
      type="donut"
      height={295}
    />
  );
};

export default PieChart;
