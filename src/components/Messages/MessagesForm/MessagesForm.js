import React, { useState, useEffect, useCallback, useRef } from 'react';
import firebase from '../../../firebase';
import uuidv4 from 'uuid/v4';
import { Segment, Button, Input } from 'semantic-ui-react';
import FileModal from '../FileModal/FileModal';
import ProgressBar from '../ProgressBar/ProgressBar';
import { Picker, emojiIndex } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

//firebase DB reference
const typingRef = firebase.database().ref('typing');

const MessagesForm = props => {
    const { currentChannel, currentUser, getMessagesRef } = props;

    //input field reference, used for focus after selecting emoji
    const inputEl = useRef(null);

    //firebase storage reference
    const storageRef = firebase.storage().ref();

    //upload percentage for image
    const [percent, setPercent] = useState(0);
    const [userInput, setUserInput] = useState('');

    //display loading for message sent button
    const [loading, setLoading] = useState(false);
    const [emojiPicker, setEmojiPicker] = useState(false);
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
    };

    useEffect(() => {
        if (inputEl) {
            inputEl.current.focus();
        }
    }, []);

    //when user enters, store a entry of user in typing field
    const handleKeyDown = e => {
        if (e.ctrlKey && e.keyCode === 13) {
            sendMessage();
        }
        if (userInput) {
            typingRef
                .child(currentChannel.id)
                .child(currentUser.uid)
                .set(currentUser.displayName);
            //if the input field is empty, clear the typing entry of user
        } else {
            typingRef
                .child(currentChannel.id)
                .child(currentUser.uid)
                .remove();
        }
    };

    const openModal = () => {
        setModal(true);
    };

    const closeModal = () => {
        setModal(false);
    };

    //create a message object to be stored in the database
    const createMessage = useCallback(
        (fileUrl = null) => {
            const message = {
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                user: {
                    id: currentUser.uid,
                    name: currentUser.displayName,
                    avatar: currentUser.photoURL
                }
            };
            //if there is a file url, store image instead of content
            if (fileUrl !== null) {
                message['image'] = fileUrl;
            } else {
                message['content'] = userInput;
            }
            return message;
        },
        [currentUser, userInput]
    );

    //send the message to the databse
    const sendMessage = () => {
        //if there is userInput
        if (userInput.length > 0) {
            //display loading
            setLoading(true);
            //go to a channel, push a new entry, set the value to new message
            getMessagesRef
                .child(currentChannel.id)
                .push()
                .set(createMessage())
                .then(() => {
                    setLoading(false);
                    setUserInput('');
                    //remove the typing entry once the message is sent
                    typingRef
                        .child(currentChannel.id)
                        .child(currentUser.uid)
                        .remove();
                })
                .catch(error => {
                    setLoading(false);
                    setErrors(errors.concat(error));
                    console.log(error);
                });
        } else {
            setErrors(errors.concat({ message: 'Add a message' }));
        }
    };

    //file path reference for image upload
    const pathToUpload = currentChannel.id;

    const getPath = () => {
        if (props.isPrivateChannel) {
            return `chat/private/${currentChannel.id}`;
        } else {
            return `chat/public`;
        }
    };

    //set up image upload
    const uploadFile = (file, metadata) => {
        //generate a unique key for each image
        const filePath = `${getPath()}/${uuidv4()}.png`;
        setUploadState('uploading');
        //store the image
        setUploadTask(storageRef.child(filePath).put(file, metadata));
    };

    //call back for image storing
    useEffect(() => {
        if (uploadTask) {
            //listen to the uploading state, 0% - 100%
            uploadTask.on(
                'state_changed',
                snap => {
                    const percenUploaded = Math.round(
                        (snap.bytesTransferred / snap.totalBytes) * 100
                    );
                    console.log(percenUploaded);
                    setPercent(percenUploaded);
                },
                err => {
                    console.log(err);
                    setErrors(prevState => {
                        return prevState.concat(err);
                    });
                    setUploadState('error');
                    setUploadTask(null);
                }
            );
        }
    }, [uploadTask]);

    const handleTogglePicker = () => {
        setEmojiPicker(prev => !prev);
    };

    //append the selected emoji to the existing input message
    const handleSelectEmoji = emoji => {
        const oldMessage = userInput;
        const newMessage = colonToUnicode(`${oldMessage} ${emoji.colons}`);
        //close the emoji panel
        setEmojiPicker(false);
        //focus back to the input field and then set the cursor to the end of the message
        setTimeout(() => {
            inputEl.current.focus();
            setUserInput(newMessage);
        }, 0);
    };

    // ? not sure how this is done
    // ? transform the text and emoji into appendable form and append
    const colonToUnicode = message => {
        return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
            x = x.replace(/:/g, '');
            let emoji = emojiIndex.emojis[x];
            if (typeof emoji !== 'undefined') {
                let unicode = emoji.native;
                if (typeof unicode !== 'undefined') {
                    return unicode;
                }
            }
            x = ':' + x + ':';
            return x;
        });
    };

    //call back for finish uploading the image to the firebase storage
    useEffect(() => {
        //send set and store the image in the database
        const sendFileMessage = (fileUrl, ref, pathToUpload) => {
            ref.child(pathToUpload)
                .push()
                .set(createMessage(fileUrl))
                .then(() => {
                    setUploadState('done');
                })
                .catch(err => {
                    console.log(err);
                    setErrors(e => e.concat(err));
                });
        };
        //if 100% completed
        //console.log('loaded');
        const tempErr = [];
        if (percent === 100) {
            //get the image downloadURL and then store it in message so that it could be displayed in the chat
            // !set timeout to prevent large image firebase handling too slow
            const timer = setTimeout(() => {
                uploadTask.snapshot.ref
                    .getDownloadURL()
                    .then(downloadUrl => {
                        sendFileMessage(
                            downloadUrl,
                            getMessagesRef,
                            pathToUpload
                        );
                        setPercent(0);
                    })
                    .catch(err => {
                        console.log(err);
                        setErrors(tempErr.concat(err));
                        setUploadState('error');
                        setUploadTask(null);
                        setPercent(0);
                    });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [percent, getMessagesRef, pathToUpload, createMessage, uploadTask]);

    return (
        <Segment className="message__form">
            {emojiPicker && (
                <Picker
                    set="apple"
                    className="emojipicker"
                    title="Pick your emoji"
                    emoji="point_up"
                    onSelect={handleSelectEmoji}
                />
            )}
            <Input
                fluid
                value={userInput}
                name="message"
                style={{ marginbottom: '0.7em' }}
                label={
                    <Button
                        icon={emojiPicker ? 'close' : 'add'}
                        content={emojiPicker ? 'Close' : null}
                        onClick={handleTogglePicker}
                    />
                }
                labelPosition="left"
                ref={inputEl}
                placeholder="write your message"
                className={
                    errors.some(error => error.message.includes('message'))
                        ? 'error'
                        : ''
                }
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
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
            <ProgressBar uploadState={uploadState} percent={percent} />
        </Segment>
    );
};

export default MessagesForm;
