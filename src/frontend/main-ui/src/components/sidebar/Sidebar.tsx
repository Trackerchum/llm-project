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
            <style>{"\
        .App{\
          min-height: 100vh;\
          justify-content: flex-start;\
        }\
        .App>main{\
          flex: 1 1 auto;\
          display: flex;\
          min-height: 0;\
          margin-bottom: 0;\
        }\
      "}</style>
        </div>
    );
};

export default Sidebar;
