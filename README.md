# Test project for tokenization of art object

# 1) Run test blockchain Ganache
GUI - will be running on 7545 port (localhost)
command line version will be running on 8545 port (localhost)

In this case we need GUI version, but you can use command line version, for this purpose you need just change truffle-config.js in ROOT folder.

# 2) Compile contracts

- truffle compile

# 3) Deploy contracts

- truffle deploy

Now you can interract with contracts (get Art token name):
- truffle console
- token = await ART_CONTRACT.deployed()
- name = await token.name()
- name.toString()


# 4) Information about contracts

# ART Token
ERC-721 based token

# Bidding contract





# 6) WEB RESOURCE
- Web resource for clients, functions: 
    1. information about art objects that have been tokenized 
    2. information about bidding
    3. service for transferring tokens and interacting with a smart contract

- Web resource for owner, functions:
    1. Adding an art object
    2. Start (close) of trading



