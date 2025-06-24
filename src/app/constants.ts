import predictionContestAbi from '../data/predictionContestAbi.json';
import usdcERC20Abi from '../data/usdcERC20.json';

// Contract addresses - you'll need to update these with your deployed contract addresses
export const CONTRACT_ADDRESSES = {
  PREDICTION_CONTEST: '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512', // Replace with actual address
  USDC: '0x5fbdb2315678afecb367f032d93f642f64180aa3', // Replace with actual USDC address
};

export const ABIS = {
  PREDICTION_CONTEST: predictionContestAbi,
  USDC: usdcERC20Abi,
}; 