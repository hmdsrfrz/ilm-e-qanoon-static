import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import DocumentViewer from '@/features/viewer/DocumentViewer';

export function Shell() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',     /* sidebar LEFT, content RIGHT — side by side */
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#0a0a0a',
      }}
    >

      {/* LEFT: Sidebar — fixed 240px, never grows or shrinks */}
      <Sidebar />

      {/*
        RIGHT: Everything else — header + route content stacked vertically.
        flex: 1 takes ALL remaining width after the 240px sidebar.
        min-width: 0 is REQUIRED — without it flex children cannot shrink
        below their content width and the layout overflows.
      */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Header />

        {/*
          Route content fills remaining height.
          min-height: 0 is REQUIRED for same reason as min-width: 0 above.
        */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Outlet />
        </div>
      </div>

      {/* Document viewer — full-screen overlay, z-index 200 */}
      <DocumentViewer />
    </div>
  );
}