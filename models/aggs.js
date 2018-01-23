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

// Beer AP aggs: ABV by Countries by Styles
var apAgg1 = () => {
  return {
    index: apivo,
    body:
    {
      "from": 0,
      "size": 0,
      "aggs": {
        "Countries": {
          "terms": {
            "field": "Страна"
          },
          "aggs": {
            "Beer styles": {
              "terms": {
                "field": "Вид пива"
              },
              "aggs": {
                "ABV": {
                  "stats": {
                    "field": "abv"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// BA Agg: ABV by Styles by Categories
var baAgg1 = () => {
  return {
    index: indexBa,
    body:
    {
      "from": 0,
      "size": 0,
      "aggs": {
        "Categories": {
          "terms": {
            "field": "category"
          },
          "aggs": {
            "Beer styles": {
              "terms": {
                "field": "style"
              },
              "aggs": {
                "ABV": {
                  "max": {
                    "field": "abv"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// Beer Styles by countries styles from Apivo index
var allStylesAp = () => {
  return {
    index: apivo,
    body:
      {
      "from": 0,
      "size": 0,
      "aggs": {
        "Beer styles": {
          "terms": {
            "field": "Вид пива"
          },
          "aggs": {
            "max abv": {
              "max": {
                "field": "abv"
              }
            }
          }
        }
      }
    }
  }
}

// count all available styles from BA index
var allStylesBa = () => {
  return {
    index: indexBa,
    body:
      {
        "size": 0,
        "from": 0,
        "aggs": {
          "Beer styles": {
            "filters": {
              "filters": {
                "Ales": {
                  "wildcard": {
                    "category.keyword": "*Ales"
                  }
                },
                "Lagers": {
                  "wildcard": {
                    "category.keyword": "*Lagers"
                  }
                },
                "Hybrid": {
                  "wildcard": {
                    "category.keyword": "*Hybrid"
                  }
                },
                "American APA": {
                  "term": {
                    "style.keyword": "American APA"
                  }
                },
                "American IPA": {
                  "term": {
                    "style.keyword": "American IPA"
                  }
                },
                "Kölsch": {
                  "term": {
                    "style.keyword": "Kölsch"
                  }
                },
                "American Amber / Red Ale": {
                  "term": {
                    "style.keyword": "American Amber / Red Ale"
                  }
                },
                "American Barleywine": {
                  "term": {
                    "style.keyword": "American Barleywine"
                  }
                },
                "American Black Ale": {
                  "term": {
                    "style.keyword": "American Black Ale"
                  }
                },
                "Black & Tan": {
                  "term": {
                    "style.keyword": "Black & Tan"
                  }
                },
                "American Blonde Ale": {
                  "term": {
                    "style.keyword": "American Blonde Ale"
                  }
                },
                "American Brown Ale": {
                  "term": {
                    "style.keyword": "American Brown Ale"
                  }
                },
                "Chile Beer": {
                  "term": {
                    "style.keyword": "Chile Beer"
                  }
                },
                "Cream Ale": {
                  "term": {
                    "style.keyword": "Cream Ale"
                  }
                },
                "American Dark Wheat Ale": {
                  "term": {
                    "style.keyword": "American Dark Wheat Ale"
                  }
                },
                "American Double / Imperial IPA": {
                  "term": {
                    "style.keyword": "American Double / Imperial IPA"
                  }
                },
                "American Double / Imperial Stout": {
                  "term": {
                    "style.keyword": "American Double / Imperial Stout"
                  }
                },
                "American Pale Wheat Ale": {
                  "term": {
                    "style.keyword": "American Pale Wheat Ale"
                  }
                },
                "American Porter": {
                  "term": {
                    "style.keyword": "American Porter"
                  }
                },
                "Pumpkin Ale": {
                  "term": {
                    "style.keyword": "Pumpkin Ale"
                  }
                },
                "Rye Beer": {
                  "term": {
                    "style.keyword": "Rye Beer"
                  }
                },
                "American Stout": {
                  "term": {
                    "style.keyword": "American Stout"
                  }
                },
                "American Strong Ale": {
                  "term": {
                    "style.keyword": "American Strong Ale"
                  }
                },
                "Wheatwine": {
                  "term": {
                    "style.keyword": "Wheatwine"
                  }
                },
                "American Wild Ale": {
                  "term": {
                    "style.keyword": "American Wild Ale"
                  }
                },
                "Belgian Dark Ale": {
                  "term": {
                    "style.keyword": "Belgian Dark Ale"
                  }
                },
                "Dubbel": {
                  "term": {
                    "style.keyword": "Dubbel"
                  }
                },
                "Faro": {
                  "term": {
                    "style.keyword": "Faro"
                  }
                },
                "Flanders Oud Bruin": {
                  "term": {
                    "style.keyword": "Flanders Oud Bruin"
                  }
                },
                "Flanders Red Ale": {
                  "term": {
                    "style.keyword": "Flanders Red Ale"
                  }
                },
                "Gueuze": {
                  "term": {
                    "style.keyword": "Gueuze"
                  }
                },
                "Belgian IPA": {
                  "term": {
                    "style.keyword": "Belgian IPA"
                  }
                },
                "Lambic - Fruit": {
                  "term": {
                    "style.keyword": "Lambic - Fruit"
                  }
                },
                "Lambic - Unblended": {
                  "term": {
                    "style.keyword": "Lambic - Unblended"
                  }
                },
                "Belgian Pale Ale": {
                  "term": {
                    "style.keyword": "Belgian Pale Ale"
                  }
                },
                "Quadrupel (Quad)": {
                  "term": {
                    "style.keyword": "Quadrupel (Quad)"
                  }
                },
                "Saison / Farmhouse Ale": {
                  "term": {
                    "style.keyword": "Saison / Farmhouse Ale"
                  }
                },
                "Belgian Strong Dark Ale": {
                  "term": {
                    "style.keyword": "Belgian Strong Dark Ale"
                  }
                },
                "Belgian Strong Pale Ale": {
                  "term": {
                    "style.keyword": "Belgian Strong Pale Ale"
                  }
                },
                "Tripel": {
                  "term": {
                    "style.keyword": "Tripel"
                  }
                },
                "Witbier": {
                  "term": {
                    "style.keyword": "Witbier"
                  }
                },
                "Bière de Champagne / Bière Brut": {
                  "term": {
                    "style.keyword": "Bière de Champagne / Bière Brut"
                  }
                },
                "Bière de Garde": {
                  "term": {
                    "style.keyword": "Bière de Garde"
                  }
                },
                "Baltic Porter": {
                  "term": {
                    "style.keyword": "Baltic Porter"
                  }
                },
                "English Barleywine": {
                  "term": {
                    "style.keyword": "English Barleywine"
                  }
                },
                "English Bitter": {
                  "term": {
                    "style.keyword": "English Bitter"
                  }
                },
                "Braggot": {
                  "term": {
                    "style.keyword": "Braggot"
                  }
                },
                "English Brown Ale": {
                  "term": {
                    "style.keyword": "English Brown Ale"
                  }
                },
                "English Dark Mild Ale": {
                  "term": {
                    "style.keyword": "English Dark Mild Ale"
                  }
                },
                "Foreign / Export Stout": {
                  "term": {
                    "style.keyword": "Foreign / Export Stout"
                  }
                },
                "English India Pale Ale (IPA)": {
                  "term": {
                    "style.keyword": "English India Pale Ale (IPA)"
                  }
                },
                "Milk / Sweet Stout": {
                  "term": {
                    "style.keyword": "Milk / Sweet Stout"
                  }
                },
                "Oatmeal Stout": {
                  "term": {
                    "style.keyword": "Oatmeal Stout"
                  }
                },
                "Old Ale": {
                  "term": {
                    "style.keyword": "Old Ale"
                  }
                },
                "English Pale Ale": {
                  "term": {
                    "style.keyword": "English Pale Ale"
                  }
                },
                "English Pale Mild Ale": {
                  "term": {
                    "style.keyword": "English Pale Mild Ale"
                  }
                },
                "English Porter": {
                  "term": {
                    "style.keyword": "English Porter"
                  }
                },
                "English Stout": {
                  "term": {
                    "style.keyword": "English Stout"
                  }
                },
                "English Strong Ale": {
                  "term": {
                    "style.keyword": "English Strong Ale"
                  }
                },
                "Extra Special / Strong Bitter (ESB)": {
                  "term": {
                    "style.keyword": "Extra Special / Strong Bitter (ESB)"
                  }
                },
                "Winter Warmer": {
                  "term": {
                    "style.keyword": "Winter Warmer"
                  }
                },
                "Sahti": {
                  "term": {
                    "style.keyword": "Sahti"
                  }
                },
                "Altbier": {
                  "term": {
                    "style.keyword": "Altbier"
                  }
                },
                "Berliner Weissbier": {
                  "term": {
                    "style.keyword": "Berliner Weissbier"
                  }
                },
                "Dunkelweizen": {
                  "term": {
                    "style.keyword": "Dunkelweizen"
                  }
                },
                "Gose": {
                  "term": {
                    "style.keyword": "Gose"
                  }
                },
                "Hefeweizen": {
                  "term": {
                    "style.keyword": "Hefeweizen"
                  }
                },
                "Kristalweizen": {
                  "term": {
                    "style.keyword": "Kristalweizen"
                  }
                },
                "Roggenbier": {
                  "term": {
                    "style.keyword": "Roggenbier"
                  }
                },
                "Weizenbock": {
                  "term": {
                    "style.keyword": "Weizenbock"
                  }
                },
                "Irish Dry Stout": {
                  "term": {
                    "style.keyword": "Irish Dry Stout"
                  }
                },
                "Irish Red Ale": {
                  "term": {
                    "style.keyword": "Irish Red Ale"
                  }
                },
                "Russian Imperial Stout": {
                  "term": {
                    "style.keyword": "Russian Imperial Stout"
                  }
                },
                "Scotch Ale / Wee Heavy": {
                  "term": {
                    "style.keyword": "Scotch Ale / Wee Heavy"
                  }
                },
                "Scottish Ale": {
                  "term": {
                    "style.keyword": "Scottish Ale"
                  }
                },
                "Scottish Gruit / Ancient Herbed Ale": {
                  "term": {
                    "style.keyword": "Scottish Gruit / Ancient Herbed Ale"
                  }
                },
                "American Adjunct Lager": {
                  "term": {
                    "style.keyword": "American Adjunct Lager"
                  }
                },
                "American Amber / Red Lager": {
                  "term": {
                    "style.keyword": "American Amber / Red Lager"
                  }
                },
                "American Double / Imperial Pilsner": {
                  "term": {
                    "style.keyword": "American Double / Imperial Pilsner"
                  }
                },
                "American Malt Liquor": {
                  "term": {
                    "style.keyword": "American Malt Liquor"
                  }
                },
                "American Pale Lager": {
                  "term": {
                    "style.keyword": "American Pale Lager"
                  }
                },
                "California Common / Steam Beer": {
                  "term": {
                    "style.keyword": "California Common / Steam Beereuze"
                  }
                },
                "Light Lager": {
                  "term": {
                    "style.keyword": "Light Lager"
                  }
                },
                "Low Alcohol Beer": {
                  "term": {
                    "style.keyword": "Low Alcohol Beer"
                  }
                },
                "Czech Pilsener": {
                  "term": {
                    "style.keyword": "Czech Pilsener"
                  }
                },
                "Euro Dark Lager": {
                  "term": {
                    "style.keyword": "Euro Dark Lager"
                  }
                },
                "Euro Pale Lager": {
                  "term": {
                    "style.keyword": "Euro Pale Lager"
                  }
                },
                "Euro Strong Lager": {
                  "term": {
                    "style.keyword": "Euro Strong Lager"
                  }
                },
                "Bock": {
                  "term": {
                    "style.keyword": "Bock"
                  }
                },
                "Doppelbock": {
                  "term": {
                    "style.keyword": "Doppelbock"
                  }
                },
                "Dortmunder / Export Lager": {
                  "term": {
                    "style.keyword": "Dortmunder / Export Lager"
                  }
                },
                "Eisbock": {
                  "term": {
                    "style.keyword": "Eisbock"
                  }
                },
                "German Pilsener": {
                  "term": {
                    "style.keyword": "German Pilsener"
                  }
                },
                "Kellerbier / Zwickelbier": {
                  "term": {
                    "style.keyword": "Kellerbier / Zwickelbier"
                  }
                },
                "Maibock / Helles Bock": {
                  "term": {
                    "style.keyword": "Maibock / Helles Bockeuze"
                  }
                },
                "Märzen / Oktoberfest": {
                  "term": {
                    "style.keyword": "Märzen / Oktoberfest"
                  }
                },
                "Munich Dunkel Lager": {
                  "term": {
                    "style.keyword": "Munich Dunkel Lager"
                  }
                },
                "Munich Helles Lager": {
                  "term": {
                    "style.keyword": "Munich Helles Lager"
                  }
                },
                "Rauchbier": {
                  "term": {
                    "style.keyword": "Rauchbier"
                  }
                },
                "Schwarzbier": {
                  "term": {
                    "style.keyword": "Schwarzbier"
                  }
                },
                "Vienna Lager": {
                  "term": {
                    "style.keyword": "Vienna Lager"
                  }
                },
                "Happoshu": {
                  "term": {
                    "style.keyword": "Happoshu"
                  }
                },
                "Japanese Rice Lager": {
                  "term": {
                    "style.keyword": "Japanese Rice Lager"
                  }
                },
                "Fruit / Vegetable Beer": {
                  "term": {
                    "style.keyword": "Fruit / Vegetable Beer"
                  }
                },
                "Herbed / Spiced Beer": {
                  "term": {
                    "style.keyword": "Herbed / Spiced Beer"
                  }
                },
                "Smoked Beer": {
                  "term": {
                    "style.keyword": "Smoked Beer"
                  }
                }
              }
            },
            "aggs": {
              "max abv": {
                "max": {
                  "field": "abv"
                }
              }
            }
          }
        }
      }
  }
}


module.exports = {
    countStyle: countStyle,
    countAllStylesBa: allStylesBa,
    countAllStylesAp: allStylesAp,
    apAgg1: apAgg1,
    baAgg1: baAgg1
};
