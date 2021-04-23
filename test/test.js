const { expect, use, should } = require('chai')

const pause_func = s => {
    const milliseconds = s * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const Token = artifacts.require('./Token')
const Bank = artifacts.require('./dBank')
const EVM_REVERT = 'VM Exception while processing transaction: revert'

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('dBank', ([deployer, user]) => {
    let token, dBank

    beforeEach(async ()=> {
        token = await Token.new({from: deployer})
        dbank = await Bank.new(token.address, {from: deployer})
        await token.passMinterRole(dbank.address, {from: deployer})
        })

    describe('initial test', () => {
        it('test_for_name', async () => {
            expect(await token.name()).to.be.eq('dbank')
        })

        it('test_for_symbol', async () => {
            expect(await token.symbol()).to.be.eq('DBK')
        })
        it('minter_is_dbank', async () => {
            expect(await token.minter()).to.be.eq(dbank.address)
        })
        it('initial_pause_is_false', async () => {
            expect(await token.paused()).to.be.eq(false)
        })
        it('owner_cannot_mint_tokens_after_deploy', async () => {
            await token.mint(user, 1000, {from: deployer}).should.be.rejectedWith(EVM_REVERT)
        })
    })

    describe('test_for_allowance', () => {
        it('initial_allowance_is_0', async () => {
            expect(Number(await token.allowance(user, deployer))).to.eq(0)
        })
    })

    describe('test_for_deposit', () => {
        beforeEach(async () => {
            await dbank.deposit({value: 10**16, from: user})
            })
    
        it('balance_increase_after_deposit', async () => {
            expect(Number(await dbank.etherBalanceOf(user))).to.eq(10**16)
        })

        it('another_deposit_is_block_while_already_deposited', async () => {
            dbank.deposit({value: 10*18, from: user}).should.be.rejectedWith(EVM_REVERT) 
        })
    })
    describe('test_for_withdraw', () => {
        beforeEach(async () => {
            await dbank.deposit({value: 10**16, from: user})
            await pause_func(10)
            await dbank.withdraw({from: user})
        })
        it ('etherbalanceOf is 0', async () => {
            expect (Number(await dbank.etherBalanceOf(user))).to.eq(0)
        })
        it ('benificiar gets tokens of Bank after withdraw', async () => {
            expect (Number(await token.balanceOf(user))).to.be.above(0)
        })
    })

    describe('test_for_borrow', () => {
        beforeEach(async () => {
            await dbank.borrow({value: 10**18, from: user})
            })
    
        it('user receive tokens after borrow', async () => {
            expect(Number(await token.balanceOf(user))).to.eq(5*10**17)
        })

        it('another_borrow_is_block_while_already_borrowed', async () => {
            await dbank.borrow({value: 10*18, from: user}).should.be.rejectedWith(EVM_REVERT) 
        })
    })

    describe('test_for_payoff', () => {
        beforeEach(async () => {
            await dbank.borrow({value: 10**18, from: user})
            await pause_func(10)
            await dbank.payOff({from: user})
        })
        it ('collateralEther is 0', async () => {
            expect (Number(await dbank.collateralEther(user))).to.eq(0)
        })
        it ('bank takes tokens back', async () => {
            expect (Number(await token.balanceOf(user))).to.eq(0)
        })
    })

    describe('test_for_approve', () => {
        beforeEach(async () => {
            await dbank.borrow({value: 10**18, from: user})
        })
        it ('approve is working', async () => {
            expect(Number(await token.allowance(user, dbank.address))).to.eq(5*10**17)
        })
        it('only dbank can approve', async () => {
            await token.approve(user, dbank.address, 1000, {from: user}).should.be.rejectedWith(EVM_REVERT)
        })
    })
    
    
})