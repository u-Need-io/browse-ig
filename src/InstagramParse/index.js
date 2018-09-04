/**
 * Instagram Embed component for React Native
 * https://github.com/GaborWnuk
 * @flow
 */

import React, { PureComponent } from 'react';
import { View, Image, Text } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import styles, { colors } from './index.style';
import SliderEntry from './SliderEntry';
import SliderStyles from './SliderEntry.style';
import { sliderWidth, itemWidth, infoPanel } from './SliderEntry.style';


export default class InstagramEmbed extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      response: null,
      height: 240,
      width: 320,
      avatar: null,
      likes: 0,
      views: 0,
      comments: 0,
      thumbnail: null,
    };
  }

  _onLayout = layout => {
    this.setState({
      height: layout.nativeEvent.layout.height,
      width: layout.nativeEvent.layout.width,
    });
  };
  
  /*
   * This is fairly experimental and probably not the best way to supplement
   * existing API (official) data with missing properties we need.
   */
  _fetchData = textData => {

        var dataStream = /<script type=\"text\/javascript\">window\._sharedData = (.*);<\/script>/g
        
        let thumbnailMatch = dataStream.exec(textData);
        let profilePage = JSON.parse(thumbnailMatch[1]).entry_data.ProfilePage[0].graphql.user;
        console.log('something',profilePage);
        let profileDisplay =
        {
          biography: profilePage.biography,
          full_name: profilePage.full_name,
          external_url: profilePage.external_url,
          profile_pic_url: profilePage.profile_pic_url_hd,
          no_followers: profilePage.edge_followed_by.count,
          no_posts: profilePage.edge_owner_to_timeline_media.count,
          posts:[]
        };
        console.log('1',profileDisplay);
        for (var i= 0; i< profilePage.edge_owner_to_timeline_media.edges.length; i++){
          var post=profilePage.edge_owner_to_timeline_media.edges[i].node;
          var preview ={
            display_url: post.display_url,
            caption: post.edge_media_to_caption.edges[0].node.text,
            likes: post.edge_liked_by.count
          }
          profileDisplay.posts.push(preview);
        }
        console.log('2',profileDisplay);
        this.setState({
          profile: profileDisplay
        })
        
        
     
  };

  componentDidMount = () => {
    const { url } = this.props;
    fetch(url)
      .then(response => response.text())
      .then(responseText => {
        this._fetchData(responseText);
        this.setState({ response: responseText });
      })
      .catch(error => {
        this.setState({ response: null });
      });
  };

  _renderItem ({item, index}) {
    return <SliderEntry data={item}  />;
  }

  _renderItemWithParallax ({item, index}, parallaxProps) {
    return (
        <SliderEntry
          data={item}
          parallax={true}
          parallaxProps={parallaxProps}
        />
    );
}

  render(): JSX.JSXElement {
    const { style } = this.props;
    const {
      response,
      height,
      width,
      avatar,
      likes,
      comments,
      thumbnail,
      views,
    } = this.state;

    if (!response) {
      return <View style={style} ><Text>Something not parsed</Text></View>;
    }

    return (
        <View style={{backgroundColor:'#020202'}}>
           <Carousel
                  ref={c => this._slider1Ref = c}
                  data={this.state.profile.posts}
                  renderItem={this._renderItemWithParallax}
                  sliderWidth={sliderWidth}
                  itemWidth={itemWidth}
                  layout={"stack"}
                  hasParallaxImages={true}
                  parallax={true}
                  inactiveSlideScale={0.94}
                  inactiveSlideOpacity={0.7}
                  containerCustomStyle={styles.slider}
                  contentContainerCustomStyle={styles.sliderContentContainer}
                  loop={true}
                  enableSnap={true}
                  autoplay={true}
                  autoplayDelay={1000}
                  autoplayInterval={3000}
                />
             <View style ={SliderStyles.infoPanel}>
                <Image style={SliderStyles.infoLogo} source={{uri: this.state.profile.profile_pic_url}}/>
                <Text style={SliderStyles.infoName}>{this.state.profile.full_name}</Text>
              </View>   
        </View>
    );
  }
}