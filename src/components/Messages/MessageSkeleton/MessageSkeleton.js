import React from 'react';

const MessageSkeleton = props => {
    return (
        <div className="skeleton">
            <div className="skeleton__avatar"></div>
            <div className="skeleton__author"></div>
            <div className="skeleton__detail"></div>
        </div>
    );
};

export default MessageSkeleton;
