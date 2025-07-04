import predictionContestAbi from '../data/predictionContestAbi.json';
import usdcERC20Abi from '../data/usdcERC20.json';

// Contract addresses - you'll need to update these with your deployed contract addresses
export const CONTRACT_ADDRESSES = {
  PREDICTION_CONTEST: process.env.NEXT_PUBLIC_PREDICTION_CONTEST_ADDRESS || '', // Replace with actual address
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '', // Replace with actual USDC address
};

export const ABIS = {
  PREDICTION_CONTEST: predictionContestAbi,
  USDC: usdcERC20Abi,
}; 