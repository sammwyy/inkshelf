import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="animate-in fade-in duration-700">
            {children}
        </div>
    );
};

export default Layout;
