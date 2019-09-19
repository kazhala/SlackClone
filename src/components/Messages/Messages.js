import React, { useEffect } from 'react';
import firebase from '../../firebase';
import { Segment, Comment } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader/MessagesHeader';
import MessagesForm from './MessagesForm/MessagesForm';
import Message from './Message/Message';
import { useListVals } from 'react-firebase-hooks/database';

const Messages = props => {
    const { currentChannel, currentUser } = props;


    const messagesRef = firebase.database().ref('messages');

    //eslint-disable-next-line
    const [snapshots, loading, error] = useListVals(messagesRef.child(currentChannel.id));






    useEffect(() => {
        return () => {
            console.log('closed');
            messagesRef.off();
        }
        //eslint-disable-next-line
    }, []);


    return (
        <React.Fragment>
            <MessagesHeader />
            <Segment>

                <Comment.Group className="messages">
                    {snapshots.length > 0 && snapshots.map(message => (
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