import React from 'react';
import firebase from '../../firebase';
import { Segment, Comment, Message } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader/MessagesHeader';
import MessagesForm from './MessagesForm/MessagesForm';

const Messages = props => {
    const messagesRef = firebase.database().ref('messages');


    return (
        <React.Fragment>
            <MessagesHeader />

            <Segment>
                <Comment.Group className="messages">

                </Comment.Group>
            </Segment>

            <MessagesForm
                messagesRef={messagesRef}
                currentUser={props.currentUser}
                currentChannel={props.currentChannel} />
        </React.Fragment>
    );
}

export default Messages;