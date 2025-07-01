import predictionContestAbi from '../data/predictionContestAbi.json';
import usdcERC20Abi from '../data/usdcERC20.json';

// Contract addresses - you'll need to update these with your deployed contract addresses
export const CONTRACT_ADDRESSES = {
  PREDICTION_CONTEST: '0x1e00d5ce6fd3e3eab7b7d7af3d869dc96bb361af', // Replace with actual address
  USDC: '0x63df13aaaea3c5ccd9085168f651da1f738af328', // Replace with actual USDC address
};

export const ABIS = {
  PREDICTION_CONTEST: predictionContestAbi,
  USDC: usdcERC20Abi,
}; 