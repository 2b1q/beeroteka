var config = require('../config/config'),
    apivo = config.es.index.apivo, // apivo index
    indexBa = config.es.index.ba; // ES Index name

// Count docs by style (fielddata must set to true on ES term field)
var countStyle = (style) => {
  return {
    index: indexBa,
    body:
      {
        "query": {
          "term": {
            "style.keyword": style
          }
        },
        "from": 0,
        "size": 0
      }
  }
}

// count all available styles


module.exports = {
    countStyle: countStyle
};
