'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from './ui/Button';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { cn } from '../lib/utils';
import { WalletButton } from '@rainbow-me/rainbowkit';

interface ConnectWalletProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
  showBalance?: boolean;
  showAvatar?: boolean;
}

export function ConnectWallet({ 
  size = 'md', 
  variant = 'default',
  className,
  showBalance = true,
  showAvatar = true
}: ConnectWalletProps) {
  const { isConnected } = useAccount();

  // Custom styling based on size and variant
  const getCustomStyles = () => {
    const baseStyles = "!font-semibold !rounded-lg !transition-all !duration-300";
    
    const sizeStyles = {
      sm: "!px-3 !py-1.5 !text-sm !min-h-[32px]",
      md: "!px-4 !py-2 !text-base !min-h-[40px]", 
      lg: "!px-6 !py-3 !text-lg !min-h-[48px]"
    };

    const variantStyles = {
      default: "!bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !text-white !shadow-lg hover:!shadow-xl",
      compact: "!bg-gray-800 !text-white hover:!bg-gray-700 !border !border-gray-600",
      minimal: "!bg-transparent !text-white !border !border-white !border-opacity-20 hover:!bg-white hover:!bg-opacity-10"
    };

    return cn(
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      className
    );
  };

  return (
    <div className={cn("rainbowkit-connect-button-wrapper", className)}>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          if (!ready) {
            return null;
          }

          if (connected) {
            return (
              <div className="flex items-center gap-2">
                {chain.unsupported && (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className={cn(
                      "!bg-red-600 hover:!bg-red-700 !text-white !px-3 !py-1.5 !text-sm !rounded-lg",
                      size === 'sm' && "!px-2 !py-1 !text-xs",
                      size === 'lg' && "!px-4 !py-2 !text-base"
                    )}
                  >
                    Wrong network
                  </button>
                )}

                <button
                  onClick={openChainModal}
                  type="button"
                  className={cn(
                    "!bg-gray-800 !text-white !px-3 !py-1.5 !text-sm !rounded-lg hover:!bg-gray-700 !flex !items-center !gap-2",
                    size === 'sm' && "!px-2 !py-1 !text-xs",
                    size === 'lg' && "!px-4 !py-2 !text-base"
                  )}
                >
                  {chain.hasIcon && (
                    <div
                      style={{
                        background: chain.iconBackground,
                        width: size === 'sm' ? 12 : size === 'lg' ? 20 : 16,
                        height: size === 'sm' ? 12 : size === 'lg' ? 20 : 16,
                        borderRadius: 999,
                        overflow: 'hidden',
                        marginRight: 4,
                      }}
                    >
                      {chain.iconUrl && (
                        <img
                          alt={chain.name ?? 'Chain icon'}
                          src={chain.iconUrl}
                          style={{ width: '100%', height: '100%' }}
                        />
                      )}
                    </div>
                  )}
                  {chain.name}
                </button>

                <button
                  onClick={openAccountModal}
                  type="button"
                  className={cn(
                    getCustomStyles(),
                    "!flex !items-center !gap-2"
                  )}
                >
                  {showAvatar && account.ensAvatar ? (
                    <img
                      alt={account.ensAvatar}
                      src={account.ensAvatar}
                      className={cn(
                        "!rounded-full",
                        size === 'sm' && "!w-5 !h-5",
                        size === 'md' && "!w-6 !h-6", 
                        size === 'lg' && "!w-8 !h-8"
                      )}
                    />
                  ) : showAvatar ? (
                    <div
                      className={cn(
                        "!bg-gray-600 !rounded-full !flex !items-center !justify-center",
                        size === 'sm' && "!w-5 !h-5",
                        size === 'md' && "!w-6 !h-6",
                        size === 'lg' && "!w-8 !h-8"
                      )}
                    >
                      <span className={cn(
                        "!text-white !font-bold",
                        size === 'sm' && "!text-xs",
                        size === 'md' && "!text-sm",
                        size === 'lg' && "!text-base"
                      )}>
                        {account.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ) : null}
                  
                  <span className="!hidden sm:!block">
                    {account.displayName}
                  </span>
                  
                  {showBalance && account.displayBalance ? (
                    <span className="!hidden sm:!block !text-xs !opacity-70">
                      ({account.displayBalance})
                    </span>
                  ) : null}
                </button>
              </div>
            );
          }

          return (
            <button
              onClick={openConnectModal}
              type="button"
              className={getCustomStyles()}
            >
              Connect Wallet
            </button>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}

// Preset components for common use cases
export function NavbarConnectButton() {
  return (
    <ConnectWallet 
      size="sm" 
      variant="compact"
      showBalance={false}
      // showAvatar={false}
      className="!min-w-fit"
    />
  );
}

export function HeroConnectButton() {
  return (
    <ConnectWallet 
      size="lg"
      variant="default"
      showBalance={true}
      showAvatar={true}
      className="!mx-auto"
    />
  );
}

export function CardConnectButton() {
  return (
    <ConnectWallet 
      size="md"
      variant="default"
      showBalance={false}
      showAvatar={true}
      className="!mx-auto"
    />
  );
}

export function MinimalConnectButton() {
  return (
    <ConnectWallet 
      size="sm"
      variant="minimal"
      showBalance={false}
      showAvatar={false}
      className="!min-w-fit"
    />
  );
} 


export function WalletButtonFun() {
  return (
    <WalletButton wallet="metamask" />
  );
}