import React, { useState, useRef, useEffect } from 'react';
import firebase from '../../../firebase';
import {
    Grid,
    Header,
    Icon,
    Dropdown,
    Image,
    Modal,
    Input,
    Button
} from 'semantic-ui-react';
import AvatarEditor from 'react-avatar-editor';

const storageRef = firebase.storage().ref();

const metadata = {
    contentType: 'image/jpeg'
};
const usersRef = firebase.database().ref('users');

const UserPanel = props => {
    const { user, primaryColor } = props;
    const userRef = firebase.auth().currentUser;

    const cropEl = useRef(null);

    const [previewImage, setPreviewImage] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const [croppedImage, setCroppedImage] = useState('');
    const [blob, setBlob] = useState('');
    const [uploadedCroppedImage, setUploadedCroppedImage] = useState('');

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setCroppedImage('');
        setPreviewImage('');
    };

    //selectable in the dropdown menu
    const dropdownOptions = () => [
        {
            key: 'user',
            text: (
                <span>
                    Signed in as <strong>{user.displayName}</strong>
                </span>
            ),
            disabled: true
        },
        {
            key: 'avatar',
            text: <div onClick={openModal}>Change Avatar</div>
        },
        {
            key: 'signout',
            text: <div onClick={handleSignout}>Sign out</div>
        }
    ];

    const handleCropImage = () => {
        if (cropEl.current) {
            cropEl.current.getImageScaledToCanvas().toBlob(blob => {
                let imageUrl = URL.createObjectURL(blob);
                setCroppedImage(imageUrl);
                setBlob(blob);
            });
        }
    };

    const handleUploadChange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        if (file) {
            reader.readAsDataURL(file);
            reader.addEventListener('load', () => {
                setPreviewImage(reader.result);
            });
        }
    };

    const uploadCroppedImage = () => {
        storageRef
            .child(`avatars/user-${usersRef.uid}`)
            .put(blob, metadata)
            .then(snap => {
                snap.ref.getDownloadURL().then(downloadURL => {
                    setUploadedCroppedImage(downloadURL);
                });
            });
    };

    useEffect(() => {
        const changeAvatar = () => {
            userRef
                .updateProfile({
                    photoURL: uploadedCroppedImage
                })
                .then(() => {
                    console.log('PhotoURL updated');
                    closeModal();
                })
                .catch(err => {
                    console.log(err);
                });
            usersRef
                .child(userRef.uid)
                .update({
                    avatar: uploadedCroppedImage
                })
                .then(() => {
                    console.log('User Avatar updated');
                })
                .catch(err => console.log(err));
        };
        if (uploadedCroppedImage) {
            changeAvatar();
        }
    }, [uploadedCroppedImage, userRef]);

    //handle action when user signout
    const handleSignout = () => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                console.log('signed out');
            });
    };

    return (
        <Grid>
            <Grid.Column style={{ background: primaryColor }}>
                <Grid.Row style={{ padding: '1.2em', margin: 0 }}>
                    <Header inverted floated="left" as="h2">
                        <Icon name="code" />
                        <Header.Content>DevChat</Header.Content>
                    </Header>

                    <Header style={{ padding: '0.25em' }} as="h4" inverted>
                        <Dropdown
                            trigger={
                                <span>
                                    <Image
                                        src={user.photoURL}
                                        spaced="right"
                                        avatar
                                    />
                                    {user.displayName}
                                </span>
                            }
                            options={dropdownOptions()}
                        />
                    </Header>
                </Grid.Row>

                <Modal basic open={modalOpen} onClose={closeModal}>
                    <Modal.Header>Change Avatar</Modal.Header>
                    <Modal.Content>
                        <Input
                            fluid
                            type="file"
                            label="New Avatar"
                            name="previewImage"
                            onChange={handleUploadChange}
                        />

                        <Grid centered stackable columns={2}>
                            <Grid.Row centered>
                                <Grid.Column className="ui center aligned grid">
                                    {previewImage && (
                                        <AvatarEditor
                                            ref={cropEl}
                                            image={previewImage}
                                            width={120}
                                            height={120}
                                            border={50}
                                            scale={1.2}
                                        />
                                    )}
                                </Grid.Column>
                                <Grid.Column>
                                    {croppedImage && (
                                        <Image
                                            style={{
                                                margin: '3.5em auto'
                                            }}
                                            width={100}
                                            height={100}
                                            src={croppedImage}
                                        />
                                    )}
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Modal.Content>

                    <Modal.Actions>
                        {croppedImage && (
                            <Button
                                color="green"
                                inverted
                                onClick={uploadCroppedImage}
                            >
                                <Icon name="save" /> Change Avatar
                            </Button>
                        )}
                        <Button
                            color="green"
                            inverted
                            onClick={handleCropImage}
                        >
                            <Icon name="image" /> Preview
                        </Button>
                        <Button color="red" inverted onClick={closeModal}>
                            <Icon name="remove" /> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Grid.Column>
        </Grid>
    );
};

export default UserPanel;
