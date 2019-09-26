import React, { useState } from 'react';
import {
    Sidebar,
    Menu,
    Divider,
    Button,
    Modal,
    Icon,
    Label,
    Segment
} from 'semantic-ui-react';
import { SliderPicker } from 'react-color';
import firebase from '../../firebase';

const usersRef = firebase.database().ref('users');

const ColorPanel = props => {
    const [modalOpen, setModalOpen] = useState(false);

    const [primary, setPrimary] = useState('');
    const [secondary, setSecondary] = useState('');

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleChangePrimary = color => {
        setPrimary(color.hex);
    };

    const handleChangeSecondary = color => {
        setSecondary(color.hex);
    };

    const handleSave = () => {
        if (primary && secondary) {
            saveColors(primary, secondary);
        }
    };

    const saveColors = (primaryColor, secondaryColor) => {
        usersRef
            .child(`${props.user.uid}/colors`)
            .push()
            .update({
                primaryColor,
                secondaryColor
            })
            .then(() => {
                console.log('colors added');
                closeModal();
            })
            .catch(err => console.log(err));
    };

    return (
        <Sidebar
            as={Menu}
            icon="labeled"
            inverted
            vertical
            visible
            width="very thin"
        >
            <Divider />
            <Button icon="add" size="small" color="blue" onClick={openModal} />
            <Modal basic open={modalOpen} onClose={closeModal}>
                <Modal.Header>Choose App Colors</Modal.Header>
                <Modal.Content>
                    <Segment inverted>
                        <Label content="Primary Color" />
                        <SliderPicker
                            onChange={handleChangePrimary}
                            color={primary}
                        />
                    </Segment>

                    <Segment inverted>
                        <Label content="Secondary Color" />
                        <SliderPicker
                            onChange={handleChangeSecondary}
                            color={secondary}
                        />
                    </Segment>
                </Modal.Content>
                <Modal.Actions>
                    <Button color="green" inverted onClick={handleSave}>
                        <Icon name="checkmark" /> Save Colors
                    </Button>
                    <Button color="red" inverted onClick={closeModal}>
                        <Icon name="remove" /> Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        </Sidebar>
    );
};

export default ColorPanel;
