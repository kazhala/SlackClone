import React, { useState } from 'react';
import { Modal, Input, Icon, Button } from 'semantic-ui-react';
import mime from 'mime-types';

const FileModal = props => {

    //initial no file
    const [file, setFile] = useState(null);

    //set allowed file type
    const authorized = ['image/jpeg', 'image/png'];

    //read and save the input file to state
    const addFile = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
        }
    }

    //us mime to conver to readable file type
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

    //use mime to convert to readable file type
    //check if the file type is included in the authorized type
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