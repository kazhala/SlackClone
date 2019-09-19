import React from 'react';
import { Segment, Button, Input } from 'semantic-ui-react';

const MessagesForm = props => {
    return (
        <Segment className="message__form">
            <Input
                fluid
                name="message"
                style={{ marginbottom: '0.7em' }}
                label={<Button icon={'add'} />}
                labelPosition="left"
                placeholder="write your message"
            />

            <Button.Group icon widths="2">
                <Button color="orange" content="Add Reply" labelPosition="left" icon="edit" />
                <Button color="teal" content="Upload Media" labelPosition="right" icon="cloud upload" />

            </Button.Group>

        </Segment>
    );
}

export default MessagesForm;