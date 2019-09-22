import React, { useEffect, useState } from 'react';
import firebase from '../../firebase';
import { Segment, Comment } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader/MessagesHeader';
import MessagesForm from './MessagesForm/MessagesForm';
import Message from './Message/Message';
import { useListVals } from 'react-firebase-hooks/database';

//firebase databse reference
const messagesRef = firebase.database().ref('messages');
const Messages = props => {
    const { currentChannel, currentUser } = props;


    const [searchTerm, setSearchTerm] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResult, setSearchResult] = useState([]);

    //using installed firebase hooks to listen for changes
    //eslint-disable-next-line
    const [snapshots, loading, error] = useListVals(messagesRef.child(currentChannel.id));

    //display the channel detail 
    const displayChannelName = channel => channel ? `#${channel.name}` : '';

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


    return (
        <React.Fragment>
            <MessagesHeader
                channelName={displayChannelName(currentChannel)}
                userCount={countUniqUsers()}
                handleSearch={handleSearch}
                searchLoading={searchLoading}
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
                currentChannel={currentChannel} />
        </React.Fragment>
    );
}

export default Messages;