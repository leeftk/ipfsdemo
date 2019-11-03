import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";
import "./App.css";
import ipfs from "./ipfs.js";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
//import TestimonialsPage from "./TestimonialPage.js";

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    ipfsHash: null,
    buffer: null
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  //helper function
  convertToBuffer = async reader => {
    const buffer = await ipfs.Buffer.from(reader.result);
    this.setState({ buffer });
  };

  //converts file submitted to a buffer
  captureFile = event => {
    event.stopPropagation();
    event.preventDefault();
    const file = event.target.files[0];
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => this.convertToBuffer(reader);
  };

  //submits buffer to ipfs node
  ipfsSubmit = async event => {
    event.preventDefault();

    const accounts = this.state.accounts;
    const buffer = this.state.buffer;

    console.log("Sending from Metamask account: " + accounts[0]);

    // add buffer to ipfs
    await ipfs.add(this.state.buffer, (err, ipfsHash) => {
      //update state of ipfshash in front end
      this.setState({ ipfsHash: ipfsHash[0].hash });

      console.log("ipfs hash:", this.state.ipfsHash);
      console.log("buffer:", this.state.buffer);
    });
  };

  render() {
    if (!this.state.web3) {
      //console.log(this.state.buffer)
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <p>
          If your contracts compiled and migrated successfully, below will show
          a stored value of 5 (by default).
        </p>
        <p>
          Try changing the value stored on <strong>line 40</strong> of App.js.
        </p>
        <div>The stored value is: {this.state.storageValue}</div>
        <br />
        <h2>IPFS Example</h2>
        <p>
          {/*run ipfs daemon in a seperate terminal window*/}
          Run an IPFS daemon in another window. Upload a file to IPFS. If you
          see the IPFS hash in the console then the file was upload
          successfully!
        </p>
        <form onSubmit={this.ipfsSubmit}>
          <div className="input-group buttonadj">
            >
            <Container className="container">
              <div className="custom-file" onChange={this.captureFile}>
                <input
                  type="file"
                  className="custom-file-input buttonadj"
                  id="inputGroupFile01"
                  aria-describedby="inputGroupFileAddon01"
                />
                <label className="custom-file-label" htmlFor="inputGroupFile01">
                  Choose file
                </label>
              </div>
            </Container>
          </div>

          <Button type="submit" variant="light">
            Submit
          </Button>
          <div className="custom-file"></div>
        </form>
        <a href={"https://gateway.ipfs.io/ipfs/" + this.state.ipfsHash}>
          Click to see on IPFS.{" "}
        </a>
      </div>
    );
  }
}

export default App;
