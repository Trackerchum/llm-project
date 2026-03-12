import "./Sidebar.scss";
import { ReactNode, useState } from "react";

interface SidebarProps {
    children: ReactNode;
    page: ReactNode;
    defaultCollapsed?: boolean;
}

const Sidebar = ({ children, page, defaultCollapsed = false }: SidebarProps) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    return (
        <div className={`sidebarLayout ${isCollapsed ? "collapsed" : "expanded"}`}>
            <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
                <button
                    type="button"
                    className="sidebar__toggle"
                    onClick={() => setIsCollapsed((previous) => !previous)}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? ">" : "<"}
                </button>
                <div className="sidebar__content">{children}</div>
            </aside>
            <main className="sidebarLayout__page">{page}</main>
        </div>
    );
};

export default Sidebar;