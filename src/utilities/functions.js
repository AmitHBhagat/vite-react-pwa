export function debounceFn(fn, ms) {
  let timer;
  return (_) => {
    clearTimeout(timer);
    timer = setTimeout((_) => {
      timer = null;
      fn.apply(this, arguments);
    }, ms);
  };
}

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

export function numberToWords(num) {
  if (num === 0) return "zero only";

  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const teens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  function convertHundred(n) {
    let str = "";
    if (n > 99) {
      str += ones[Math.floor(n / 100)] + " hundred ";
      n %= 100;
    }
    if (n > 0) {
      if (n < 10) {
        str += ones[n] + " ";
      } else if (n < 20) {
        str += teens[n - 10] + " ";
      } else {
        str += tens[Math.floor(n / 10)] + " ";
        if (n % 10) {
          str += ones[n % 10] + " ";
        }
      }
    }
    return str;
  }

  let result = "";

  const billion = Math.floor(num / 1000000000);
  if (billion) {
    result += convertHundred(billion) + "billion ";
    num %= 1000000000;
  }

  const million = Math.floor(num / 1000000);
  if (million) {
    result += convertHundred(million) + "million ";
    num %= 1000000;
  }

  const thousand = Math.floor(num / 1000);
  if (thousand) {
    result += convertHundred(thousand) + "thousand ";
    num %= 1000;
  }

  if (num > 0) {
    result += convertHundred(num);
  }
  let fullWordString = capitalizeWords(result.trim() + " Only");
  return fullWordString;
}
