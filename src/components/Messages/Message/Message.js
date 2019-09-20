import React from 'react';
import { Comment, Image } from 'semantic-ui-react';
import moment from 'moment';

//check if the message is the user own message
const isOwnMessage = (message, user) => {
    return message.user.id === user.uid ? 'message__self' : '';
}

//use moment to display the time
const timeFromNow = timestamp => {
    return (
        moment(timestamp).fromNow()
    );
}

//check if the message detail contains image
//if image, it would display image in the chat box
const isImage = (message) => {
    return message.hasOwnProperty('image') && !message.hasOwnProperty('content');
}

const Message = props => {
    const { message, user } = props;

    return (
        <Comment>
            <Comment.Avatar src={message.user.avatar} />
            <Comment.Content className={isOwnMessage(message, user)}>
                <Comment.Author as="a">
                    {message.user.name}
                </Comment.Author>
                <Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>
                {isImage(message) ?
                    <Image src={message.image} className="message__image" /> :
                    <Comment.Text>{message.content}</Comment.Text>
                }
            </Comment.Content>
        </Comment>
    );
}

export default Message;