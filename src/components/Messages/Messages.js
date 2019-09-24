import React, { useEffect, useState } from 'react';
import firebase from '../../firebase';
import { Segment, Comment } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader/MessagesHeader';
import MessagesForm from './MessagesForm/MessagesForm';
import Message from './Message/Message';
import { useListVals, useList } from 'react-firebase-hooks/database';

//firebase databse reference
const messagesRef = firebase.database().ref('messages');
const privateMessagesRef = firebase.database().ref('privateMessages');
const usersRef = firebase.database().ref('users');
const Messages = props => {
    const { currentChannel, currentUser, isPrivateChannel } = props;


    const [searchTerm, setSearchTerm] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResult, setSearchResult] = useState([]);


    //const [firstLoad, setFirstLoad] = useState(true);

    const getMessagesRef = isPrivateChannel ? privateMessagesRef : messagesRef;

    //using installed firebase hooks to listen for changes
    //eslint-disable-next-line
    const [snapshots, loading, error] = useListVals(getMessagesRef.child(currentChannel.id));
    //eslint-disable-next-line
    const [starSnap, starLoading, starError] = useList(usersRef.child(currentUser.uid).child('starred'));


    //display the channel detail 
    const displayChannelName = channel => {
        return channel ? `${props.isPrivateChannel ? '@' : '#'}${channel.name}` : '';
    }

    //count the number of users in the channel
    const countUniqUsers = () => {
        //count the uniq the users and store in a new array
        const count = snapshots.reduce((acc, message) => {
            if (!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const display = `${count.length} user${count.length > 1 ? 's' : ''}`;
        return display;
    }

    //componentWillUnmount, cut of the listner when destructed
    useEffect(() => {
        return () => {
            console.log('closed');
            messagesRef.off();
        }
    }, []);

    const handleSearch = e => {
        setSearchTerm(e.target.value);
        setSearchLoading(true);
    }

    //handle the user search input, set a timeout so that it won't re-render immediatly
    //and also show a spinner
    useEffect(() => {
        if (searchLoading && snapshots) {
            const timer = setTimeout(() => {
                const channelMessages = [...snapshots];
                const regex = new RegExp(searchTerm, 'gi');
                const searchResults = channelMessages.reduce((acc, message) => {
                    if ((message.content && message.content.match(regex)) || message.user.name.match(regex)) {
                        acc.push(message);
                    }
                    return acc;
                }, [])
                setSearchResult(searchResults);
                setSearchLoading(false);

            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [searchLoading, snapshots, searchTerm]);


    const isChannelStarred = () => {
        let starredChannelIds = [];
        starredChannelIds = starSnap.map(snap => snap.key);
        return starredChannelIds.includes(currentChannel.id);
    }

    const handleStar = () => {
        if (!isChannelStarred()) {
            usersRef
                .child(`${currentUser.uid}/starred`)
                .update({
                    [currentChannel.id]: {
                        name: currentChannel.name,
                        details: currentChannel.details,
                        createdBy: {
                            name: currentChannel.createdBy.name,
                            avatar: currentChannel.createdBy.avatar
                        }
                    }
                });
        } else {
            usersRef
                .child(`${currentUser.uid}/starred`)
                .child(currentChannel.id)
                .remove(err => {
                    if (err !== null) {
                        console.log(err);
                    }
                })
        }
    }


    /*
    useEffect(() => {
        const starChannel = () => {
            if (isChannelStarred) {
                usersRef
                    .child(`${currentUser.uid}/starred`)
                    .update({
                        [currentChannel.id]: {
                            name: currentChannel.name,
                            details: currentChannel.details,
                            createdBy: {
                                name: currentChannel.createdBy.name,
                                avatar: currentChannel.createdBy.avatar
                            }
                        }
                    });
            } else {
                usersRef
                    .child(`${currentUser.uid}/starred`)
                    .child(currentChannel.id)
                    .remove(err => {
                        if (err !== null) {
                            console.log(err);
                        }
                    })
            }
        }
        console.log('test');
        if (!firstLoad) {
            starChannel();
        }

    }, [isChannelStarred, currentChannel, currentUser, firstLoad])
    */

    return (
        <React.Fragment>
            <MessagesHeader
                channelName={displayChannelName(currentChannel)}
                userCount={countUniqUsers()}
                handleSearch={handleSearch}
                searchLoading={searchLoading}
                isPrivateChannel={isPrivateChannel}
                handleStar={handleStar}
                isChannelStarred={isChannelStarred()}
            />
            <Segment>

                <Comment.Group className="messages">
                    {searchTerm ? searchResult.length > 0 && searchResult.map(message => (
                        <Message
                            key={message.timestamp}
                            message={message}
                            user={currentUser}
                        />
                    )) : snapshots.length > 0 && snapshots.map(message => (
                        <Message
                            key={message.timestamp}
                            message={message}
                            user={currentUser}
                        />
                    ))}
                </Comment.Group>


            </Segment>
            <MessagesForm
                messagesRef={messagesRef}
                currentUser={currentUser}
                isPrivateChannel={isPrivateChannel}
                getMessagesRef={getMessagesRef}
                currentChannel={currentChannel} />
        </React.Fragment>
    );
}

export default Messages;