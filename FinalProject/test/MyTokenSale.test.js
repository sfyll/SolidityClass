const Token = artifacts.require("MyToken.sol");
const TokenSale = artifacts.require("MyTokenSale.sol");
const kycContract = artifacts.require("KycContract.sol");

const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;
const { assert } = require("console");
const { send } = require("process");
const { isatty } = require("tty");
const { isMainThread } = require("worker_threads");
const { contracts_build_directory } = require("../truffle-config");

contract("Token Sale Test",  function(accounts) {

    const [initialHolder, recipient, anotherAccout] = accounts;

    it("should not have any token in my initialHolder", async() => {
        let instance = await Token.deployed();
        return expect(instance.balanceOf(initialHolder)).to.eventually.be.a.bignumber.equal(new BN(0));
    })

    it("all tokens should be in the TokenSale smart contract by default", async() => {
        let instance = await Token.deployed();
        let balance = await instance.balanceOf(TokenSale.address);
        let totalSupply = await instance.totalSupply();
        return expect(balance).to.be.a.bignumber.equal(totalSupply);

    });

    it("should be possible to buy tokens", async() => {
        let tokenInstance = await Token.deployed();
        let tokenSaleInstance = await TokenSale.deployed();
        let kycInstance = await kycContract.deployed();
        let balanceBefore = await tokenInstance.balanceOf(recipient);
        await kycInstance.setKycCompleted(recipient, {from: initialHolder});
        expect(tokenSaleInstance.sendTransaction({from: recipient, value: web3.utils.toWei("1", "wei")})).to.be.fulfilled;
        return expect(tokenInstance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(balanceBefore.add(new BN(1)))
        
    });
});