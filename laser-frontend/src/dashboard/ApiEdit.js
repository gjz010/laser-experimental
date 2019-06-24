
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
import {connect, putAPI} from "../store"
import SwaggerUI from "swagger-ui-react"
import Paper from '@material-ui/core/Paper';
import "swagger-ui-react/swagger-ui.css"
import Loader from "../loader"
import MonacoEditor from 'react-monaco-editor';
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
  const code = props.store.apiEdit.data.spec;
  const options = {
    selectOnLineNumbers: true
  };
  const editor=React.createRef();
  return (
    <Loader show={!props.store.apiEdit.isFetching}>
      <Grid container justify = "center">
        <Paper className={classes.root}>
      <h1>API</h1>
      <p>{props.store.apiEdit.data.name}</p>
      <p>
      <a href={`https://${props.store.apiEdit.data.id}.app.laser.gjz010.com/`}>https://{props.store.apiEdit.data.id}.app.laser.gjz010.com/</a>
      </p>
      <input
        accept="application/json"
        className={classes.input}
        id="contained-button-file"
        type="file"
        onChange={async (ev)=>{
          const files=ev.target.files;
          const file=files[0];
          if(!file) return ;
          const text=await (new Promise((resolve)=>{
            const reader=new FileReader();
            reader.onload=(e)=>{
              resolve(e.target.result);
            }
            reader.readAsText(file);
          }));

          props.dispatch(putAPI(props.store.apiEdit.data.id, {"spec": text}))
        }}
      />
      <label htmlFor="contained-button-file">
        <Button variant="contained" component="span" className={classes.button}>
          上传
        </Button>
      </label>
      <Button variant="contained" component="span" className={classes.button} onClick={()=>{
        function download(content, fileName, contentType) {
          var a = document.createElement("a");
          var file = new Blob([content], {type: contentType});
          a.href = URL.createObjectURL(file);
          a.download = fileName;
          a.click();
        }
        download(props.store.apiEdit.data.spec, "api-"+props.store.apiEdit.data.name+".json", "text/plain");
      }}>
          下载
      </Button>
      <Button variant="contained" component="span" className={classes.button} onClick={()=>{
          const text=(editor.current.__current_value)
          props.dispatch(putAPI(props.store.apiEdit.data.id, {"spec": text}))
      }}>
          保存
        </Button>
      <MonacoEditor
        width="100%"
        height="600"
        language="json"
        theme="vs-dark"
        ref={editor}
        value={code}
        options={options}
      />
      <h1>Swagger UI</h1>
  <Container className={classes.cardGrid}>
    <SwaggerUI displayOperationId={true} showExtensions={true} spec={JSON.parse(props.store.apiEdit.data.spec)} />
  </Container>
  </Paper>
  </Grid>
  </Loader>)
})
