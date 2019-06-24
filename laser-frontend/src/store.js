// The ultimate absolute store for the application.
// We use Redux for rapid development.
import { combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { createStore, applyMiddleware } from 'redux'
import PropTypes from 'prop-types'
import {connect as rconnect} from 'react-redux'
import aapi from './api';
const loggerMiddleware = createLogger()

const defaultState={
	"currentPanel": "signin",
	"dashboard": {
		"isFetching": false,
		"didInvalidate": false,
    "data": {

    }
  },
  "signin": {
		"isFetching": true,
    "didInvalidate": true,
    "data": {

    }
  },
  "signup": {
		"isFetching": false,
    "didInvalidate": false,
    "data": {

    }
  },
	"userInfo": {
		"isFetching": true,
		"didInvalidate": true,
    "data":{
      "userId": "",
      "userName": ""
    }
	},
	"apiList": {
		"isFetching": false,
		"didInvalidate": false,
		"data":[]
	},
	"apiEdit": {
		"isFetching": false,
		"didInvalidate": false,
		"dirty": false,
    "data":{
        "id": "",
        "name": "",
        "spec": "{}"
    }
	},
	"bundleList": {
		"isFetching": false,
		"didInvalidate": false,
    "data":[]
	},
	"bundleEdit": {
		"isFetching": false,
		"didInvalidate": false,
		"dirty": false,
		"data": {
        "id": "",
        "name": "",
        "object": ""
		}
	}
}
//Reducers.
function createAsyncReducer(name){
  const suffix=name.toUpperCase();
  const initial_state=defaultState[name];
  const reducer=function(state=initial_state, action){
    switch(action.type){
      case "INVALIDATE_"+suffix:
        return Object.assign({}, state, {"didInvalidate": true});
      case "START_"+suffix:
        return Object.assign({}, state, {"didInvalidate":false, "isFetching": true});
      case "FINISH_"+suffix:
        return Object.assign({}, {"data":action.data, "isFetching": false, "didInvalidate": false });
      default:
        return state;
    }
  }
  return reducer;
}
function currentPanel(state=defaultState.currentPanel, action){
  switch(action.type){
    case "SWITCH_PAGE":
      return action.page;
    default:
      return state;
  }
}
const async_reducers=["userInfo", "apiList", "apiEdit", "bundleList", "bundleEdit", "signin", "signup"].reduce(
(obj, x)=>Object.assign(obj, {[x]: createAsyncReducer(x)}), {});

const rootReducer=combineReducers(Object.assign({currentPanel}, async_reducers));
const my_connect=(component)=>{
  //component.propTypes=Object.assign({}, component.propTypes, {"store": PropTypes.object.isRequired});
  return rconnect((state=>{
      return {"store": state}
    }),(
    dispatch=>{
      return {"dispatch": dispatch}
    }
  ))(component);

}
export const store = createStore(
  rootReducer,
  applyMiddleware(
    thunkMiddleware, // lets us dispatch() functions
    loggerMiddleware // neat middleware that logs actions
  )
)

// Also define some actions here. For global use.
export async function pageInit(dispatch){
  const user_info=window.localStorage.getItem('user');
  if(!user_info){
    dispatch({"type": "FINISH_SIGNIN", "data": {}});
  }else{
    const api=await aapi;
    const info=JSON.parse(user_info);
    api.authorizations.bearerAuth=info.token;
    dispatch({"type": "FINISH_USERINFO", "data": info});
    dispatch(gotoDashboard);
  }
}
export function login(username, password){
  return async dispatch=>{
    dispatch({"type": "START_SIGNIN"});
    const api=await aapi;
    try{
      const req=await api.apis.user.login({}, {"requestBody": {"name": username, password}});
      const token=req.body.token;
      api.authorizations.bearerAuth=token;
      const me=await api.apis.user.getMe();
      const info_obj=Object.assign({token}, me.body);
      window.localStorage.setItem('user', JSON.stringify(info_obj));
      dispatch({"type": "FINISH_USERINFO", "data": info_obj});
      dispatch(gotoDashboard);
    }catch(err){
      alert("登录失败！");
      dispatch({"type": "FINISH_SIGNIN", "data": {"error": "登录失败！"}});
    }
  }
}
export function signup(username, password){
  return async dispatch=>{
    dispatch({"type": "START_SIGNIN"});
    dispatch({"type": "SWITCH_PAGE", "page": "signin"});
    const api=await aapi;
    try{
      const req=await api.apis.user.register({}, {"requestBody": {"name": username, password}});
      alert("注册成功！");
      dispatch({"type": "FINISH_SIGNIN", "data": {"error": "注册成功！"}});
    }catch(err){
      alert("注册失败！");
      dispatch({"type": "FINISH_SIGNIN", "data": {"error": "注册失败！"}});
    }
  }
}
export function logout(dispatch){
  delete window.localStorage.user;
  window.location="/";
}
export async function gotoDashboard(dispatch){
  dispatch({"type": "SWITCH_PAGE", "page": "dashboard"});
}
export async function gotoAPIList(dispatch){
  const api=await aapi;
  dispatch({"type": "START_APILIST"});
  dispatch({"type": "SWITCH_PAGE", "page": "apiList"});
  const apis=(await api.apis.api_definition.listAPIs()).body;
  dispatch({"type": "FINISH_APILIST", "data": apis})
}
export function gotoAPIEdit(id){
  return async dispatch=>{
    const api=await aapi;
    dispatch({"type": "START_APIEDIT"});
    dispatch({"type": "SWITCH_PAGE", "page": "apiEdit"});
    const api_info=(await api.apis.api_definition.getAPI({"api_id": id})).body;
    dispatch({"type": "FINISH_APIEDIT", "data": api_info});
  }
}
export function createAPI(name){
  
  return async dispatch=>{
    const api=await aapi;
    dispatch({"type": "START_APILIST"});
    await api.apis.api_definition.createAPI({}, {"requestBody": {name}});
    const apis=(await api.apis.api_definition.listAPIs()).body;
    dispatch({"type": "FINISH_APILIST", "data": apis})
  }
}
export function putAPI(id, body){
  return async dispatch=>{
    const api=await aapi;
    dispatch({"type": "START_APIEDIT"});
    try{
      await api.apis.api_definition.modifyAPI({"api_id": id}, {"requestBody": body});
    }catch(err){
      console.log(err);
      alert("上传失败！");
    }
    const api_info=(await api.apis.api_definition.getAPI({"api_id": id})).body;
    dispatch({"type": "FINISH_APIEDIT", "data": api_info});
  }
}
export async function gotoBundleList(dispatch){
  const api=await aapi;
  dispatch({"type": "START_BUNDLELIST"});
  dispatch({"type": "SWITCH_PAGE", "page": "bundleList"});
  const bundles=(await api.apis.function_bundle.listBundles()).body;
  dispatch({"type": "FINISH_BUNDLELIST", "data": bundles})
}
export function gotoBundleEdit(id){
  return async dispatch=>{
    const api=await aapi;
    dispatch({"type": "START_BUNDLEEDIT"});
    dispatch({"type": "SWITCH_PAGE", "page": "bundleEdit"});
    const bundle_info=(await api.apis.function_bundle.getFunctionBundle({"bundle_id": id})).body;
    dispatch({"type": "FINISH_BUNDLEEDIT", "data": bundle_info});
  }
}
export function createBundle(name){
  
  return async dispatch=>{
    const api=await aapi;
    dispatch({"type": "START_BUNDLELIST"});
    await api.apis.function_bundle.addFunctionBundle({}, {"requestBody": {name}});
    const bundles=(await api.apis.function_bundle.listBundles()).body;
    dispatch({"type": "FINISH_BUNDLELIST", "data": bundles})
  }
}

export function putBundle(id, body){
  return async dispatch=>{
    const api=await aapi;
    dispatch({"type": "START_BUNDLEEDIT"});
    try{
      const upload=await api.apis.function_bundle.uploadFunctionBundle({"bundle_id": id});
      const url=upload.body.upload_url;
      await fetch(url, {"headers": {"Content-Type": "application/octet-stream"}, "body": body, "method": "PUT" } );
      await api.apis.function_bundle.flushFunctionBundleInstances({"bundle_id": id});
    }catch(err){
      console.log(err);
      alert("上传失败！");
    }
    const api_info=(await api.apis.function_bundle.getFunctionBundle({"bundle_id": id})).body;
    dispatch({"type": "FINISH_BUNDLEEDIT", "data": api_info});
  }
}
export const connect=my_connect;
