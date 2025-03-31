export function copyObjectByKeys(destObj, srcObj) {
  Object.keys(destObj).forEach((key) => {
    if (srcObj.hasOwnProperty(key) && destObj.hasOwnProperty(key))
      destObj[key] = srcObj[key];
  });
}

export function capitalizeFirstLetter(input) {
  const str = String(input);
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeWords(str) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
