import React from 'react';
import { Menu } from 'semantic-ui-react';
import UserPanel from './UserPanel/UserPanel';
import Channels from './Channels/Channels';
import DirectMessages from './DirectMessages/DirectMessages';
import Starred from './Starred/Starred';

const SidePanel = props => {
    const { user, primaryColor } = props;
    return (
        <Menu
            size="large"
            inverted
            fixed="left"
            vertical
            style={{
                background: primaryColor,
                fontSize: '1.2rem',
                overflowY: 'auto'
            }}
            className="sideScroll"
        >
            <UserPanel primaryColor={primaryColor} user={user} />
            <Starred user={user} />
            <Channels user={user} />
            <DirectMessages user={user} />
        </Menu>
    );
};

export default SidePanel;
