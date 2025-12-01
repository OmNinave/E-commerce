import React from 'react';
import PropTypes from 'prop-types';
import './PageLayout.css';

/**
 * Standardized Page Layout Component
 * Provides consistent structure for all pages
 */
const PageLayout = ({
    title,
    subtitle,
    children,
    maxWidth = '1200px',
    centered = false,
    loading = false,
    error = null,
    className = ''
}) => {
    if (loading) {
        return (
            <div className="page-layout">
                <div className="page-container" style={{ maxWidth }}>
                    <div className="page-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-layout">
                <div className="page-container" style={{ maxWidth }}>
                    <div className="page-error">
                        <div className="error-icon">⚠️</div>
                        <h2>Oops! Something went wrong</h2>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`page-layout ${className}`}>
            <div className="page-container" style={{ maxWidth }}>
                {(title || subtitle) && (
                    <div className={`page-header ${centered ? 'text-center' : ''}`}>
                        {title && <h1 className="page-title">{title}</h1>}
                        {subtitle && <p className="page-subtitle">{subtitle}</p>}
                    </div>
                )}
                <div className="page-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

PageLayout.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    children: PropTypes.node.isRequired,
    maxWidth: PropTypes.string,
    centered: PropTypes.bool,
    loading: PropTypes.bool,
    error: PropTypes.string,
    className: PropTypes.string
};

export default PageLayout;
