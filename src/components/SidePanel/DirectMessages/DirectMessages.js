import React, { useEffect, useState } from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import firebase from '../../../firebase';
import { useList, useObjectVal } from 'react-firebase-hooks/database';

const DirectMessages = props => {
    const { user } = props;
    const usersRef = firebase.database().ref('users');
    const connectedRef = firebase.database().ref('.info/connected');
    const presenceRef = firebase.database().ref('presence');

    const [users, setUsers] = useState([]);

    //eslint-disable-next-line
    const [snapshots, loading, error] = useList(usersRef);
    //eslint-disable-next-line
    const [onSnapshots, onLoading, onError] = useObjectVal(connectedRef);
    //eslint-disable-next-line
    const [presenceSnap, presenceLoading, presenceError] = useList(presenceRef);

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
    }, [loading])

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
    }, [onSnapshots])

    const addStatusToUser = (userid, connected = true) => {
        const updatedUser = users.reduce((acc, newuser) => {
            if (userid === newuser.uid) {
                newuser['status'] = `${connected ? "online" : "offline"}`;
            }
            return acc.concat(newuser);
        }, []);
        setUsers(updatedUser);
    }

    useEffect(() => {
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
    }, [presenceSnap])


    const isUserOnline = contactUser => contactUser.status === 'online';


    return (
        <Menu.Menu className="menu">
            <Menu.Item>
                <span>
                    <Icon name="mail" /> DIRECT MESSAGES
            </span> {' '}
                ({users.length})
            </Menu.Item>
            {users.map(contactUser => (
                <Menu.Item
                    key={contactUser.uid}
                    onClick={() => console.log(contactUser)}
                    style={{ opacity: 0.7, fontStyle: "italic" }}
                >
                    <Icon name="circle" color={isUserOnline(contactUser) ? 'green' : 'red'} />
                    @ {contactUser.name}
                </Menu.Item>
            ))}
        </Menu.Menu>
    );
}

export default DirectMessages;