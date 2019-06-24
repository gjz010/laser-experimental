import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import LayersIcon from '@material-ui/icons/Layers';
import CodeIcon from '@material-ui/icons/Code';
import FunctionsIcon from '@material-ui/icons/Functions';
import AssignmentIcon from '@material-ui/icons/Assignment';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import {gotoAPIList, gotoBundleList} from "../store";
function changePage(dispatch, page){
  dispatch({"type": "SWITCH_PAGE", "page": page})
}

export const mainListItems = (props)=>(
  <div>
  <ListSubheader inset >服务管理</ListSubheader>
    <ListItem button onClick={()=>{changePage(props.dispatch, "dashboard")}}>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="控制台" />
    </ListItem>
    <ListItem button onClick={()=>{props.dispatch(gotoAPIList)}}>
      <ListItemIcon>
        <CodeIcon />
      </ListItemIcon>
      <ListItemText primary="API管理" />
    </ListItem>
    <ListItem button onClick={()=>{props.dispatch(gotoBundleList)}}>
      <ListItemIcon>
        <FunctionsIcon />
      </ListItemIcon>
      <ListItemText primary="函数管理" />
    </ListItem>
  </div>
);

export const secondaryListItems = (props)=>(
  <div>
    <ListSubheader inset >账号管理</ListSubheader>
    <ListItem>
        <ListItemAvatar>
          <Avatar>
            <PeopleIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={props.store.userInfo.data.name} secondary="当前身份" />
      </ListItem>
    <ListItem button onClick={()=>{changePage(props.dispatch, "userInfo")}}>
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="账号信息" />
    </ListItem>
    <ListItem button onClick={()=>{
      delete window.localStorage.user;
      window.location="/";
    }}>
      <ListItemIcon>
        <ExitToAppIcon />
      </ListItemIcon>
      <ListItemText primary="退出" />
    </ListItem>
  </div>
);