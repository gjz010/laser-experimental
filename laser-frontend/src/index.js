import React, { Component } from 'react';
import { render } from 'react-dom';
import './style.css';
import Dashboard from './dashboard/Dashboard';
import Api from "./api"
import { Provider } from 'react-redux'
import {store} from "./store"
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import {connect, pageInit} from "./store";
class App extends Component {
  constructor() {
    super();
    Api.then(console.log);
    this.state = {
      name: 'React'
    };
  }
  componentDidMount() {
    this.props.dispatch(pageInit);
  }
  render() {
    return (
      <div>{
        (()=>{
            switch(this.props.store.currentPanel){
              case "signin":
                return <SignIn/>
              case "signup":
                return <SignUp/>
              default:
                return <Dashboard/>
            }
          })()
      }
      </div>
    );
  }
}
const AppConnected=connect(App);
render(<Provider store={store}><AppConnected /></Provider>, document.getElementById('root'));
