import React, { useState, useEffect } from 'react';
import firebase from '../../../firebase';
import uuidv4 from 'uuid/v4';
import { Segment, Button, Input } from 'semantic-ui-react';
import FileModal from '../FileModal/FileModal';

const MessagesForm = props => {
    const { messagesRef, currentChannel, currentUser } = props;

    const storageRef = firebase.storage().ref();

    const [percent, setPercent] = useState(0);
    const [userInput, setUserInput] = useState('');

    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState([]);
    const [uploadState, setUploadState] = useState('');
    const [uploadTask, setUploadTask] = useState(null);

    const [modal, setModal] = useState(false);

    //const [downloadUrl, loadingStorage, error] = useDownloadURL(uploadTask && uploadTask.snapshot.ref);

    //console.log(downloadUrl);

    const handleInputChange = e => {
        setUserInput(e.target.value);
    }

    const openModal = () => {
        setModal(true);
    }

    const closeModal = () => {
        setModal(false);
    }

    const createMessage = (fileUrl = null) => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: currentUser.uid,
                name: currentUser.displayName,
                avatar: currentUser.photoURL
            },
        };
        if (fileUrl !== null) {
            message["image"] = fileUrl;
        } else {
            message["content"] = userInput;
        }
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

    const pathToUpload = currentChannel.id;

    const uploadFile = (file, metadata) => {
        const filePath = `chat/public/${uuidv4()}.png`;
        setUploadState('uploading');
        setUploadTask(storageRef.child(filePath).put(file, metadata));
    }

    useEffect(() => {
        if (uploadTask) {
            uploadTask.on('state_changed', snap => {
                const percenUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                console.log(percenUploaded);
                setPercent(percenUploaded);
            }, err => {
                console.log(err);
                setErrors(errors.concat(err));
                setUploadState('error');
                setUploadTask(null);
            })
        }
    }, [uploadTask])

    useEffect(() => {
        if (percent === 100) {
            uploadTask.snapshot.ref
                .getDownloadURL()
                .then(downloadUrl => {
                    sendFileMessage(downloadUrl, messagesRef, pathToUpload);
                })
                .catch(err => {
                    console.log(err);
                    setErrors([...errors, err]);
                    setUploadState('error');
                    setUploadTask(null);
                })
        }
    }, [percent])

    const sendFileMessage = (fileUrl, ref, pathToUpload) => {
        ref
            .child(pathToUpload)
            .push()
            .set(createMessage(fileUrl))
            .then(() => {
                setUploadState('done');
            })
            .catch(err => {
                console.log(err);
                setErrors(errors.concat(err));
            });
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
                <Button color="teal" content="Upload Media" labelPosition="right" icon="cloud upload" onClick={openModal} />
                <FileModal
                    modal={modal}
                    closeModal={closeModal}
                    uploadFile={uploadFile}
                />
            </Button.Group>

        </Segment>
    );
}

export default MessagesForm;