import * as Witnet from "witnet-requests"

const coinone = new Witnet.Source("https://api.coinone.co.kr/ticker")
  .parseJSON()
  .asMap()
  .get("last")
  .asFloat()
const blockchain = new Witnet.Source("https://blockchain.info/ticker")
  .parseJSON()
  .asMap()
  .get("KRW")
  .asMap()
  .get("last")
  .asFloat()
const coinzeus = new Witnet.Source("https://api2.coinzeus.io/ticker/BTCExchangeTicker")
  .parseJSON()
  .asMap()
  .get("data")
  .asMap()
  .get("krw")
  .asMap()
  .get("last")
  .asFloat()
const korbit = new Witnet.Source("https://api.korbit.co.kr/v1/ticker")
  .parseJSON()
  .asMap()
  .get("last")
  .asFloat()
const bithumb = new Witnet.Source("https://api.bithumb.com/public/ticker/BTC")
  .parseJSON()
  .asMap()
  .get("data")
  .asMap()
  .get("closing_price")
  .asFloat()
const coindesk = new Witnet.Source("https://api.coindesk.com/v1/bpi/currentprice/KRW.json")
  .parseJSON()
  .asMap()
  .get("bpi")
  .asMap()
  .get("KRW")
  .asMap()
  .get("rate_float")
  .asFloat()
const coinpaprika = new Witnet.Source("https://api.coinpaprika.com/v1/price-converter?base_currency_id=btc-bitcoin&quote_currency_id=krw-south-korea-won&amount=1")
  .parseJSON()
  .asMap()
  .get("price")
  .asFloat()
const billboard = new Witnet.Source("https://billboard.service.cryptowat.ch/assets?quote=krw&limit=1&sort=volume")
  .parseJSON()
  .asMap()
  .get("result")
  .asMap()
  .get("rows")
  .asArray()
  .filter(new Witnet.Script([Witnet.TYPES.MAP, Witnet.TYPES.BYTES])
    .get("symbol")
    .asString()
    .match({
      "btc": true,
    }, false)
  )
  .map(new Witnet.Script([Witnet.TYPES.MAP, Witnet.TYPES.BYTES])
    .get("price")
    .asFloat()
  )
  .get(0)

const aggregator = new Witnet.Aggregator([
  coinone,
  blockchain,
  coinzeus,
  korbit,
  bithumb,
  coindesk,
  coinpaprika,
  billboard])
  .filter(Witnet.Types.FILTERS.deviationStandard, 1.5)
  .reduce(Witnet.Types.REDUCERS.averageMean)

const tally = new Witnet.Tally(aggregator)
  .filter(Witnet.Types.FILTERS.deviationStandard, 1)
  .reduce(Witnet.Types.REDUCERS.averageMean)
  .multiply(10000)
  .round()

const request = new Witnet.Request() // Create a new request
  .addSource(coinone)
  .addSource(blockchain)
  .addSource(coinzeus)
  .addSource(korbit)
  .addSource(bithumb)
  .addSource(coindesk)
  .addSource(coinpaprika)
  .addSource(billboard)
  .setAggregator(aggregator) // Set aggregation function
  .setTally(tally) // Set tally function
  .setQuorum(5, 0, 2) // 5 witness nodes 0 backup factor 2 extra reveal rounds
  .setFees(1003, 1, 1, 1)

export { request as default } // IMPORTANT: export the request as an ES6 module
