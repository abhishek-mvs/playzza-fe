'use client';

import { ConnectWallet, NavbarConnectButton, HeroConnectButton, CardConnectButton, MinimalConnectButton } from './ConnectButton';

export function ConnectButtonExamples() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">ConnectButton Variants</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="glass rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Default (Large)</h4>
            <ConnectWallet size="lg" variant="default" />
          </div>
          
          <div className="glass rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Compact (Medium)</h4>
            <ConnectWallet size="md" variant="compact" />
          </div>
          
          <div className="glass rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Minimal (Small)</h4>
            <ConnectWallet size="sm" variant="minimal" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Preset Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">NavbarConnectButton</h4>
            <NavbarConnectButton />
          </div>
          
          <div className="glass rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">HeroConnectButton</h4>
            <HeroConnectButton />
          </div>
          
          <div className="glass rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">CardConnectButton</h4>
            <CardConnectButton />
          </div>
          
          <div className="glass rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">MinimalConnectButton</h4>
            <MinimalConnectButton />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Size Variations</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="glass rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Small</h4>
            <ConnectWallet size="sm" />
          </div>
          
          <div className="glass rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Medium</h4>
            <ConnectWallet size="md" />
          </div>
          
          <div className="glass rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Large</h4>
            <ConnectWallet size="lg" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Custom Configurations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Without Balance</h4>
            <ConnectWallet showBalance={false} />
          </div>
          
          <div className="glass rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Without Avatar</h4>
            <ConnectWallet showAvatar={false} />
          </div>
        </div>
      </div>
    </div>
  );
} 