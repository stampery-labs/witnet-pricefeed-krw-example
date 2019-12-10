import * as Witnet from "witnet-requests"

const rateExchange = new Witnet.Source("http://rate-exchange-1.appspot.com/currency?from=USD&to=KRW")
  .parseJSON().asMap()
  .get("rate").asFloat()
const transferwise = new Witnet.Source("https://transferwise.com/gb/currency-converter/api/historic?source=USD&target=KRW")
  .parseJSON().asArray()
  .map(new Witnet.Script([Witnet.TYPES.MAP, Witnet.TYPES.BYTES])
    .get("rate").asFloat()
  )
  .get(0)

const freecurrencyrates = new Witnet.Source("https://freecurrencyrates.com/api/action.php?s=fcr&iso=USD-KRW&f=USD&v=1&do=cvals")
  .parseJSON().asMap()
  .get("updated").asFloat()

const finder = new Witnet.Source("https://www.finder.com/wp-admin/admin-ajax.php?action=rate_table_rates&currencies=USD,KRW")
  .parseJSON().asMap()
  .get("USD").asMap()
  .get("USDKRW").asFloat()

const reuters = new Witnet.Source("https://www.reuters.com/companies/api/getFetchQuotes/USDKRW")
  .parseJSON().asMap()
  .get("market_data").asMap()
  .get("currencypairs").asArray()
  .map(new Witnet.Script([Witnet.TYPES.MAP, Witnet.TYPES.BYTES])
    .get("last").asFloat()
  )
  .get(0)

const freeForexApi = new Witnet.Source("https://www.freeforexapi.com/api/live?pairs=USDKRW")
  .parseJSON().asMap()
  .get("rates").asMap()
  .get("USDKRW").asMap()
  .get("rate").asFloat()

const fxEmpire = new Witnet.Source("https://www.fxempire.com/api/v1/en/markets/usd-krw/full")
  .parseJSON().asMap()
  .get("value").asFloat()

const currencyCal = new Witnet.Source("https://www.currency-calc.com/currencies_rates.json")
  .parseJSON().asMap()
  .get("currencies").asArray()
  .filter(new Witnet.Script([Witnet.TYPES.MAP, Witnet.TYPES.BYTES])
    .get("code").asString()
    .match({
      "KRW": true,
    }, false)
  )
  .map(new Witnet.Script([Witnet.TYPES.MAP, Witnet.TYPES.BYTES])
    .get("rate").asFloat()
  )
  .get(0)

const aggregator = new Witnet.Aggregator([
  rateExchange,
  transferwise,
  freecurrencyrates,
  finder,
  reuters,
  freeForexApi,
  fxEmpire,
  currencyCal])
  .filter(Witnet.Types.FILTERS.deviationStandard, 1.5)
  .reduce(Witnet.Types.REDUCERS.averageMean)

const tally = new Witnet.Tally(aggregator)
  .filter(Witnet.Types.FILTERS.deviationStandard, 1)
  .reduce(Witnet.Types.REDUCERS.averageMean)
  .multiply(10000)
  .round()

const request = new Witnet.Request() // Create a new request
  .addSource(rateExchange)
  .addSource(transferwise)
  .addSource(freecurrencyrates)
  .addSource(finder)
  .addSource(reuters)
  .addSource(freeForexApi)
  .addSource(currencyCal)
  .addSource(fxEmpire)
  .setAggregator(aggregator) // Set aggregation function
  .setTally(tally) // Set tally function
  .setQuorum(5, 0, 2) // 5 witness nodes 0 backup factor 2 extra reveal rounds
  .setFees(1003, 1, 1, 1)

export { request as default } // IMPORTANT: export the request as an ES6 module
