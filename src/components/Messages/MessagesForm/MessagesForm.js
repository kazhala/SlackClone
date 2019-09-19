import React, { useState } from 'react';
import firebase from '../../../firebase';
import { Segment, Button, Input } from 'semantic-ui-react';

const MessagesForm = props => {
    const { messagesRef, currentChannel, currentUser } = props;

    const [userInput, setUserInput] = useState('');

    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState([]);

    const handleInputChange = e => {
        setUserInput(e.target.value);
    }



    const createMessage = () => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: currentUser.uid,
                name: currentUser.displayName,
                avatar: currentUser.photoURL
            },
            content: userInput
        };
        return message;
    }

    const sendMessage = () => {
        if (userInput.length > 0) {
            setLoading(true);
            messagesRef
                .child(currentChannel.id)
                .push()
                .set(createMessage())
                .then(() => {
                    setLoading(false);
                    setUserInput('');
                })
                .catch(error => {
                    setLoading(false);
                    setErrors(errors.concat(error));
                    console.log(error);
                })
        } else {
            setErrors(errors.concat({ message: 'Add a message' }));
        }
    }

    return (
        <Segment className="message__form">
            <Input
                fluid
                value={userInput}
                name="message"
                style={{ marginbottom: '0.7em' }}
                label={<Button icon={'add'} />}
                labelPosition="left"
                placeholder="write your message"
                className={errors.some(error => error.message.includes('message')) ? 'error' : ''}
                onChange={handleInputChange}
            />

            <Button.Group icon widths="2">
                <Button color="orange" content="Add Reply" labelPosition="left" icon="edit" onClick={sendMessage} loading={loading} />
                <Button color="teal" content="Upload Media" labelPosition="right" icon="cloud upload" />

            </Button.Group>

        </Segment>
    );
}

export default MessagesForm;