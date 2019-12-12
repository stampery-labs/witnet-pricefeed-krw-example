pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

// Import the UsingWitnet library that enables interacting with Witnet
import "witnet-ethereum-bridge/contracts/UsingWitnet.sol";
// Import the USD/KRW request that you created before
import "./requests/krwUsdFeed.sol";

// Your contract needs to inherit from UsingWitnet
contract PriceFeed is UsingWitnet {
  int128 public krwPrice; // The public USD-KRW price point
  uint256 lastRequestId;      // Stores the ID of the last Witnet request
  bool pending;               // Tells if an update has been requested but not yet completed
  Request request;            // The Witnet request object, is set in the constructor

  // This constructor does a nifty trick to tell the `UsingWitnet` library where
  // to find the Witnet contracts on whatever Ethereum network you use.
  constructor (address _wbi) UsingWitnet(_wbi) public {
    // Instantiate the Witnet request
    request = new krwUsdFeedRequest();
  }

  function requestUpdate() public payable {
    require(!pending, "An update is already pending. Complete it first before requesting another update.");

    // Amount to pay to the bridge node relaying this request from Ethereum to Witnet
    uint256 _witnetRequestReward = 100 szabo;
    // Amount of wei to pay to the bridge node relaying the result from Witnet to Ethereum
    uint256 _witnetResultReward = 100 szabo;

    // Send the request to Witnet and store the ID for later retrieval of the result
    // The `witnetPostRequest` method comes with `UsingWitnet`
    lastRequestId = witnetPostRequest(request, _witnetRequestReward, _witnetResultReward);
  }

  function completeUpdate() public payable witnetRequestAccepted(lastRequestId) {
    require(pending, "There is no pending update.");

    // Read the result of the Witnet request
    // The `witnetReadResult` method comes with `UsingWitnet`
    Witnet.Result memory result = witnetReadResult(lastRequestId);
    // If the Witnet request succeeded, decode the result and update the price point
    if (result.isOk()) {
      krwPrice = result.asInt128();
    }
    // In any case, set `pending` to false so a new update can be requested
    pending = false;
  }
}
