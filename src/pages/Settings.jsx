import React from 'react';
import EditProfile from './EditProfile';

const Settings = () => {
    return (
        <div className="settings-page">
            <h1>Settings</h1>
            <p>Manage your application settings here.</p>
            {/* Reuse EditProfile for now as it contains user settings */}
            <EditProfile />
        </div>
    );
};

export default Settings;
