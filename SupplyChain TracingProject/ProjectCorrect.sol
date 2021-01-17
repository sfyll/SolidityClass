pragma solidity ^0.6.1;

import "./Allowance.sol";

contract sharedWallet is Allowance {
    
    event moneySent(address indexed _beneficiary, uint _amount);
    event moneyReceived(address indexed _fromWho, uint _amount);
    
    function withdrawMoney(address payable _to, uint _amount) public ownerOrAllowed(_amount) {
        require(_amount <= address(this).balance, "not enough fund store in this smart contract");
        if(owner() != msg.sender){
            reduceAllowance(msg.sender, _amount);
        }
        emit moneySent(_to, _amount);
        _to.transfer(_amount);
    }
    function renounceOwnership() public override onlyOwner {
        revert("can't renounce ownernship");
    }
    
    receive() external payable {
        emit moneyReceived(msg.sender, msg.value);
    }
}