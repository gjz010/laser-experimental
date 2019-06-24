
import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CameraIcon from '@material-ui/icons/PhotoCamera';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {connect, createBundle, gotoBundleEdit} from "../store"
import FunctionsIcon from '@material-ui/icons/Functions';
import CodeIcon from '@material-ui/icons/Code';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"
import Loader from "../loader"
const useStyles = makeStyles(theme => ({
    root: {
        width: '80%',
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(3, 2),
      },
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
    backgroundSize: "contain"
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
}));
function ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
}
export default connect((props)=>{
  const classes = useStyles();
  return (
    <Loader show={!props.store.bundleList.isFetching}>
    <Grid container justify = "center"><Paper className={classes.root}>

    <List subheader={<ListSubheader>函数包列表</ListSubheader>} component="nav" aria-label="Main mailbox folders">
        {
            props.store.bundleList.data.map((x)=>{
                return [
                <ListItem button onClick={()=>props.dispatch(gotoBundleEdit(x.id))}>
                    <ListItemIcon>
                    <FunctionsIcon />
                </ListItemIcon>
                    <ListItemText primary={x.name} />
                    </ListItem>
                    ,
                <Divider variant="inset" component="li" />
                ]
            })
        }

        <ListItem button onClick={()=>{
            const name=window.prompt("请输入函数包名称");
            if(name){
                props.dispatch(createBundle(name));
            }
        }}>
        <ListItemIcon>
        <AddCircleIcon />
      </ListItemIcon>
          <ListItemText primary="新建函数包" />
        </ListItem>
      </List>
  </Paper></Grid>
  </Loader>
  )
})