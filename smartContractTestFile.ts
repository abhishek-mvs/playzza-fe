import { expect } from "chai";
import { createPublicClient, createWalletClient, http, parseUnits, getAddress } from "viem";
import { hardhat } from "viem/chains";
import hre from "hardhat";
import { Account } from "viem/accounts";

describe("PredictionContest", function () {
  let publicClient: any;
  let walletClient: any;
  let mockUsdc: any;
  let predictionMarket: any;
  let owner: `0x${string}`;
  let avsManager: `0x${string}`;
  let user1: `0x${string}`;
  let user2: `0x${string}`;
  let hardhatAccounts: any[];
  const initialMint = parseUnits("10000", 6);
  const stakeAmount = parseUnits("1000", 6);

  // Helper function to get the next contest ID
  async function getNextContestId(): Promise<bigint> {
    return await publicClient.readContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'nextId'
    });
  }

  before(async () => {
    // Setup clients
    publicClient = createPublicClient({
      chain: hardhat,
      transport: http()
    });

    // Get accounts from hardhat
    hardhatAccounts = await hre.viem.getWalletClients();
    owner = hardhatAccounts[0].account.address;
    avsManager = hardhatAccounts[1].account.address;
    user1 = hardhatAccounts[2].account.address;
    user2 = hardhatAccounts[3].account.address;

    // Create wallet client for owner
    walletClient = createWalletClient({
      account: hardhatAccounts[0].account as Account,
      chain: hardhat,
      transport: http()
    });

    console.log('\n=== Contract Deployment ===');
    console.log('Owner address:', owner);
    console.log('AVS Manager address:', avsManager);
    console.log('User1 address:', user1);
    console.log('User2 address:', user2);

    try {
      // Deploy MockUSDC contract
      console.log('\nDeploying MockUSDC contract...');
      const { abi: mockUSDCAbi, bytecode: mockUSDCBytecode } = await hre.artifacts.readArtifact('MockUSDC');
      
      const mockUSDCHash = await walletClient.deployContract({
        abi: mockUSDCAbi,
        bytecode: mockUSDCBytecode as `0x${string}`
      });
      
      const mockUSDCReceipt = await publicClient.waitForTransactionReceipt({ hash: mockUSDCHash });
      
      if (!mockUSDCReceipt.contractAddress) {
        throw new Error('MockUSDC deployment failed - no contract address in receipt');
      }
      
      mockUsdc = {
        address: mockUSDCReceipt.contractAddress,
        abi: mockUSDCAbi
      };
      
      console.log('MockUSDC deployed at:', mockUsdc.address);

      // Deploy PredictionContest contract
      console.log('\nDeploying PredictionContest contract...');
      const { abi: predictionContestAbi, bytecode: predictionContestBytecode } = await hre.artifacts.readArtifact('PredictionContest');
      
      const predictionContestHash = await walletClient.deployContract({
        abi: predictionContestAbi,
        bytecode: predictionContestBytecode as `0x${string}`,
        args: [avsManager, mockUsdc.address]
      });
      
      const predictionContestReceipt = await publicClient.waitForTransactionReceipt({ hash: predictionContestHash });
      
      if (!predictionContestReceipt.contractAddress) {
        throw new Error('PredictionContest deployment failed - no contract address in receipt');
      }
      
      predictionMarket = {
        address: predictionContestReceipt.contractAddress,
        abi: predictionContestAbi
      };
      
      console.log('PredictionContest deployed at:', predictionMarket.address);

      // Mint tokens to users
      await walletClient.writeContract({
        address: mockUsdc.address,
        abi: mockUsdc.abi,
        functionName: 'mint',
        args: [user1, initialMint]
      });

      await walletClient.writeContract({
        address: mockUsdc.address,
        abi: mockUsdc.abi,
        functionName: 'mint',
        args: [user2, initialMint]
      });

    } catch (error) {
      console.error('Error during contract deployment:', error);
      throw error;
    }
  });

  it("should deploy with correct stake token and avsManager", async () => {
    const stakeToken = await publicClient.readContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'stakeToken'
    });
    
    const contractAvsManager = await publicClient.readContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'avsManager'
    });

    expect(getAddress(stakeToken)).to.equal(getAddress(mockUsdc.address));
    expect(getAddress(contractAvsManager)).to.equal(getAddress(avsManager));
  });

  it("should allow user1 to create and user2 to join, then avsManager settles (creator wins)", async () => {
    // Create wallet clients for users
    const user1WalletClient = createWalletClient({
      account: hardhatAccounts[2].account as Account,
      chain: hardhat,
      transport: http()
    });

    const user2WalletClient = createWalletClient({
      account: hardhatAccounts[3].account as Account,
      chain: hardhat,
      transport: http()
    });

    const avsManagerWalletClient = createWalletClient({
      account: hardhatAccounts[1].account as Account,
      chain: hardhat,
      transport: http()
    });

    // Get the next contest ID
    const contestId = await getNextContestId();

    // Approve and create contest
    await user1WalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount]
    });

    await user1WalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'createContest',
      args: ["Bitcoin Price Prediction", "Will Bitcoin reach $100k by end of year?", "BTC > $100k?", stakeAmount]
    });

    // Approve and join contest
    await user2WalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount]
    });

    await user2WalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'joinContest',
      args: [contestId, stakeAmount]
    });

    // Debug: Check which account is being used
    console.log("Owner address:", owner);
    console.log("AVS Manager address:", avsManager);
    console.log("Contract AVS Manager:", await publicClient.readContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'avsManager'
    }));

    // avsManager settles in favor of user1 (creator)
    const before = await publicClient.readContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'balanceOf',
      args: [user1]
    });

    await avsManagerWalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'settle',
      args: [contestId, true]
    });

    const after = await publicClient.readContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'balanceOf',
      args: [user1]
    });

    expect(after - before).to.equal(stakeAmount * 2n);
  });

  it("should allow user1 to create and user2 to join, then avsManager settles (opponent wins)", async () => {
    // Create wallet clients for users
    const user1WalletClient = createWalletClient({
      account: hardhatAccounts[2].account as Account,
      chain: hardhat,
      transport: http()
    });

    const user2WalletClient = createWalletClient({
      account: hardhatAccounts[3].account as Account,
      chain: hardhat,
      transport: http()
    });

    const avsManagerWalletClient = createWalletClient({
      account: hardhatAccounts[1].account as Account,
      chain: hardhat,
      transport: http()
    });

    // Get the next contest ID
    const contestId = await getNextContestId();

    // Approve and create contest
    await user1WalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount]
    });

    await user1WalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'createContest',
      args: ["Ethereum Merge Success", "Will Ethereum successfully complete the merge?", "ETH merge successful?", stakeAmount]
    });

    // Approve and join contest
    await user2WalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount]
    });

    await user2WalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'joinContest',
      args: [contestId, stakeAmount]
    });

    // avsManager settles in favor of user2 (opponent)
    const before = await publicClient.readContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'balanceOf',
      args: [user2]
    });

    await avsManagerWalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'settle',
      args: [contestId, false]
    });

    const after = await publicClient.readContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'balanceOf',
      args: [user2]
    });

    expect(after - before).to.equal(stakeAmount * 2n);
  });

  it("should not allow joining with wrong stake amount", async () => {
    const user1WalletClient = createWalletClient({
      account: hardhatAccounts[2].account as Account,
      chain: hardhat,
      transport: http()
    });

    const user2WalletClient = createWalletClient({
      account: hardhatAccounts[3].account as Account,
      chain: hardhat,
      transport: http()
    });

    // Get the next contest ID
    const contestId = await getNextContestId();

    await user1WalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount]
    });

    await user1WalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'createContest',
      args: ["Test Contest", "Test details", "Test statement", stakeAmount]
    });

    await user2WalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount - 1n]
    });

    await expect(
      user2WalletClient.writeContract({
        address: predictionMarket.address,
        abi: predictionMarket.abi,
        functionName: 'joinContest',
        args: [contestId, stakeAmount - 1n]
      })
    ).to.be.rejectedWith("Wrong stake");
  });

  it("should not allow joining a non-existent contest", async () => {
    const user2WalletClient = createWalletClient({
      account: hardhatAccounts[3].account as Account,
      chain: hardhat,
      transport: http()
    });

    await user2WalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount]
    });

    await expect(
      user2WalletClient.writeContract({
        address: predictionMarket.address,
        abi: predictionMarket.abi,
        functionName: 'joinContest',
        args: [99n, stakeAmount]
      })
    ).to.be.rejectedWith("Contest does not exist");
  });

  it("should not allow joining a contest twice", async () => {
    const user1WalletClient = createWalletClient({
      account: hardhatAccounts[2].account as Account,
      chain: hardhat,
      transport: http()
    });

    const user2WalletClient = createWalletClient({
      account: hardhatAccounts[3].account as Account,
      chain: hardhat,
      transport: http()
    });

    const ownerWalletClient = createWalletClient({
      account: hardhatAccounts[0].account as Account,
      chain: hardhat,
      transport: http()
    });

    // Get the next contest ID
    const contestId = await getNextContestId();

    await user1WalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount]
    });

    await user1WalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'createContest',
      args: ["Double Join Test", "Testing double join prevention", "Test statement", stakeAmount]
    });

    await user2WalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount]
    });

    await user2WalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'joinContest',
      args: [contestId, stakeAmount]
    });

    await ownerWalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount]
    });

    await expect(
      ownerWalletClient.writeContract({
        address: predictionMarket.address,
        abi: predictionMarket.abi,
        functionName: 'joinContest',
        args: [contestId, stakeAmount]
      })
    ).to.be.rejectedWith("Taken");
  });

  it("should not allow joining an inactive contest", async () => {
    const user1WalletClient = createWalletClient({
      account: hardhatAccounts[2].account as Account,
      chain: hardhat,
      transport: http()
    });

    const user2WalletClient = createWalletClient({
      account: hardhatAccounts[3].account as Account,
      chain: hardhat,
      transport: http()
    });

    const ownerWalletClient = createWalletClient({
      account: hardhatAccounts[0].account as Account,
      chain: hardhat,
      transport: http()
    });

    // Get the next contest ID
    const contestId = await getNextContestId();

    await user1WalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount]
    });

    await user1WalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'createContest',
      args: ["Inactive Test", "Testing inactive contest", "Test statement", stakeAmount]
    });

    await user2WalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount]
    });

    // First join should succeed
    await user2WalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'joinContest',
      args: [contestId, stakeAmount]
    });

    // Second join should fail because contest is now inactive
    await ownerWalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount]
    });

    await expect(
      ownerWalletClient.writeContract({
        address: predictionMarket.address,
        abi: predictionMarket.abi,
        functionName: 'joinContest',
        args: [contestId, stakeAmount]
      })
    ).to.be.rejectedWith("Taken");
  });

  it("should only allow avsManager to settle", async () => {
    const user1WalletClient = createWalletClient({
      account: hardhatAccounts[2].account as Account,
      chain: hardhat,
      transport: http()
    });

    const user2WalletClient = createWalletClient({
      account: hardhatAccounts[3].account as Account,
      chain: hardhat,
      transport: http()
    });

    // Get the next contest ID
    const contestId = await getNextContestId();

    await user1WalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount]
    });

    await user1WalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'createContest',
      args: ["Settle Test", "Testing settle permissions", "Test statement", stakeAmount]
    });

    await user2WalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount]
    });

    await user2WalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'joinContest',
      args: [contestId, stakeAmount]
    });

    await expect(
      user1WalletClient.writeContract({
        address: predictionMarket.address,
        abi: predictionMarket.abi,
        functionName: 'settle',
        args: [contestId, true]
      })
    ).to.be.rejectedWith("Only AVS");
  });

  it("should return correct contest details with new fields", async () => {
    const user1WalletClient = createWalletClient({
      account: hardhatAccounts[2].account as Account,
      chain: hardhat,
      transport: http()
    });

    // Get the next contest ID
    const contestId = await getNextContestId();

    await user1WalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount]
    });

    await user1WalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'createContest',
      args: ["Test Title", "Test Details", "Test Statement", stakeAmount]
    });

    // Get contest details
    const contest = await publicClient.readContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'getContest',
      args: [contestId]
    });

    expect(contest[0].toLowerCase()).to.equal(user1.toLowerCase()); // creator
    expect(contest[1]).to.equal("Test Title"); // title
    expect(contest[2]).to.equal("Test Details"); // details
    expect(contest[3]).to.equal("Test Statement"); // statement
    expect(contest[4]).to.equal(stakeAmount); // stake
    expect(contest[5]).to.equal("0x0000000000000000000000000000000000000000"); // opponent (empty)
    expect(contest[6]).to.equal(false); // settled
    expect(contest[7]).to.equal(false); // verdict
    expect(contest[8]).to.equal(true); // active
  });

  it("should return all contests with getContests function", async () => {
    const user1WalletClient = createWalletClient({
      account: hardhatAccounts[2].account as Account,
      chain: hardhat,
      transport: http()
    });

    const user2WalletClient = createWalletClient({
      account: hardhatAccounts[3].account as Account,
      chain: hardhat,
      transport: http()
    });

    // Create multiple contests
    await user1WalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount * 3n]
    });

    await user1WalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'createContest',
      args: ["Contest 1", "Details 1", "Statement 1", stakeAmount]
    });

    await user1WalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'createContest',
      args: ["Contest 2", "Details 2", "Statement 2", stakeAmount]
    });

    await user1WalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'createContest',
      args: ["Contest 3", "Details 3", "Statement 3", stakeAmount]
    });

    // Get all contests
    const contests = await publicClient.readContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'getContests',
      args: []
    });
    console.log("contests", contests);
    expect(contests.length).to.be.greaterThan(0); // Should have contests

    // Check that the latest contests are included
    const lastIndex = contests.length - 1;
    expect(contests[lastIndex - 2].title).to.equal("Contest 1");
    expect(contests[lastIndex - 1].title).to.equal("Contest 2");
    expect(contests[lastIndex].title).to.equal("Contest 3");
    expect(contests[lastIndex - 2].details).to.equal("Details 1");
    expect(contests[lastIndex - 1].details).to.equal("Details 2");
    expect(contests[lastIndex].details).to.equal("Details 3");
    expect(contests[lastIndex - 2].active).to.equal(true); // active
    expect(contests[lastIndex - 1].active).to.equal(true); // active
    expect(contests[lastIndex].active).to.equal(true); // active

    // Verify contest structure
    for (let i = 0; i < contests.length; i++) {
      const contest = contests[i];
      expect(contest).to.have.property('creator');
      expect(contest).to.have.property('title');
      expect(contest).to.have.property('details');
      expect(contest).to.have.property('statement');
      expect(contest).to.have.property('stake');
      expect(contest).to.have.property('opponent');
      expect(contest).to.have.property('settled');
      expect(contest).to.have.property('verdict');
      expect(contest).to.have.property('active');
    }
  });

  it("should allow avsManager to emergency withdraw all tokens", async () => {
    const user1WalletClient = createWalletClient({
      account: hardhatAccounts[2].account as Account,
      chain: hardhat,
      transport: http()
    });

    const user2WalletClient = createWalletClient({
      account: hardhatAccounts[3].account as Account,
      chain: hardhat,
      transport: http()
    });

    const avsManagerWalletClient = createWalletClient({
      account: hardhatAccounts[1].account as Account,
      chain: hardhat,
      transport: http()
    });

    // DO Emergency Withdraw
    await avsManagerWalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'emergencyWithdraw',
      args: []
    });


    // Get the next contest ID
    const contestId = await getNextContestId();

    await user1WalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount]
    });

    await user1WalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'createContest',
      args: ["Emergency Test", "Testing emergency withdraw", "Test statement", stakeAmount]
    });

    await user2WalletClient.writeContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'approve',
      args: [predictionMarket.address, stakeAmount]
    });

    await user2WalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'joinContest',
      args: [contestId, stakeAmount]
    });

    // Don't settle, just emergency withdraw
    const before = await publicClient.readContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'balanceOf',
      args: [avsManager]
    });

    await avsManagerWalletClient.writeContract({
      address: predictionMarket.address,
      abi: predictionMarket.abi,
      functionName: 'emergencyWithdraw',
      args: []
    });

    const after = await publicClient.readContract({
      address: mockUsdc.address,
      abi: mockUsdc.abi,
      functionName: 'balanceOf',
      args: [avsManager]
    });

    expect(after - before).to.equal(stakeAmount * 2n);
  });
});
