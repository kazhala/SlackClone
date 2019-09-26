import React, { useState, useEffect } from 'react';
import firebase from '../../../firebase';
import { connect } from 'react-redux';
import * as actionCreators from '../../../actions/index';
import { Menu, Icon } from 'semantic-ui-react';
import { useList } from 'react-firebase-hooks/database';

/*
    TODO: listen to redux state current channel, and deactivate channel
*/

const usersRef = firebase.database().ref('users');

const Starred = props => {
    const { setChannel, setPrivateChannel, user } = props;

    const [starredChannel, setStarredChannel] = useState([]);
    const [activeStarChannel, setActiceStarChannel] = useState('');

    const [snapshot, loading, error] = useList(
        usersRef.child(user.uid).child('starred')
    );

    useEffect(() => {
        if (snapshot && !loading && !error) {
            const updatedStarChannel = [];
            snapshot.forEach(snap => {
                const starChanObje = {
                    id: snap.key,
                    ...snap.val()
                };
                updatedStarChannel.push(starChanObje);
            });
            setStarredChannel(updatedStarChannel);
        }
    }, [snapshot, loading, error]);

    const displayChannels = channels => {
        return (
            channels.length > 0 &&
            channels.map(channel => (
                <Menu.Item
                    key={channel.id}
                    onClick={() => changeChannel(channel)}
                    name={channel.name}
                    style={{ opacity: 0.7 }}
                    active={channel.id === activeStarChannel}
                >
                    # {channel.name}
                </Menu.Item>
            ))
        );
    };

    const changeChannel = channel => {
        setActiceStarChannel(channel.id);
        setChannel(channel);
        setPrivateChannel(false);
    };

    return (
        <Menu.Menu className="menu">
            <Menu.Item>
                <span>
                    <Icon name="star" /> STARRED
                </span>{' '}
                ({starredChannel.length})
            </Menu.Item>
            {displayChannels(starredChannel)}
        </Menu.Menu>
    );
};

const mapDispatchToState = dispatch => {
    return {
        setChannel: channel =>
            dispatch(actionCreators.setCurrentChannel(channel)),
        setPrivateChannel: isPrivateChannel =>
            dispatch(actionCreators.setPrivateChannel(isPrivateChannel))
    };
};

export default connect(
    null,
    mapDispatchToState
)(Starred);
