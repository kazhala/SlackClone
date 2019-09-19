import React from 'react';
import { Modal, Input, Icon, Button } from 'semantic-ui-react';

const FileModal = props => {
    return (
        <Modal basic open={props.modal} onClose={props.closeModal}>
            <Modal.Header>Select an Image File</Modal.Header>
            <Modal.Content>
                <Input
                    fluid
                    label="jpg, png"
                    name="file"
                    type="file"
                />
            </Modal.Content>
            <Modal.Actions>
                <Button color="green">
                    <Icon name='checkmark' /> Send
                </Button>
                <Button color="red" onClick={props.closeModal}>
                    <Icon name='remove' /> Cancel
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default FileModal;