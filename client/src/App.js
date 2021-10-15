import React, {Component} from "react";
import Web3 from 'web3';
import ART_CONTRACT from './contracts/ART_CONTRACT.json'
import EnglishAuction from './contracts/EnglishAuction.json'

import Navbar from './Navbar'
import "./App.css";

class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            account: '0x0',
            artToken: {},
            auctionbox: {},
            TokenBalance: '0',
            linkforether: '',
            loading: true,
            isDeposited: 'false',
            DepositStart: 0,
            DepositStartdate: '',
            DepositEther: '',


        }
    }

    async componentWillMount() {
        await this.loadWeb3()
        await this.loadBlockchainData()
    }

    async loadBlockchainData() {
        const web3 = window.web3

        const accounts = await web3.eth.getAccounts()
        this.setState({account: accounts[0]})
        this.setState({addressshort: accounts[0].substr(0, 6) + ' ... ' + accounts[0].substr(accounts[0].length - 4, accounts[0].length)})
        console.log(accounts)

        if (true) {
            const artToken = new web3.eth.Contract(ART_CONTRACT.abi, '0x28A27786C12D801d1E70c92ab26392aDB9b85937')
            this.setState({artToken})
            this.setState({linkforether: 'https://testnet.bscscan.com/address/' + this.state.account})


        } else {
            window.alert('Error in connection, contract does not exist in this network')
        }

        this.setState({loading: false})
    }

    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        } else {
            window.alert("Please install Metamask")
        }

    }

    async ownerOf(shareId) {
        if (this.state.auctionbox !== 'undefined') {
            console.log(shareId)
            try {
                let owner = await this.state.artToken.methods.ownerOf(shareId).call({from: this.state.account})
                window.alert(owner)
                console.log(owner)
            } catch (e) {
                console.log('Error, get ownerOf: ', e)
            }
        }
    }

    async allow(to, shareid) {

        try {
            console.log(to)
            console.log("this is state", this.state.account)
            await this.state.artToken.methods.approve(to, shareid).send({from: this.state.account})
        } catch (e) {
            console.log('Error, allow: ', e)
        }

    }

    async get_art(token_id) {
        if (this.state.auctionbox !== 'undefined') {
            try {
                let art = await this.state.artToken.methods.get_art_by_share_id(token_id).call()
                console.log(art)
                window.alert("Owner: " + art[1] + "\nСущность: " + art[2] + "\nНазвание: " + art[3] + "\nАвтор: " + art[4])
            } catch (e) {
                console.log('Error, get_art: ', e)
            }
        }
    }

    async transfer_from(from, to, shareid) {
        console.log('this is to', to)
        console.log('this is from', from)
        if (this.state.auctionbox !== 'undefined') {
            try {
                await this.state.artToken.methods.safeTransferFrom(from, to, shareid).send({from: this.state.account})
            } catch (e) {
                console.log('Error, transfer_from: ', e)
            }
        }
    }

    async endow_share(from, to, shareid, howmuch) {
        console.log(from)
        console.log(to)
        console.log(shareid)
        console.log(howmuch)
        if (this.state.auctionbox !== 'undefined') {
            try {
                await this.state.artToken.methods.endow_share(from, to, shareid, howmuch).send({from: this.state.account})
            } catch (e) {
                console.log('Error, endow share: ', e)
            }
        }
    }

    async withdraw(address) {
        const web3 = window.web3
        const auction_contract = new web3.eth.Contract(EnglishAuction.abi, address)
        if (this.state.auctionbox !== 'undefined') {
            try {
                await auction_contract.methods.withdraw().send({from: this.state.account})
            } catch (e) {
                console.log('Error, withdraw: ', e)
            }
        }
    }


    async get_share(from, token_id) {
        if (this.state.auctionbox !== 'undefined') {
            try {
                let share = await this.state.artToken.methods.get_share_in_token(from, token_id).call({from: this.state.account})
                //await this.state.artToken.methods.ownerOf(shareId).send({from: this.state.account})
                window.alert("Ваша доля в токене: " + share + " %")
            } catch (e) {
                console.log('Error, get_share: ', e)
            }
        }
    }


    render() {
        return (


            <div class="content" style={{"margin-right": "40px", "margin-left": "15px"}}>

                <Navbar account={this.state.account} linkforether={this.state.linkforether}
                        short={this.state.addressshort}/>

                <section class="py-12" id="pages">
                    <div class="container">
                        <div className="container-fluid">
                            <div class="row" style={{"padding": "10px", "text-align": "center"}}>
                                <div className="col-sm-5 col-md-3" style={{" text-align": "left"}}>

                                    <div class="card" style={{"padding": "15px", "margin": "15px"}}>
                                        <form onSubmit={(e) => {
                                            e.preventDefault()
                                            let to = this.TO_ALLOW.value
                                            let shareid = this.shareID_ALLOW.value
                                            this.allow(to, shareid)
                                        }}>
                                            <div class="row" style={{"padding": "10px"}}>
                                                <button type='submit' style={{
                                                    "border-radius": "50px",
                                                    "margin-left": "0px",
                                                    "margin-right": "0px",
                                                    "margin-top": "0px",
                                                    "background-color": "#B22222",
                                                    "border": "solid 1px #B22222"
                                                }} className='btn btn-primary mb-2'><i class="far fa-check-circle"></i>
                                                </button>
                                                <h3 style={{"border-radius": "50px", "margin": "10px"}}>
                                                    <strong> allow</strong></h3>
                                            </div>
                                            <div class="row" style={{"padding": "10px"}}>
                                                <div class="col-sm-10 col-md-10">
                                                    <div className='form-group mr-sm-2' style={{"max-width": "80%"}}>
                                                        <input
                                                            id='TO_ALLOW'
                                                            type='string'
                                                            ref={(input) => {
                                                                this.TO_ALLOW = input
                                                            }}
                                                            className="form-control mt-2"
                                                            placeholder='_to'
                                                            required/>
                                                        <input
                                                            id='shareID_ALLOW'
                                                            type='unit'
                                                            ref={(input) => {
                                                                this.shareID_ALLOW = input
                                                            }}
                                                            className="form-control  mt-2"
                                                            placeholder='_share_id'
                                                            required/>
                                                    </div>
                                                </div>

                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div className="col-sm-5 col-md-3" style={{" text-align": "left"}}>

                                    <div class="card" style={{"padding": "15px", "margin": "15px"}}>
                                        <form onSubmit={(e) => {
                                            e.preventDefault()
                                            let shareID = this.shareID_Owner.value
                                            this.ownerOf(shareID)
                                        }}>
                                            <div class="row" style={{"padding": "10px"}}>
                                                <button type='submit' style={{
                                                    "border-radius": "50px",
                                                    "margin-left": "0px",
                                                    "margin-right": "0px",
                                                    "margin-top": "0px",
                                                    "background-color": "#B22222",
                                                    "border": "solid 1px #B22222"
                                                }} className='btn btn-primary mb-2'><i class="fas fa-user"></i></button>
                                                <h3 style={{"border-radius": "50px", "margin": "10px"}}>
                                                    <strong> owner_of</strong></h3>
                                            </div>
                                            <div class="row" style={{"padding": "10px"}}>
                                                <div class="col-sm-10 col-md-10">
                                                    <div className='form-group mr-sm-2' style={{"max-width": "80%"}}>
                                                        <input
                                                            id='shareID_Owner'
                                                            type='unit'
                                                            ref={(input) => {
                                                                this.shareID_Owner = input
                                                            }}
                                                            className="form-control mt-2"
                                                            placeholder='_share_id'
                                                            required/>
                                                    </div>
                                                </div>

                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div className="col-sm-5 col-md-3" style={{" text-align": "left"}}>

                                    <div class="card" style={{"padding": "15px", "margin": "15px"}}>
                                        <form onSubmit={(e) => {
                                            e.preventDefault()
                                            let token_id = this.tokenID.value

                                            this.get_art(token_id)
                                        }}>
                                            <div class="row" style={{"padding": "10px"}}>
                                                <button type='submit' style={{
                                                    "border-radius": "50px",
                                                    "margin-left": "0px",
                                                    "margin-right": "0px",
                                                    "margin-top": "0px",
                                                    "background-color": "#B22222",
                                                    "border": "solid 1px #B22222"
                                                }} className='btn btn-primary mb-2'><i class="fas fa-search"></i>
                                                </button>
                                                <h3 style={{"border-radius": "50px", "margin": "10px"}}>
                                                    <strong> get_art_by_id</strong></h3>
                                            </div>
                                            <div class="row" style={{"padding": "10px"}}>
                                                <div class="col-sm-10 col-md-10">
                                                    <div className='form-group mr-sm-2' style={{"max-width": "80%"}}>
                                                        <input
                                                            id='tokenID'
                                                            type='string'
                                                            ref={(input) => {
                                                                this.tokenID = input
                                                            }}
                                                            className="form-control mt-2"
                                                            placeholder='_token_id'
                                                            required/>
                                                    </div>
                                                </div>


                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div className="col-sm-5 col-md-3" style={{" text-align": "left"}}>

                                    <div class="card" style={{"padding": "15px", "margin": "15px"}}>
                                        <form onSubmit={(e) => {
                                            e.preventDefault()
                                            let from = this.from_transfer.value
                                            let to = this.TO_TRANSFER.value
                                            let shareid = this.shareID.value
                                            this.transfer_from(from, to, shareid)
                                        }}>
                                            <div class="row" style={{"padding": "10px"}}>
                                                <button type='submit' style={{
                                                    "border-radius": "50px",
                                                    "margin-left": "0px",
                                                    "margin-right": "0px",
                                                    "margin-top": "0px",
                                                    "background-color": "#B22222",
                                                    "border": "solid 1px #B22222"
                                                }} className='btn btn-primary mb-2'><i class="fas fa-exchange-alt"></i>
                                                </button>
                                                <h3 style={{"border-radius": "50px", "margin": "10px"}}>
                                                    <strong> transferFrom</strong></h3>
                                            </div>
                                            <div class="row" style={{"padding": "10px"}}>
                                                <div class="col-sm-10 col-md-10">
                                                    <div className='form-group mr-sm-2' style={{"max-width": "80%"}}>
                                                        <input
                                                            id='from_transfer'
                                                            type='string'
                                                            ref={(input) => {
                                                                this.from_transfer = input
                                                            }}
                                                            className="form-control mt-2"
                                                            placeholder='_from'
                                                            required/>
                                                        <input
                                                            id='TO_TRANSFER'
                                                            type='string'
                                                            ref={(input) => {
                                                                this.TO_TRANSFER = input
                                                            }}
                                                            className="form-control mt-2"
                                                            placeholder='_to'
                                                            required/>
                                                        <input
                                                            id='shareID'
                                                            type='unit'
                                                            ref={(input) => {
                                                                this.shareID = input
                                                            }}
                                                            className="form-control form-control-md col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  mt-2"
                                                            placeholder='_share_id'
                                                            required/>
                                                    </div>
                                                </div>


                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div className="col-sm-5 col-md-3" style={{" text-align": "left"}}>

                                    <div class="card" style={{"padding": "15px", "margin": "15px"}}>
                                        <form onSubmit={(e) => {
                                            e.preventDefault()
                                            let from = this.FROM_ENDOW.value
                                            let to = this.TO_ENDOW.value
                                            let shareid = this.shareID_ENDOW.value
                                            let howmuch = this.howMuch.value
                                            this.endow_share(from, to, shareid, howmuch)
                                        }}>
                                            <div class="row" style={{"padding": "10px"}}>
                                                <button type='submit' style={{
                                                    "border-radius": "50px",
                                                    "margin-left": "0px",
                                                    "margin-right": "0px",
                                                    "margin-top": "0px",
                                                    "background-color": "#B22222",
                                                    "border": "solid 1px #B22222"
                                                }} className='btn btn-primary mb-2'><i class="far fa-handshake"></i>
                                                </button>
                                                <h3 style={{"border-radius": "50px", "margin": "10px"}}>
                                                    <strong> endow_share</strong></h3>
                                            </div>
                                            <div class="row" style={{"padding": "10px"}}>
                                                <div class="col-sm-10 col-md-10">
                                                    <div className='form-group mr-sm-2' style={{"max-width": "80%"}}>
                                                        <input
                                                            id='FROM_ENDOW'
                                                            type='string'
                                                            ref={(input) => {
                                                                this.FROM_ENDOW = input
                                                            }}
                                                            className="form-control mt-2"
                                                            placeholder='_from'
                                                            required/>
                                                        <input
                                                            id='TO_ENDOW'
                                                            type='string'
                                                            ref={(input) => {
                                                                this.TO_ENDOW = input
                                                            }}
                                                            className="form-control mt-2"
                                                            placeholder='_to'
                                                            required/>
                                                        <input
                                                            id='shareID_ENDOW'
                                                            type='unit'
                                                            ref={(input) => {
                                                                this.shareID_ENDOW = input
                                                            }}
                                                            className="form-control  mt-2"
                                                            placeholder='_share_id'
                                                            required/>
                                                        <input
                                                            id='howMuch'
                                                            type='unit'
                                                            ref={(input) => {
                                                                this.howMuch = input
                                                            }}
                                                            className="form-control mt-2"
                                                            placeholder='_how_much'
                                                            required/>
                                                    </div>
                                                </div>

                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div className="col-sm-5 col-md-3" style={{" text-align": "left"}}>

                                    <div class="card" style={{"padding": "15px", "margin": "15px"}}>
                                        <form onSubmit={(e) => {
                                            e.preventDefault()
                                            let address_contract = this.ADDRESS_CONTRACT.value
                                            this.withdraw(address_contract)
                                        }}>
                                            <div class="row" style={{"padding": "10px"}}>
                                                <button type='submit' style={{
                                                    "border-radius": "50px",
                                                    "margin-top": "10px",
                                                    "background-color": "#B22222",
                                                    "border": "solid 1px #B22222"
                                                }} className='btn btn-primary mb-2'><i class="fab fa-elementor"></i>
                                                </button>
                                                <h3 style={{"border-radius": "50px", "margin": "10px"}}>
                                                    <strong>Withdraw</strong></h3>
                                            </div>
                                            <div class="row" style={{"padding": "10px"}}>
                                                <div class="col-sm-10 col-md-10">
                                                    <div className='form-group mr-sm-2' style={{"max-width": "80%"}}>
                                                        <input
                                                            id='ADDRESS_CONTRACT'
                                                            type='string'
                                                            ref={(input) => {
                                                                this.ADDRESS_CONTRACT = input
                                                            }}
                                                            className="form-control mt-2"
                                                            placeholder='Address contract'
                                                            required/>
                                                    </div>
                                                </div>


                                            </div>
                                        </form>
                                    </div>
                                </div>


                                <div className="col-sm-5 col-md-3" style={{" text-align": "left"}}>

                                    <div class="card" style={{"padding": "15px", "margin": "15px"}}>
                                        <form onSubmit={(e) => {
                                            e.preventDefault()
                                            let token_id_share = this.TOKEN_ID_SHARE.value
                                            let from_get_share = this.FROM_GET_SHARE.value
                                            this.get_share(from_get_share, token_id_share)
                                        }}>
                                            <div class="row" style={{"padding": "10px"}}>
                                                <button type='submit' style={{
                                                    "border-radius": "50px",
                                                    "margin-top": "10px",
                                                    "background-color": "#B22222",
                                                    "border": "solid 1px #B22222"
                                                }} className='btn btn-primary mb-2'><i class="fab fa-elementor"></i>
                                                </button>
                                                <h3 style={{"border-radius": "50px", "margin": "10px"}}>
                                                    <strong>get_share</strong></h3>
                                            </div>
                                            <div class="row" style={{"padding": "10px"}}>
                                                <div class="col-sm-10 col-md-10">
                                                    <div className='form-group mr-sm-2' style={{"max-width": "80%"}}>
                                                        <input
                                                            id='FROM_GET_SHARE'
                                                            type='string'
                                                            ref={(input) => {
                                                                this.FROM_GET_SHARE = input
                                                            }}
                                                            className="form-control mt-2"
                                                            placeholder='_from'
                                                            required/>
                                                        <input
                                                            id='TOKEN_ID_SHARE'
                                                            type='string'
                                                            ref={(input) => {
                                                                this.TOKEN_ID_SHARE = input
                                                            }}
                                                            className="form-control mt-2"
                                                            placeholder='token_id'
                                                            required/>
                                                    </div>
                                                </div>


                                            </div>
                                        </form>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default App;
