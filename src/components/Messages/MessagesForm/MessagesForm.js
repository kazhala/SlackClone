import React, { useState, useEffect } from 'react';
import firebase from '../../../firebase';
import uuidv4 from 'uuid/v4';
import { Segment, Button, Input } from 'semantic-ui-react';
import FileModal from '../FileModal/FileModal';
import ProgressBar from '../ProgressBar/ProgressBar';

const MessagesForm = props => {
    const { messagesRef, currentChannel, currentUser } = props;

    //firebase storage reference
    const storageRef = firebase.storage().ref();

    //upload percentage for image
    const [percent, setPercent] = useState(0);
    const [userInput, setUserInput] = useState('');

    //display loading for message sent button
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState([]);

    //upload state for the image
    const [uploadState, setUploadState] = useState('');
    //the file being uploaded to the storeage (reference)
    const [uploadTask, setUploadTask] = useState(null);

    //handling open and closing of modal
    const [modal, setModal] = useState(false);

    //handle input change
    const handleInputChange = e => {
        setUserInput(e.target.value);
    }

    const openModal = () => {
        setModal(true);
    }

    const closeModal = () => {
        setModal(false);
    }

    //create a message object to be stored in the database
    const createMessage = (fileUrl = null) => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: currentUser.uid,
                name: currentUser.displayName,
                avatar: currentUser.photoURL
            },
        };
        //if there is a file url, store image instead of content
        if (fileUrl !== null) {
            message["image"] = fileUrl;
        } else {
            message["content"] = userInput;
        }
        return message;
    }

    //send the message to the databse
    const sendMessage = () => {
        //if there is userInput
        if (userInput.length > 0) {
            //display loading
            setLoading(true);
            //go to a channel, push a new entry, set the value to new message
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

    //file path reference for image upload
    const pathToUpload = currentChannel.id;

    //set up image upload
    const uploadFile = (file, metadata) => {
        //generate a unique key for each image
        const filePath = `chat/public/${uuidv4()}.png`;
        setUploadState('uploading');
        //store the image
        setUploadTask(storageRef.child(filePath).put(file, metadata));
    }

    //call back for image storing
    useEffect(() => {
        if (uploadTask) {
            //listen to the uploading state, 0% - 100%
            uploadTask.on('state_changed', snap => {
                const percenUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                console.log(percenUploaded);
                setPercent(percenUploaded);
            }, err => {
                console.log(err);
                setErrors(prevState => {
                    return prevState.concat(err);
                });
                setUploadState('error');
                setUploadTask(null);
            })
        }
    }, [uploadTask])

    //call back for finish uploading the image to the firebase storage
    useEffect(() => {
        //if 100% completed
        console.log('loaded');
        const tempErr = [];
        if (percent === 100) {
            //get the image downloadURL and then store it in message so that it could be displayed in the chat
            const timer = setTimeout(() => {
                uploadTask.snapshot.ref
                    .getDownloadURL()
                    .then(downloadUrl => {
                        sendFileMessage(downloadUrl, messagesRef, pathToUpload);
                    })
                    .catch(err => {
                        console.log(err);
                        setErrors(tempErr.concat(err));
                        setUploadState('error');
                        setUploadTask(null);
                    })
            }, 3000);
            return () => clearTimeout(timer);
        }
        //eslint-disable-next-line
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
                <Button
                    color="orange"
                    content="Add Reply"
                    labelPosition="left"
                    icon="edit"
                    onClick={sendMessage}
                    loading={loading}
                />
                <Button
                    color="teal"
                    content="Upload Media"
                    labelPosition="right"
                    icon="cloud upload"
                    onClick={openModal}
                    disabled={uploadState === 'uploading'}
                />

            </Button.Group>
            <FileModal
                modal={modal}
                closeModal={closeModal}
                uploadFile={uploadFile}
            />
            <ProgressBar
                uploadState={uploadState}
                percent={percent}
            />
        </Segment>
    );
}

export default MessagesForm;