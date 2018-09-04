import React, { Component } from 'react';
import './App.css';

import { withStyles } from '@material-ui/core/styles';
import withWidth,{ isWidthUp } from '@material-ui/core/withWidth';
import compose from 'recompose/compose';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import GridList from '@material-ui/core/GridList';
import Button from '@material-ui/core/Button';
import GridListTile from '@material-ui/core/GridListTile';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Icon from '@material-ui/core/Icon';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Hidden from '@material-ui/core/Hidden';

import { container } from "./material-kit-react.jsx";
import LoadingScreen from 'react-loading-screen';
import NumberFormat from 'react-number-format';
import { loadCSS } from 'fg-loadcss/src/loadCSS';
import classNames from 'classnames';
import ImagePalette from 'react-image-palette'
import PropTypes from 'prop-types';




function Transition(props) {
  return <Slide direction="up" {...props} />;
}

const components = {
  sm: 'em',
  md: 'u',
  lg: 'del',
};

const styles = theme => ({
  container: {
    padding: "30px 0",
    ...container
  },
  root: {
    flexGrow: 1,
  },

  paper: {
    height: 140,
    width: 100,
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  control: {
    padding: theme.spacing.unit * 2,
  },
  card: {
    width:"100%",
  },
  media_square: {
    height: 0,
    paddingTop: 'calc(100% - 0px)', // 16:9
    backgroundSize:'cover'
  },
  media_vertical: {
    height: 0,
    paddingTop: 'calc(200% + 16px)', // 16:9
    backgroundSize:'cover'
  },
  media_horizontal: {
    height: 0,
    paddingTop: 'calc(50% - 8px)', // 16:9
    backgroundSize:'cover'
  },
  actions: {
    display: 'flex',
  },
  gridList: {
    //flexWrap: 'nowrap',
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: 'translateZ(0)',
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    marginLeft: 'auto',
    [theme.breakpoints.up('sm')]: {
      marginRight: -8,
    },
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  logo: {
    width:"32px",
    height:"auto"
  }

});


class App extends Component {
  constructor (props) {
    super(props);
    console.log(window.location);
    this.state = {  
      account: window.location.search!=="" ?  window.location.search.replace("?id=","") :"instagram",
      url: window.location.search!=="" ?  "https://www.instagram.com/" +window.location.search.replace("?id=","") : "https://www.instagram.com/instagram/",
      theme: {
        color: '#222',
        backgroundColor: '#fff',
        alternativeColor:'#aaa'
      },
      themeSet: false,
      showMedia:true,
      loading:true,
      showMessage:false,
      profile: {
        biography: "",
        full_name: "",
        external_url: "",
        profile_pic_url: "",
        no_followers: 0,
        no_posts: 0,
        posts:[]
      }
    };

  }

  handleMessageOpen = () => {
    this.setState({ showMessage: true });
  };

  handleMessageClose = () => {
    this.setState({ showMessage: false });
  };

  handleExpandClick = () => {
    this.setState(state => ({ expanded: !state.expanded }));
  };



  componentDidMount = () => {
    loadCSS(
      'https://use.fontawesome.com/releases/v5.1.0/css/all.css',
      document.querySelector('#insertion-point-jss'),
    );
    this._grabData();
  };

  _loadPage= () => {
    this.setState({themeSet:false, loading:true, profile:{posts:[]}});
    this._grabData();
  }

  _grabData = () => {
    const { url } = this.state;
    fetch(url)
      .then(response => response.text())
      .then(responseText => {
        this._fetchData(responseText);
      })
      .catch(error => {
        this.setState({
          messageText:"It seems that profile you requested " + this.state.account + " doesn't exist !",
          account:"instagram",
          url: "https://www.instagram.com/instagram/"
        })
        this._grabData();
        this.handleMessageOpen();
        this.setState({ response: null });
      });
  }

  _fetchData = textData => {
    var dataStream = /<script type=\"text\/javascript\">window\._sharedData = (.*);<\/script>/g    
    let thumbnailMatch = dataStream.exec(textData);
    let profilePage = JSON.parse(thumbnailMatch[1]).entry_data.ProfilePage[0].graphql.user;
    if (profilePage.is_private) {
      this.setState({
        messageText:"This page is private! Use public pages only!",
        account:"instagram",
        url: "https://www.instagram.com/instagram/"
      })
      this._grabData();
      this.handleMessageOpen();
    }
    let profileDisplay =
    {
      biography: profilePage.biography,
      full_name: profilePage.full_name,
      external_url: profilePage.external_url,
      profile_pic_url: profilePage.profile_pic_url_hd,
      no_followers: profilePage.edge_followed_by.count,
      no_follow: profilePage.edge_follow.count,
      no_posts: profilePage.edge_owner_to_timeline_media.count,
      is_business_account: profilePage.is_business_account,
      is_verified: profilePage.is_verified,
      posts:[],
      profile_id: profilePage.username,
    };
    
    this.setState({
      profile: profileDisplay
    })
    var sum = 0;
    for (var i= 0; i< profilePage.edge_owner_to_timeline_media.edges.length; i++){
      try {
        var post=profilePage.edge_owner_to_timeline_media.edges[i].node;
        var preview ={
          display_url: post.display_url,
          caption: post.edge_media_to_caption.edges.length>0 ? post.edge_media_to_caption.edges[0].node.text : "",
          likes: post.edge_liked_by.count,
          cols: i % 5 === 0? 2 : 1
        }
        sum +=post.edge_liked_by.count;
        profileDisplay.posts.push(preview);
      }
      
      catch (err) {
        console.log('err', err);
      }
    }

    
    this.setState({
      profile: profileDisplay,
      avgLikes: sum / profilePage.edge_owner_to_timeline_media.edges.length,
      noPosts: profilePage.edge_owner_to_timeline_media.edges.length,
      loading:false

    })
    
 
};

  render() {
    const { classes } = this.props;
    const { width } = this.props;
    const Component = components[width] || 'span';
    return (
      <LoadingScreen
      loading={this.state.loading}
      bgColor="#f1f1f1"
      spinnerColor="#9ee5f8"
      textColor="#676767"
      logoSrc="./snap.png"
      text="Wait for the magic happens"
      > 
      <div className={classes.root} style={{backgroundColor:this.state.theme.alternativeColor}}>
        {this.state.theme && this.state.profile &&  <AppBar position="static" style={{backgroundColor: this.state.theme.backgroundColor }}>
          <Toolbar>
          <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
          <Icon className={classNames(classes.icon, 'fas fa-th-large')} style={{fontSize:'inherit',color: this.state.theme.color}} />
          </IconButton>
          <Typography variant="title" style={{color:this.state.theme.color, flexGrow:1}}>
           {isWidthUp('sm', this.props.width) && <span>{this.state.profile.full_name + " - @" + this.state.profile.profile_id}</span> }
            </Typography>
            
            <Hidden smDown> 
            <FormControlLabel
                  control={
                  <Switch
                    checked={this.state.showMedia}
                    onChange={(event)=> {this.setState({showMedia:event.target.checked})}}
                    value="checkedA"/>}
                  label="Show Media"/>
             </Hidden>
            <Hidden smDown> 
              <div>
                
                <Typography variant="body1" style={{color:this.state.theme.color}}>Identified Theme:</Typography>
                  <div  style={{borderColor:this.state.theme.color, borderStyle:'solid', borderWidth:'1',backgroundColor:this.state.theme.backgroundColor,display:'inline-block', height:"24px", width:"24px", marginRight:"5px"}}> </div>
                  <div  style={{borderColor:this.state.theme.backgroundColor, borderStyle:'solid', borderWidth:'1',backgroundColor:this.state.theme.color,display:'inline-block', height:"24px", width:"24px", marginRight:"5px"}}> </div>
                  <div  style={{borderColor:this.state.theme.color, borderStyle:'solid', borderWidth:'1',backgroundColor:this.state.theme.alternativeColor,display:'inline-block', height:"24px", width:"24px", marginRight:"5px"}}> </div>
              </div>
            </Hidden>
            <TextField
              placeholder="Search"
              value={this.state.account}
              onChange={(e) => this.setState({ account:e.target.value, url: 'https://www.instagram.com/' + e.target.value +'/'})}
              margin="normal"
              style={{borderColor: this.state.theme.color}}
              InputProps={{
                style: {color:this.state.theme.color, borderColor: this.state.theme.color}
              }}/>
            <Button variant="fab" 
              mini 
              aria-label="Go Magic!" 
              style={{backgroundColor:this.state.theme.color, color:this.state.theme.backgroundColor}}
              onClick={()=>{this._loadPage()}}>
                <Icon className={classNames(classes.icon, 'fas fa-magic')} style={{fontSize:'inherit', }} />
            </Button>
          </Toolbar>
        </AppBar>}
    
      <div className={classes.container}>
        
       {!isWidthUp('sm', this.props.width) && <Typography variant="headline" style={{color:this.state.theme.backgroundColor, marginBottom:"10px", fontStyle:"italic"}}>{this.state.profile.full_name + " - @" + this.state.profile.profile_id}</Typography>}
    
        <Typography variant={isWidthUp('sm', this.props.width) ? "display1":"title"} style={{color:this.state.theme.backgroundColor, marginBottom:"24px"}}>
          Profile
        </Typography>
        {this.state.profile && this.state.profile.posts.length>0 && 
        <Grid container className={classes.root} spacing={16}>
        {/* Latest POST */}
        <Grid item xs={6} md={6} sm={6}>
          <Card className={classes.card}>
            <CardMedia
              className={classes.media_square}
              image={this.state.profile.posts ? this.state.profile.posts[0].display_url: ''}
              title="Latest Post">
              <div style={{marginTop:"-100%",color:this.state.theme.color, padding:isWidthUp('sm', this.props.width) ? "30px":"10px", backgroundColor:this.state.theme.backgroundColor, opacity:'0.5'}}>
                <Typography noWrap variant="subheading" style={{color:this.state.theme.color}}>
                  {this.state.profile.posts[0].caption}
                </Typography>
                <Typography variant="body2" style={{color:this.state.theme.color}}><NumberFormat value={this.state.profile.posts[0].likes} displayType={'text'} thousandSeparator={true} />
                  <Icon className={classNames(classes.icon, 'fas fa-heart')} style={{fontSize:'inherit'}} />
                </Typography>
              </div>
            </CardMedia>
          </Card> 
        </Grid>
        {/* xs: 0
        sm: 600
        md: 960
        lg: 1280
        xl: 1920 */}

        {/* ABOUT PROFILE */}
        
        <Grid item xs={6}  sm={6} md={3} lg={3}>
          <Card className={classes.card}>
            <div
              className={isWidthUp('md', this.props.width) ? classes.media_vertical: classes.media_square}
              style={{backgroundColor: this.state.theme.backgroundColor, color:this.state.theme.color}}>
              
              <Typography variant={isWidthUp('sm', this.props.width) ? "display1":"body2"} style={{marginTop:isWidthUp('md', this.props.width) ? "-200%": "-100%","padding": isWidthUp('sm', this.props.width) ? "20px":"5px 20px", color:this.state.theme.color}}>
                About
              </Typography>
              
              <Typography variant={isWidthUp('sm', this.props.width) ? "title":"body1"} style={{"padding":isWidthUp('sm', this.props.width) ? "20px":"5px 20px", color:this.state.theme.alternativeColor}}>
                {this.state.profile.biography? this.state.profile.biography: "N/A"}
              </Typography>
            </div>
          </Card> 
        </Grid>
        
        <Grid item xs={12} sm={12} md={3} lg={3} >
         <Grid container spacing={8} direction="row">
          <Grid item xs={6} sm={6} md={12} lg={12}>
          {/* LOGO PROFILE */}
          <Card className={classes.card}>
            <CardMedia
              className={classes.media_square}
              image={this.state.profile.profile_pic_url}
              title="Profile Pic"
            />
          </Card> 
          </Grid>
          <Grid item xs={6} sm={6} md={12} lg={12}>
          {/* NUMBER OF FOLLOWERS */}
          <Card className={classes.card} >
            <div
              className={classes.media_square}
              style={{backgroundColor: this.state.theme.color, color:this.state.theme.backgroundColor}}>
              <Typography variant={ isWidthUp('sm', this.props.width) ? "headline": "title"} style={{marginTop:"-100%","padding":isWidthUp('sm', this.props.width) ? "20px": "25px 20px", textAlign: "center", color:this.state.theme.backgroundColor}}> 
              <Icon className={classNames(classes.icon, 'fas fa-users')} style={{fontSize:'inherit', width: "35px"}} />
                Followed By
              </Typography>
              <Typography variant={isWidthUp('sm', this.props.width) ? "display1": "title"} style={{"padding":"20px",fontWeight:"900", color:this.state.theme.backgroundColor, textAlign:'center'}}>
                <NumberFormat value={this.state.profile.no_followers} displayType={'text'} thousandSeparator={true} /> 
              </Typography>
            </div>
          </Card>
          </Grid>
          </Grid> 
      </Grid>

      <Grid item xs={12} sm={12} md={9} lg={9}>
        <Grid container spacing={16}>
          {/* FIND OUT MORE */}
          <Grid item xs={4} md={4} sm={4}>
            <Card className={classes.card}>
              <div className={classes.media_square}
                style={{backgroundColor: this.state.theme.color, color:this.state.theme.backgroundColor, alignItems:'center', justifyContent:'center', alignContent:'center', textAlign:'center'}}>
                {isWidthUp('sm', this.props.width)  &&<Typography variant= "title" style={{marginTop:"-100%","padding":"20px", color:this.state.theme.backgroundColor}}>
                  Find Out More
                </Typography>}
              
               {this.state.profile.external_url!=="" && isWidthUp('sm', this.props.width) ? <Button variant="extendedFab" size="small"
                  href={this.state.profile.external_url}
                  target="_blank"
                  aria-label="Link"
                  style={{backgroundColor:this.state.theme.alternativeColor, color:this.state.theme.backgroundColor, marginTop: isWidthUp('sm', this.props.width) ? "0": "-100%"}}
                  className={classes.button}>
                    <Icon className={classNames(classes.icon, 'fa fa-link')} style={{fontSize:'inherit', marginRight:'16px'}} />
                    External Link
                </Button>:"N/A"}
                { !isWidthUp('sm', this.props.width) && <Button  target="_blank" href={this.state.profile.external_url} style={{marginTop:"calc(-100% - 16px)", marginLeft:"-32px", color:this.state.theme.backgroundColor}} className={classes.button}>
                Link
              </Button>}
              </div>
            </Card> 
        </Grid>

        {/* AVERAGE NUMBER OF LIKES */}
        <Grid item xs={8} md={8} sm={8}>
          <Card className={classes.card}>
            <div className={classes.media_horizontal}
              style={{backgroundColor: this.state.theme.backgroundColor, color:this.state.theme.backgroundColor, alignItems:'center', justifyContent:'center', alignContent:'center', textAlign:'center'}}>
              <Typography variant={isWidthUp('sm', this.props.width) ? "title": "body2"} style={{marginTop:"-50%","padding":isWidthUp('sm', this.props.width) ? "20px" : "10px 20px", color:this.state.theme.alternativeColor}}>
                Number of average likes for the latest posts
              </Typography>
              
              <Typography variant={isWidthUp('sm', this.props.width) ? "display1": "title"} style={{"padding":isWidthUp('sm', this.props.width) ? "20px" : "10px 20px", color:this.state.theme.color}}>
                <NumberFormat value={this.state.avgLikes} decimalScale={0} displayType={'text'} thousandSeparator={true} decimalSeparator="" />
                <Icon className={classNames(classes.icon, 'fas fa-heart')} style={{fontSize:'inherit'}} />
              </Typography>
            </div>
          </Card> 
        </Grid>

        {/* MORE INFO */}
        <Grid item xs={8} md={8} sm={8}>
          <Card className={classes.card}>
            <div className={classes.media_horizontal}
              style={{backgroundColor: this.state.theme.backgroundColor, color:this.state.theme.backgroundColor, alignItems:'center', justifyContent:'center', alignContent:'center', textAlign:'center'}}>
              <Typography variant={isWidthUp('sm', this.props.width) ? "headline": "body2"} style={{marginTop:"-50%","padding":isWidthUp('sm', this.props.width) ? "20px" : "10px 20px", color:this.state.theme.alternativeColor}}>
                How this account stands out
              </Typography>
              
              <Typography variant={isWidthUp('sm', this.props.width) ? "title": "body1"} style={{ color:this.state.theme.color}}>
                Follows <NumberFormat value={this.state.profile.no_follow} decimalScale={0} displayType={'text'} thousandSeparator={true} decimalSeparator="" /> accounts
              </Typography>
              <Typography variant={isWidthUp('sm', this.props.width) ? "title": "body1"} style={{ color:this.state.theme.color}}>
                Is {this.state.profile.is_verified ? "": "NOT"} a verified account
              </Typography>
              <Typography variant={isWidthUp('sm', this.props.width) ? "title": "body1"} style={{ color:this.state.theme.color}}>
                Is {this.state.profile.is_business_account ? "": "NOT"} a business account
              </Typography>
            </div>
          </Card> 
        </Grid>
        {/* FOLLOW ACCOUNT */}
        <Grid item xs={4} md={4} sm={4}>
          <Card className={classes.card}>
            <div className={classes.media_square}
              style={{backgroundColor: this.state.theme.color, color:this.state.theme.backgroundColor, alignItems:'center', justifyContent:'center', alignContent:'center', textAlign:'center'}}>
              {isWidthUp('sm', this.props.width)  && <Typography variant="title" style={{marginTop:"-100%","padding":"20px", color:this.state.theme.backgroundColor}}>
                Follow This Account
              </Typography>}
              
              {isWidthUp('sm', this.props.width)  && <Button variant="extendedFab"
                href={this.state.url}
                target="_blank"
                aria-label="Link"
                style={{backgroundColor:this.state.theme.alternativeColor, color:this.state.theme.backgroundColor}}
                className={classes.button}>
                <Icon className={classNames(classes.icon, 'fa fa-link')} style={{fontSize:'inherit', marginRight:'16px'}} />
                Follow
              </Button>}
              { !isWidthUp('sm', this.props.width) && <Button   href={this.state.url}
              target="_blank" style={{marginTop:"calc(-100% - 16px)", color:this.state.theme.backgroundColor}} className={classes.button}>
              Follow
            </Button>}
            </div>
          </Card> 
        </Grid>
      </Grid>
    </Grid> 
    {/* PREVIOUS POST */}
    <Grid item xs={12} sm={12} md={3} lg={3} >
      <Card className={classes.card}>
        <CardMedia
            className={isWidthUp('md', this.props.width) ? classes.media_vertical: classes.media_horizontal}
            image={this.state.profile.posts ? this.state.profile.posts[1].display_url: ''}
            title="Latest Post">
          <div style={{marginTop:isWidthUp('md', this.props.width) ?"calc(-200% - 16px)": "calc(-50% - 16px)",color:this.state.theme.color, padding:'30px', backgroundColor:this.state.theme.backgroundColor, opacity:'0.5'}}>
            <Typography noWrap variant="subheading" style={{color:this.state.theme.color}}>
              {this.state.profile.posts[1].caption}
            </Typography>
            <Typography variant="body2" style={{color:this.state.theme.color}}>
              <NumberFormat value={this.state.profile.posts[1].likes} displayType={'text'} thousandSeparator={true} /> <Icon className={classNames(classes.icon, 'fas fa-heart')} style={{fontSize:'inherit'}} />
            </Typography>
          </div>
        </CardMedia>
      </Card> 
       
   {this.state.showMedia &&    <Typography variant={isWidthUp('sm', this.props.width) ? "display1":"title"} style={{color:this.state.theme.backgroundColor, margin:"24px 0"}}>
   Latest Media
 </Typography>}
    </Grid>
  
 
    {/* POST GRID */}
    {this.state.showMedia &&  <Grid item xs={12} md={12} sm={12} >
      <GridList cellHeight={300} spacing={16} className={classes.gridList} cols={3}>
         {this.state.profile.posts.map(tile => (
        <GridListTile key={tile.display_url} cols={tile.cols || 1}>>
            <img src={tile.display_url} alt={tile.caption} />
          <GridListTileBar
            title={tile.caption}
            classes={{
              root: classes.titleBar,
              title: classes.title,
            }}
          actionIcon={
            <IconButton>
              <Icon className={classNames(classes.icon, 'fas fa-heart')} style={{fontSize:'inherit'}} />
            </IconButton>
           }
          />
        </GridListTile>
          ))}
        </GridList>
      </Grid>}

    
    
   {this.state.profile.profile_pic_url!=="" && <ImagePalette image={this.state.profile.profile_pic_url} crossOrigin={true}>
    {({ backgroundColor, color, alternativeColor }) => {
      if (!this.state.themeSet) {
        this.setState({theme : {
          alternativeColor:alternativeColor,
          color: color,
          backgroundColor:backgroundColor
        },
        themeSet: true})
      }
    return (<div></div>)
  }}
  </ImagePalette>}
  
    </Grid>}
    </div>
    </div>
  <Dialog
    open={this.state.showMessage}
    TransitionComponent={Transition}
    keepMounted
    onClose={this.handleMessageClose}
    aria-labelledby="alert-dialog-slide-title"
    aria-describedby="alert-dialog-slide-description"
  >
    <DialogTitle id="alert-dialog-slide-title">
      Ups!
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-slide-description">
        {this.state.messageText}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
   
      <Button onClick={this.handleMessageClose} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog> 
    </LoadingScreen>
    
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default compose( withStyles(styles), withWidth())(App);
