// AuctionBox.sol
// We will be using Solidity version 0.5.3
pragma solidity 0.5.16;
// Importing OpenZeppelin's SafeMath Implementation
import "./SafeMath.sol";
import "./Art.sol";

contract AuctionBox{
    ART_CONTRACT private token;
    address internal owner;
    
    
    EnglishAuction[] public auctions; 
    constructor() public {
        owner = msg.sender;
    }   
    
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    function createAuction (ART_CONTRACT _token, address payable _beneficiary, uint _biddingTime, 
                            uint _startPrice, uint256 _share_id, uint256 _token_id, uint256 _step_min, uint256 _step_max)  onlyOwner public{
        // set the new instance
        EnglishAuction newEnglishAuction = new EnglishAuction(_token, msg.sender, _biddingTime, _beneficiary, _startPrice, _share_id, _token_id, _step_min, _step_max);
        // push the auction address to auctions array
        auctions.push(newEnglishAuction);
    }
    
    function returnAllAuctions() public view returns(EnglishAuction[] memory){
        return auctions;
    }
}

contract EnglishAuction {
    // Parameters of the auction. Times are either
    // absolute unix timestamps (seconds since 1970-01-01)
    // or time periods in seconds.
    address payable public beneficiary;
    uint public auctionEndTime;
    
    ART_CONTRACT private token;
    address private owner;
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    modifier tokenExist {
        require(token.token_exist(token_id), "Token doesn't exist");
        _;
    }

    // Current state of the auction.
    address public highestBidder;
    uint public highestBid;
    uint public startPrice;
    uint public step_min;
    uint public step_max;
    
    //uint public MIN_PERCENT = 0.005; 
    //uint public MAX_PERCENT = 0.05;
    // Allowed withdrawals of previous bids
    mapping(address => uint) pendingReturns;
    mapping(address => uint) public participant_latest_bid;

    // Set to true at the end, disallows any change.
    // By default initialized to `false`.
    bool public is_ended;
    
    uint256 public share_id;
    uint256 public token_id;

    // Events that will be emitted on changes.
    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    // The following is a so-called natspec comment,
    // recognizable by the three slashes.
    // It will be shown when the user is asked to
    // confirm a transaction.

    /// Create a simple auction with `_biddingTime`
    /// seconds bidding time on behalf of the
    /// beneficiary address `_beneficiary`.
    constructor(
        ART_CONTRACT _token,
        address _owner, 
        uint _biddingTime,
        address payable _beneficiary,
        uint _startPrice,
        uint256 _share_id,
        uint256 _token_id,
        uint256 _step_min,
        uint256 _step_max
            ) public {
        
        token = _token;
        beneficiary = _beneficiary;
        auctionEndTime = now + _biddingTime;
        startPrice = _startPrice;
        owner = _owner;
        share_id = _share_id;
        token_id = _token_id;
        step_min = _step_min;
        step_max = _step_max;
    }

    /// Bid on the auction with the value sent
    /// together with this transaction.
    /// The value will only be refunded if the
    /// auction is not won.
    function bid() tokenExist public payable {
        // No arguments are necessary, all
        // information is already part of
        // the transaction. The keyword payable
        // is required for the function to
        // be able to receive Ether.

        // Revert the call if the bidding
        // period is over.
        
        require(now <= auctionEndTime,"Auction already ended.");
        require(msg.sender != highestBidder, "You are already the highestBidder");
        // If the bid is not higher, send the
        // money back.
        require(msg.value + participant_latest_bid[msg.sender] >= startPrice); //msg.value (delta) + latest_bid
        //if (highestBid == 0) {
        //    require(msg.value + participant_latest_bid[msg.sender] > (1 + step_min/1000) wei * startPrice &&  msg.value + participant_latest_bid[msg.sender] < (1 + step_max/100) * startPrice, "Your bid is out of allowed range (start)");  /// 
        //} else {
        //    require(msg.value + participant_latest_bid[msg.sender] > (1 + step_min/1000) * highestBid &&  msg.value + participant_latest_bid[msg.sender] < (1 + step_max/100) * highestBid, "Your bid is out of allowed range ");  /// 
        //}
        (uint256 min_bid, uint256 max_bid) = bid_range();
        if (highestBid == 0) {
            require(msg.value + participant_latest_bid[msg.sender] > min_bid  &&  msg.value + participant_latest_bid[msg.sender] <= max_bid , "Your bid is out of allowed range (start)");  /// 
        } else {
            require(msg.value + participant_latest_bid[msg.sender] > min_bid  &&  msg.value + participant_latest_bid[msg.sender] <= max_bid , "Your bid is out of allowed range ");  /// 
        }   // !!!! DELTA
        
        
        //require(msg.value + participant_latest_bid[msg.sender] > (1 + step_min/1000) * highestBid &&  msg.value + participant_latest_bid[msg.sender] < (1 + step_max/100) * highestBid, "Your bid is out of allowed range ");  /// msg.value + old_bid > highestBid + step_min && msg.value + old_bid <= highestBid + step_max
        
        // the first bid already in auction
        if (highestBid != 0) {
            // Sending back the money by simply using
            // highestBidder.send(highestBid) is a security risk
            // because it could execute an untrusted contract.
            // It is always safer to let the recipients
            // withdraw their money themselves.
            pendingReturns[highestBidder] = participant_latest_bid[highestBidder]; /// += --> =
        }

        highestBidder = msg.sender;
        highestBid = participant_latest_bid[highestBidder] + msg.value;
        participant_latest_bid[msg.sender] += msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

    function bid_range() public view returns (uint256, uint256) {
        if (highestBid == 0) {
            uint256 a = startPrice + (startPrice/1e3)*step_min;
            uint256 b = startPrice + (startPrice/1e2)*step_max;
            return (a, b);
        } else {
            uint256 a = highestBid + (highestBid/1e3)*step_min;
            uint256 b = highestBid + (highestBid/1e2)*step_max;
            return (a, b);
        }

        
    }
    /// Withdraw a bid that was overbid.
    function withdraw() public tokenExist returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            // It is important to set this to zero because the recipient
            // can call this function again as part of the receiving call
            // before `send` returns.
            pendingReturns[msg.sender] = 0;

            if (!msg.sender.send(amount)) {
                // No need to call throw here, just reset the amount owing
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    /// End the auction and send the highest bid
    /// to the beneficiary.
    function auctionEnd() public onlyOwner tokenExist {
        // It is a good guideline to structure functions that interact
        // with other contracts (i.e. they call functions or send Ether)
        // into three phases:
        // 1. checking conditions
        // 2. performing actions (potentially changing conditions)
        // 3. interacting with other contracts
        // If these phases are mixed up, the other contract could call
        // back into the current contract and modify the state or cause
        // effects (ether payout) to be performed multiple times.
        // If functions called internally include interaction with external
        // contracts, they also have to be considered interaction with
        // external contracts.

        // 1. Conditions
        require(now >= auctionEndTime, "Auction not yet ended.");
        require(!is_ended, "auctionEnd has already been called.");

        // 2. Effects
        is_ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        // 3. Interaction
        beneficiary.transfer(highestBid);
        //token.transferFrom(beneficiary, highestBidder, share_id); 
        
    }
}