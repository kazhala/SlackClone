import React, { useEffect, useState } from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import firebase from '../../../firebase';
import { useList, useObjectVal } from 'react-firebase-hooks/database';
import { connect } from 'react-redux';
import * as actionCreators from '../../../actions/index';

const DirectMessages = props => {
    const { user } = props;
    //firebase reference
    const usersRef = firebase.database().ref('users');
    //firebase detect user login function reference
    const connectedRef = firebase.database().ref('.info/connected');
    const presenceRef = firebase.database().ref('presence');

    //loaded users with default offline status
    const [users, setUsers] = useState([]);

    //updated users with uptodate status
    const [statusUser, setStatusUser] = useState([]);

    const [activeChannel, setActiveChannel] = useState('');

    //eslint-disable-next-line
    const [snapshots, loading, error] = useList(usersRef);
    //eslint-disable-next-line
    const [onSnapshots, onLoading, onError] = useObjectVal(connectedRef);
    //eslint-disable-next-line
    const [presenceSnap, presenceLoading, presenceError] = useList(presenceRef);

    //load all the users from database after mounted
    //exclude current user
    useEffect(() => {
        if (!loading && snapshots) {
            let loadedUsers = [];
            snapshots.forEach(snap => {
                if (user.uid !== snap.key) {
                    let user = snap.val();
                    user['uid'] = snap.key;
                    user['status'] = 'offline';
                    loadedUsers.push(user);
                    setUsers(loadedUsers);
                }
            })
        }
    }, [loading, user, snapshots])

    //put the current user on the presence list in databse
    //remove user from list when user disconnect
    useEffect(() => {
        if (onSnapshots) {
            const ref = presenceRef.child(user.uid);
            ref.set(true);
            ref.onDisconnect().remove(err => {
                if (err !== null) {
                    console.log(err);
                }
            })
        }
    }, [onSnapshots, user, presenceRef])

    //check if user is in the presence list, if in, add login status to user
    //if not, add offline status to user
    useEffect(() => {
        const addStatusToUser = (userid, connected = true) => {
            const updatedUser = users.reduce((acc, newuser) => {
                if (userid === newuser.uid) {
                    newuser['status'] = `${connected ? "online" : "offline"}`;
                }
                return acc.concat(newuser);
            }, []);
            setStatusUser(updatedUser);
        }
        users.forEach(tempuser => {
            let exist = false;
            let key = tempuser.uid;
            presenceSnap.forEach(presentUser => {
                if (presentUser.key === key) {
                    exist = true;
                }
            })
            if (exist) {
                addStatusToUser(key);
            } else {
                addStatusToUser(key, false);
            }
        })
    }, [presenceSnap, users])


    const isUserOnline = contactUser => contactUser.status === 'online';

    const changeChannel = targetUser => {
        const channelId = getChannelId(targetUser.uid);
        const channelData = {
            id: channelId,
            name: targetUser.name,
        }
        props.setCurrentChannel(channelData);
        props.setPrivateChannel(true);
        setActiveChannel(targetUser.uid);
    }

    const getChannelId = userId => {
        const currentUserId = user.uid;
        return userId < currentUserId ? `${userId}/${currentUserId}` :
            `${currentUserId}/${userId}`
    }

    return (
        <Menu.Menu className="menu">
            <Menu.Item>
                <span>
                    <Icon name="mail" /> DIRECT MESSAGES
            </span> {' '}
                ({statusUser.length})
            </Menu.Item>
            {statusUser.map(contactUser => (
                <Menu.Item
                    key={contactUser.uid}
                    active={activeChannel === contactUser.uid}
                    onClick={() => changeChannel(contactUser)}
                    style={{ opacity: 0.7, fontStyle: "italic" }}
                >
                    <Icon name="circle" color={isUserOnline(contactUser) ? 'green' : 'red'} />
                    @ {contactUser.name}
                </Menu.Item>
            ))}
        </Menu.Menu>
    );
}

const mapDispatchToProps = dispatch => {
    return {
        setCurrentChannel: (channelData) => dispatch(actionCreators.setCurrentChannel(channelData)),
        setPrivateChannel: (isPrivateChannel) => dispatch(actionCreators.setPrivateChannel(isPrivateChannel)),
    }
}

export default connect(null, mapDispatchToProps)(DirectMessages);