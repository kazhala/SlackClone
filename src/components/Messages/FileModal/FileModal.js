import React, { useState } from 'react';
import { Modal, Input, Icon, Button } from 'semantic-ui-react';
import mime from 'mime-types';

const FileModal = props => {

    const [file, setFile] = useState(null);

    const authorized = ['image/jpeg', 'image/png'];

    const addFile = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
        }
    }

    const sendFile = () => {
        if (file !== null) {
            if (isAuthorized(file.name)) {
                const metadata = {
                    contentType: mime.lookup(file.name),
                }
                props.uploadFile(file, metadata);
                props.closeModal();
                clearFile();
            }
        }
    }

    const clearFile = () => {
        setFile(null);
    }


    const isAuthorized = filename => {
        return authorized.includes(mime.lookup(filename));
    }

    return (
        <Modal basic open={props.modal} onClose={props.closeModal}>
            <Modal.Header>Select an Image File</Modal.Header>
            <Modal.Content>
                <Input
                    onChange={addFile}
                    fluid
                    label="jpg, png"
                    name="file"
                    type="file"
                />
            </Modal.Content>
            <Modal.Actions>
                <Button color="green" onClick={sendFile}>
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