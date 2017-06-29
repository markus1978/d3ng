const jsonata = require('jsonata');

const exampleData = [
  {
    "key":"a",
    "data": [
      {
        "code": "USA",
        "label": "Unit...",
        "years": [1900, 2000],
        "data": [1, 2]
      },
      {
        "code": "DE",
        "label": "Germ...",
        "years": [1900, 2000],
        "data": [1, 2]
      }
    ]
  },
  {
    "key": "b",
    "data": [
      {
        "code": "USA",
        "label": "Unit...",
        "years": [1900, 2000],
        "data": [1, 2]
      },
      {
        "code": "DE",
        "label": "Germ...",
        "years": [1900, 2000],
        "data": [1, 2]
      },
      {
        "code": "FR",
        "label": "Fr...",
        "years": [1800, 1900, 2000],
        "data": [0.3, 1, 2]
      }
    ]
  }
];

const expr = `$transpose($$)`;

function transpose(array) {
  return array;
}

const trans = jsonata(expr);
trans.registerFunction("transpose", transpose, "<x:a>")
const result = trans.evaluate(exampleData);
console.log(result);
