# witnet-pricefeed-krw-example
This is an example of a decentralized price-feed retrieving the price of the KRW with respect to BTC and USD. The smart contract utilizes the Witnet DON to retrieve the data from 8 different sources in both cases. These sources are:

KRW/BTC:
 - coinone
 - blockchain
 - coinzeus
 - korbit
 - bithumb
 - coindesk
 - coinpaprika
 - billboard

USD/KRW:
 - rateExchange
 - transferwise
 - freecurrencyrates
 - finder
 - reuters
 - freeForexApi
 - fxEmpire
 - currencyCal
 

The **aggregation phase** includes a filter in which values deviated more than 1.5 standard deviations from the average are discarded. After that, the average of the values reported by the **sources** is taken.

The **tally phase** includes a filter in which values deviated more than 1 standard deviation from the average are discarded. After that, the average of the values reported by the **witnesses** is taken.

##cl Disclaimer

This code is experimental and APIs are subject to change. If you come across problems, it would help greatly to open issues so that we can fix them as quickly as possible.
