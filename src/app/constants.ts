import predictionContestAbi from '../data/predictionContestAbi.json';
import usdcERC20Abi from '../data/usdcERC20.json';

// Contract addresses - you'll need to update these with your deployed contract addresses
export const CONTRACT_ADDRESSES = {
  PREDICTION_CONTEST: '0xc582bc0317dbb0908203541971a358c44b1f3766', // Replace with actual address
  USDC: '0x5fbdb2315678afecb367f032d93f642f64180aa3', // Replace with actual USDC address
};

export const ABIS = {
  PREDICTION_CONTEST: predictionContestAbi,
  USDC: usdcERC20Abi,
}; 