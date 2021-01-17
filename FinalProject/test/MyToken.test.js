const Token = artifacts.require("MyToken.sol")

const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

const { assert } = require("console");
const { send } = require("process");
const { isatty } = require("tty");
const { isMainThread } = require("worker_threads");
const { contracts_build_directory } = require("../truffle-config");

contract("Token Test",  function(accounts) {

    const [initialHolder, recipient, anotherAccout] = accounts;

    beforeEach(async() => {
        this.MyToken = await Token.new(process.env.INITIAL_TOKENS);
    });

    it("all tokens should be in my account", async() => {
        let instance = this.MyToken;
        let totalSupply = await instance.totalSupply();
        //let balance = await instance.balanceOf(accounts[0]);
        //assert.equal(balance.valueOf(), initialSupply.valueOf(), "balance was not the same");   
        return expect(instance.balanceOf(initialHolder)).to.eventually.be.a.bignumber.equal(totalSupply);
    })

    it("is possible to send balance between accounts", async() => {
        const sendTokens = 1;
        let instance = this.MyToken;
        let totalSupply = await instance.totalSupply();
        expect(instance.balanceOf(initialHolder)).to.eventually.be.a.bignumber.equal(totalSupply);
        expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled;
        expect(instance.balanceOf(initialHolder)).to.eventually.be.a.bignumber.equal(totalSupply.sub(new BN(sendTokens)));
        return expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(new BN(sendTokens));

    })

    it("is not possible to send more tokens than available in total", async() => {
        let instance = this.MyToken;
        let balanceOfDeployer = await instance.balanceOf(initialHolder);
        expect(instance.transfer(recipient, new BN(balanceOfDeployer+1))).to.eventually.be.rejected;

        return expect(instance.balanceOf(initialHolder)).to.eventually.be.a.bignumber.equal(balanceOfDeployer);
    })
})

/*
const sendTokens = 1;
let instance = await Token.deployed();
let totalSupply = await instance.totalSupply(); 
expect(instance.balanceOf(initialHolder)).to.eventually.be.a.bignumber.equal(totalSupply);
expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled;
expect(instance.balanceOf(initialHolder)).to.eventually.be.a.bignumber.equal(totalSupply.sub(new BN(sendTokens)));
expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(new BN(sendTokens));
});*/