import React from 'react';

const HeaderNav = ({ tabs, activeTab, setActiveTab, showClientDropdown, setShowClientDropdown, showInvoiceDropdown, setShowInvoiceDropdown, sendInvoiceByEmail, saveToGoogleDrive }) => (
  <div style={{ backgroundColor: '#477A0C' }} className="p-4">
    <div className="flex items-center justify-between">
      {/* ...logo et titre */}
      <div className="flex items-center space-x-2">
        <div className="text-white">
          <div className="font-bold text-lg">MYCONFORT</div>
          <div className="text-sm opacity-90">Facturation</div>
        </div>
      </div>
      {/* onglets */}
      <div className="flex space-x-3">
        {tabs.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === tab.id ? '' : 'hover:opacity-80'}`}
            style={{ backgroundColor: activeTab === tab.id ? tab.bgColor : 'rgba(255,255,255,0.2)', color: activeTab === tab.id ? tab.color : 'white' }}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);
export default HeaderNav;
