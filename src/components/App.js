import React, { useEffect } from 'react';
import { Grid, Loader } from 'semantic-ui-react';
import './App.css';
import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';
import { connect } from 'react-redux';

const App = props => {
  const { currentUser } = props;

  //When user first time visit, the new displayName and photoURL have not yet been registered in firebase
  //But listner at index.js would detect change of auth state and push the app page with null value of displayName, and photoURL
  //Below would refresh and get the updated user info when user first time register
  useEffect(() => {
    currentUser.displayName === null && window.location.reload();
  }, [currentUser]);

  return (
    <Grid columns="equal" className="app" style={{ background: '#eee' }}>
      <ColorPanel />
      <SidePanel
        key={props.currentUser && props.currentUser.id}
        user={props.currentUser} />
      <Grid.Column style={{ marginLeft: 320 }}>
        {/*change to condition re-renering !!!!
          currentChannel && currentUser
        */}
        {(props.currentUser && props.currentChannel) ?
          <Messages
            key={props.currentUser && props.currentUser.id}
            currentChannel={props.currentChannel}
            currentUser={props.currentUser}
            isPrivateChannel={props.isPrivateChannel}
          /> : <Loader active>Loading Messages</Loader>}
      </Grid.Column>
      <Grid.Column width={4}>
        <MetaPanel />
      </Grid.Column>
    </Grid>
  );
}

const mapStateToProps = state => {
  return {
    currentUser: state.user.currentUser,
    currentChannel: state.channel.currentChannel,
    isPrivateChannel: state.channel.isPrivateChannel
  }
}

export default connect(mapStateToProps, null)(App);
