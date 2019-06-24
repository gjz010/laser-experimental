
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
import {connect, putBundle} from "../store"
import SwaggerUI from "swagger-ui-react"
import Paper from '@material-ui/core/Paper';
import "swagger-ui-react/swagger-ui.css"
import Loader from "../loader"
import aapi from "../api"
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
  button: {
    margin: theme.spacing(1),
  },
  input: {
    display: 'none',
  },
}));

export default connect((props)=>{
  const classes = useStyles();
  return (
    <Loader show={!props.store.bundleEdit.isFetching}>
      <Grid container justify = "center">
        <Paper className={classes.root}>
      <h1>函数库</h1>
      <p>{props.store.bundleEdit.data.name}</p>
      <p>{props.store.bundleEdit.data.id}</p>
      <input
        accept="application/tar+gzip"
        className={classes.input}
        id="contained-button-file"
        type="file"
        onChange={async (ev)=>{
          const files=ev.target.files;
          const file=files[0];
          if(!file) return ;
          props.dispatch(putBundle(props.store.bundleEdit.data.id, file))
        }}
      />
      <label htmlFor="contained-button-file">
        <Button variant="contained" component="span" className={classes.button}>
          上传
        </Button>
      </label>
      <Button variant="contained" component="span" className={classes.button} onClick={async ()=>{
        const api=await aapi;
        const ret=await api.apis.function_bundle.downloadFunctionBundle({"bundle_id": props.store.bundleEdit.data.id});
        const url=ret.body.download_url;
        var pom = document.createElement('a');
        pom.setAttribute('href', url);
        pom.setAttribute('target', "_blank");
        pom.setAttribute('download', `laser-${props.store.bundleEdit.data.name}.tar.gz`);
        pom.click();
      }}>
          下载
      </Button>
  </Paper>
  </Grid>
  </Loader>)
})
