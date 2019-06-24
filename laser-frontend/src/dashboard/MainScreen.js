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
import {connect} from "../store"
import {gotoAPIList, gotoBundleList} from "../store";
const useStyles = makeStyles(theme => ({
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
const cards=[
  {
    "image": "https://symbols.getvecta.com/stencil_9/36_lambda-function.b6da32aafd.svg",
    "title": "编写函数",
    "desc": "编写你的无服务器函数，并且把它们上传到Laser Platform以实现自动部署。",
    "goto": gotoBundleList
  },
  {
    "image": "https://www.openapis.org/wp-content/uploads/sites/3/2018/02/OpenAPI_Logo_Pantone-1.png",
    "title": "编写API",
    "desc": "导入OpenAPI Specification，并且将每一个操作与一个函数相关联。",
    "goto": gotoAPIList
  },/*
  {
    "image": "https://image.flaticon.com/icons/png/512/70/70367.png",
    "title": "函数管理",
    "desc": "管理你的函数和你的API。",
    "goto": "dashboard"
  }*/];
export default connect((props)=>{
  const classes = useStyles();
  return (<Container className={classes.cardGrid}>
    {/* End hero unit */}
    <Grid container spacing={4}>
      {cards.map((card,idx) => (
        <Grid item key={idx} xs={12} sm={12} md={6}>
          <Card className={classes.card}>
          
            <CardMedia
              className={classes.cardMedia}
              image={card.image}
              title={card.title}
            />
            <CardHeader 
              title={card.title}
              titleTypographyProps={{ align: 'center' }}
              subheaderTypographyProps={{ align: 'center' }}/>
            <CardContent className={classes.cardContent}>
              <Typography>
                {card.desc}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary" onClick={()=>{props.dispatch(card.goto)}}>
                现在前往...
              </Button>

            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
    
  </Container>)
})