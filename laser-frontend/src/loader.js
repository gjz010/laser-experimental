import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
const useStyles = makeStyles(theme => ({
  progress: {
    margin: theme.spacing(2),
  },
}));

export default function Loader(props) {
  const classes = useStyles();
  if(!props.show){
  return (
    <Grid container justify = "center">
      <CircularProgress className={classes.progress} />
    </Grid>
  );
  }else{
      return props.children;
  }
}