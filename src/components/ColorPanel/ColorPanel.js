import React, { useState } from 'react';
import {
    Sidebar,
    Menu,
    Divider,
    Button,
    Modal,
    Icon,
    Label
} from 'semantic-ui-react';
import { SliderPicker } from 'react-color';

const ColorPanel = props => {
    const [modalOpen, setModalOpen] = useState(false);

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
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
                    <Label content="Primary Color" />
                    <SliderPicker />
                    <Label content="Secondary Color" />
                    <SliderPicker />
                </Modal.Content>
                <Modal.Actions>
                    <Button color="green" inverted>
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
