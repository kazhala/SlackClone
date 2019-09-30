import React, { useEffect, useState, useRef } from 'react';
import firebase from '../../firebase';
import { Segment, Comment } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader/MessagesHeader';
import MessagesForm from './MessagesForm/MessagesForm';
import Message from './Message/Message';
import { useListVals, useList } from 'react-firebase-hooks/database';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions/index';
import Typing from './Typing/Typing';
import MessageSkeleton from './MessageSkeleton/MessageSkeleton';

//firebase database reference
const messagesRef = firebase.database().ref('messages');
const privateMessagesRef = firebase.database().ref('privateMessages');
const usersRef = firebase.database().ref('users');
const typingRef = firebase.database().ref('typing');
const connectedRef = firebase.database().ref('.info/connected');

const Messages = props => {
    const {
        currentChannel,
        currentUser,
        isPrivateChannel,
        setUserPosts
    } = props;

    //bottom scroll div reference
    const bottomEl = useRef(null);

    //state for handling search
    const [searchTerm, setSearchTerm] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResult, setSearchResult] = useState([]);

    //const [firstLoad, setFirstLoad] = useState(true);

    //get the firebase reference based on isPrivateChannel
    const getMessagesRef = isPrivateChannel ? privateMessagesRef : messagesRef;

    //using installed firebase hooks to listen for changes
    //eslint-disable-next-line
    const [snapshots, loading, error] = useListVals(
        getMessagesRef.child(currentChannel.id)
    );
    //eslint-disable-next-line
    const [starSnap, starLoading, starError] = useList(
        usersRef.child(currentUser.uid).child('starred')
    );

    //eslint-disable-next-line
    const [typingSnap, typingLoading, typingError] = useList(
        typingRef.child(currentChannel.id)
    );

    //listen to current user, if user log out, remove it's typing entry in DB
    useEffect(() => {
        connectedRef.on('value', snap => {
            if (snap.val() === true) {
                typingRef
                    .child(currentChannel.id)
                    .child(currentUser.uid)
                    .onDisconnect()
                    .remove(err => {
                        if (err !== null) {
                            console.log(err);
                        }
                    });
            }
        });
    }, [currentChannel, currentUser]);

    //display the channel detail
    const displayChannelName = channel => {
        return channel
            ? `${props.isPrivateChannel ? '@' : '#'}${channel.name}`
            : '';
    };

    //if there's entry in DB, display typing animation
    const displayTypingUsers = () => {
        return (
            typingSnap.length > 0 &&
            typingSnap.map(user => {
                return (
                    user.key !== currentUser.uid && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '0.2em'
                            }}
                            key={user.key}
                        >
                            <span className="user__typing">
                                {user.val()} is typing
                            </span>{' '}
                            <Typing />
                        </div>
                    )
                );
            })
        );
    };

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
    };

    //count the number of post each user has posted
    useEffect(() => {
        const countUserPosts = () => {
            const userPosts = snapshots.reduce((acc, message) => {
                if (message.user.name in acc) {
                    acc[message.user.name].count += 1;
                } else {
                    acc[message.user.name] = {
                        avatar: message.user.avatar,
                        count: 1
                    };
                }
                return acc;
            }, {});
            setUserPosts(userPosts);
        };
        if (!loading) {
            countUserPosts();
        }
    }, [loading, snapshots, setUserPosts]);

    //componentWillUnmount, cut of the listener when destructed
    useEffect(() => {
        return () => {
            console.log('closed');
            messagesRef.off();
        };
    }, []);

    //after loading the page, scroll to bottom
    //when new message is entered, scroll to bottom
    useEffect(() => {
        const scrollToBottom = () => {
            bottomEl.current.scrollIntoView({ behavior: 'smooth' });
        };
        if (bottomEl) {
            scrollToBottom();
        }
    }, [snapshots, bottomEl]);

    const handleSearch = e => {
        setSearchTerm(e.target.value);
        setSearchLoading(true);
    };

    //handle the user search input, set a timeout so that it won't re-render immediately
    //and also show a spinner
    useEffect(() => {
        if (searchLoading && snapshots) {
            //set timeout for slight loading animation and not refresh immediately
            const timer = setTimeout(() => {
                const channelMessages = [...snapshots];
                //using regex to handle search filtering, set to global and ignore cases
                const regex = new RegExp(searchTerm, 'gi');
                const searchResults = channelMessages.reduce((acc, message) => {
                    if (
                        (message.content && message.content.match(regex)) ||
                        message.user.name.match(regex)
                    ) {
                        acc.push(message);
                    }
                    return acc;
                }, []);
                setSearchResult(searchResults);
                setSearchLoading(false);
            }, 1000);
            //clear the timer when unmounted
            return () => clearTimeout(timer);
        }
    }, [searchLoading, snapshots, searchTerm]);

    //check if the channel is starred and display accordinly
    const isChannelStarred = () => {
        let starredChannelIds = [];
        starredChannelIds = starSnap.map(snap => snap.key);
        return starredChannelIds.includes(currentChannel.id);
    };

    //handle the action of user clicking on the star icon
    const handleStar = () => {
        //if it is not starred, store a databse entry
        if (!isChannelStarred()) {
            usersRef.child(`${currentUser.uid}/starred`).update({
                [currentChannel.id]: {
                    name: currentChannel.name,
                    details: currentChannel.details,
                    createdBy: {
                        name: currentChannel.createdBy.name,
                        avatar: currentChannel.createdBy.avatar
                    }
                }
            });
            //else remove the entry
        } else {
            usersRef
                .child(`${currentUser.uid}/starred`)
                .child(currentChannel.id)
                .remove(err => {
                    if (err !== null) {
                        console.log(err);
                    }
                });
        }
    };

    const displayMessagesSkeleton = () =>
        loading ? (
            <React.Fragment>
                {[...Array(30)].map((_, i) => (
                    <MessageSkeleton key={i} />
                ))}
            </React.Fragment>
        ) : null;

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
                    {displayMessagesSkeleton()}
                    {searchTerm
                        ? searchResult.length > 0 &&
                          searchResult.map(message => (
                              <Message
                                  key={message.timestamp}
                                  message={message}
                                  user={currentUser}
                              />
                          ))
                        : snapshots.length > 0 &&
                          snapshots.map(message => (
                              <Message
                                  key={message.timestamp}
                                  message={message}
                                  user={currentUser}
                              />
                          ))}
                    {displayTypingUsers()}
                    <div ref={bottomEl}></div>
                </Comment.Group>
            </Segment>
            <MessagesForm
                messagesRef={messagesRef}
                currentUser={currentUser}
                isPrivateChannel={isPrivateChannel}
                getMessagesRef={getMessagesRef}
                currentChannel={currentChannel}
            />
        </React.Fragment>
    );
};

const mapDispatchToProps = dispatch => {
    return {
        setUserPosts: userPosts =>
            dispatch(actionCreators.setUserPosts(userPosts))
    };
};

export default connect(
    null,
    mapDispatchToProps
)(Messages);
