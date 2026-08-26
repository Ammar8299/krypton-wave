import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import Sidebar from './components/Sidebar';
import ConversationView from './components/ConversationView';
import IdentityScreen from './components/IdentityScreen';
import AddPeerModal from './components/AddPeerModal';
import RenameContactModal from './components/RenameContactModal';
import SecurityDetailsModal from './components/SecurityDetailsModal';
import ContextMenu from './components/ContextMenu';

export default function App() {
  const { init, view, showAddModal, renameModalPeer, securityModalPeer } = useAppStore();

  useEffect(() => { init(); }, []);

  return (
    <div className="app-container">
      <Sidebar />

      {view === 'chat'     && <ConversationView />}
      {view === 'identity' && <IdentityScreen />}

      {showAddModal && <AddPeerModal />}
      {renameModalPeer && <RenameContactModal />}
      {securityModalPeer && <SecurityDetailsModal />}

      <ContextMenu />
    </div>
  );
}
