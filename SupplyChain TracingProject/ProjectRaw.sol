pragma solidity ^0.6.0;

contract Ownable {
    address payable _owner;
    constructor() public{
        _owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == _owner, "you are not the owner");
        _;
    }
    
    function isOwner() public view returns(bool){
        return(msg.sender == _owner);
    }
}

contract Item {
    uint public priceInWei;
    uint public index;
    uint public pricePaid;
    
    itemManager parentContract;
    
    constructor(itemManager _parentContract, uint _priceInWei, uint _index) public {
        priceInWei = _priceInWei;
        index = _index;
        parentContract = _parentContract;
    }
    
    receive() external payable {
        require(pricePaid == 0, "item is paid already");
        require(priceInWei == msg.value, "only full payment allowed");
        pricePaid += msg.value;
        (bool success,)  = address(parentContract).call{value:msg.value}(abi.encodeWithSignature("triggerPayment(uint256)", index));
        require(success, "transaction wasn't succesful, cancelling");
        
    }
    fallback() external {
        
    }
}

contract itemManager is Ownable{
    
    enum supplyChainState{Created, Paid, Delivered}
    
    struct s_item {
        Item _item;
        string _identifier;
        uint _itemPrice;
        itemManager.supplyChainState _state;
    }
    
    mapping(uint => s_item) public items;
    uint itemIndex;
    
    event SupplyChainStep(uint _itemIndex, uint _step, address _itemAddress);
    
    function createItem(string memory _identifier, uint _itemPrice) public onlyOwner {
        Item item = new Item(this, _itemPrice, itemIndex);
        items[itemIndex]._item = item;
        items[itemIndex]._identifier = _identifier;
        items[itemIndex]._itemPrice = _itemPrice;
        items[itemIndex]._state  =supplyChainState.Created;
        emit SupplyChainStep(itemIndex, uint(items[itemIndex]._state), address(item));
        itemIndex++;
        
    }
    function triggerPayment(uint _itemIndex) public payable {
        require(items[_itemIndex]._itemPrice == msg.value, "Only Full Payment Accepted");
        require(items[_itemIndex]._state == supplyChainState.Created, "item further in the chain");
        items[_itemIndex]._state = supplyChainState.Paid;
        emit SupplyChainStep(_itemIndex, uint(items[_itemIndex]._state), address(items[_itemIndex]._item));
    }
    function triggerDelivery(uint _itemIndex) public onlyOwner {
        require(items[_itemIndex]._state == supplyChainState.Paid, "item further in the chain");
        items[_itemIndex]._state = supplyChainState.Delivered;
        emit SupplyChainStep(_itemIndex, uint(items[_itemIndex]._state), address(items[_itemIndex]._item));

        
    }
}