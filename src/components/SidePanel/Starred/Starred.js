import React, { useState } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../../../actions/index';
import { Menu, Icon } from 'semantic-ui-react';

const Starred = props => {
    const { setChannel, setPrivateChannel } = props;

    const [starredChannel, setStarredChannel] = useState([]);
    const [activeStarChannel, setActiceStarChannel] = useState('');

    const displayChannels = (channels) => {
        return (
            channels.length > 0 && channels.map(channel => (
                <Menu.Item
                    key={channel.id}
                    onClick={() => changeChannel(channel)}
                    name={channel.name}
                    style={{ opacity: 0.7 }}
                    active={channel.id === activeStarChannel}
                >
                    # {channel.name}
                </Menu.Item>
            ))
        );
    }

    const changeChannel = (channel) => {
        setActiceStarChannel(channel.id);
        setChannel(channel);
        setPrivateChannel(false);
    }

    return (
        <Menu.Menu className="menu">
            <Menu.Item >
                <span>
                    <Icon name="star" /> STARRED
                    </span>{' '}
                ({starredChannel.length})
                </Menu.Item>
            {displayChannels(starredChannel)}
        </Menu.Menu>
    );
}

const mapDispatchToState = dispatch => {
    return {
        setChannel: (channel) => dispatch(actionCreators.setCurrentChannel(channel)),
        setPrivateChannel: (isPrivateChannel) => dispatch(actionCreators.setPrivateChannel(isPrivateChannel))
    }
}

export default connect(null, mapDispatchToState)(Starred);