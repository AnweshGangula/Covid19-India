var Global_Var = {
  margin: { top: 10, right: 20, bottom: 30, left: 60 },
  width: 1600,
  height: 300,
};

function formatDate(date) {
  return date.toLocaleString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatValue(value) {
  return value.toLocaleString("en", {
    // style: "currency",
    currency: "USD",
  });
}

export default Global_Var;
export { formatDate, formatValue };
