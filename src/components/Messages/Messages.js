import React from 'react';
import { Segment, Comment, Message } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader/MessagesHeader';
import MessagesForm from './MessagesForm/MessagesForm';

const Messages = props => {
    return (
        <React.Fragment>
            <MessagesHeader />

            <Segment>
                <Comment.Group className="messages">

                </Comment.Group>
            </Segment>

            <MessagesForm />
        </React.Fragment>
    );
}

export default Messages;