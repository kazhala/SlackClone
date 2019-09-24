import React from 'react';
import { Menu } from 'semantic-ui-react';
import UserPanel from './UserPanel/UserPanel';
import Channels from './Channels/Channels';
import DirectMessages from './DirectMessages/DirectMessages';
import Starred from './Starred/Starred';

const SidePanel = props => {
    return (

        <Menu
            size="large"
            inverted
            fixed="left"
            vertical
            style={{ background: "#4c3c4c", fontSize: '1.2rem' }}
        >
            <UserPanel user={props.user} />
            <Starred />
            <Channels user={props.user} />
            <DirectMessages user={props.user} />

        </Menu>

    );
}

export default SidePanel;