import { WalletService, IWalletRepository, TransactionType, TransactionStatus, WalletDTO, WalletTransactionDTO } from '@/core/wallet/walletService';

// Mock Repository
const mockRepo = {
  findByCandidateId: jest.fn(),
  create: jest.fn(),
  createTransaction: jest.fn(),
  findPendingTransactions: jest.fn(),
  updateTransactionStatus: jest.fn(),
  getTransactionsByCandidate: jest.fn(),
  calculateBalance: jest.fn(),
  findRewardBySubscription: jest.fn(),
} as unknown as jest.Mocked<IWalletRepository>;

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WalletService(mockRepo);
  });

  describe('createPendingReward', () => {
    const baseInput = {
      candidateId: 'cand_1',
      subscriberCandidateId: 'sub_1',
      subscriptionId: 'sub_id_1',
    };

    it('creates PENDING reward for level-1 referrer (₹40)', async () => {
      // Arrange
      mockRepo.findRewardBySubscription.mockResolvedValue(null); // No existing reward
      mockRepo.findByCandidateId.mockResolvedValue({ id: 'wallet_1' } as WalletDTO);
      
      const expectedTx = { 
        id: 'tx_1', 
        status: TransactionStatus.PENDING,
        amount: 40 
      } as WalletTransactionDTO;
      mockRepo.createTransaction.mockResolvedValue(expectedTx);

      // Act
      const result = await service.createPendingReward({
        ...baseInput,
        amount: 40,
        level: 1
      });

      // Assert
      expect(result).toBe(expectedTx);
      expect(mockRepo.createTransaction).toHaveBeenCalledWith(expect.objectContaining({
        walletId: 'wallet_1',
        candidateId: 'cand_1',
        type: TransactionType.REFERRAL_REWARD,
        status: TransactionStatus.PENDING, // Ledger entry created as PENDING
        amount: 40,
        description: expect.stringContaining('Level 1'),
        metadata: expect.objectContaining({
          level: 1,
          subscriptionId: 'sub_id_1'
        })
      }));
    });

    it('creates level-2 reward (₹10)', async () => {
      // Arrange
      mockRepo.findRewardBySubscription.mockResolvedValue(null);
      mockRepo.findByCandidateId.mockResolvedValue({ id: 'wallet_1' } as WalletDTO);
      
      const expectedTx = { id: 'tx_2', amount: 10 } as WalletTransactionDTO;
      mockRepo.createTransaction.mockResolvedValue(expectedTx);

      // Act
      const result = await service.createPendingReward({
        ...baseInput,
        amount: 10,
        level: 2
      });

      // Assert
      expect(mockRepo.createTransaction).toHaveBeenCalledWith(expect.objectContaining({
        amount: 10,
        description: expect.stringContaining('Level 2'),
        metadata: expect.objectContaining({ level: 2 })
      }));
    });

    it('skips rewards for ₹0 subscriptions (throws error)', async () => {
      // Arrange
      mockRepo.findRewardBySubscription.mockResolvedValue(null);
      mockRepo.findByCandidateId.mockResolvedValue({ id: 'wallet_1' } as WalletDTO);

      // Act & Assert
      await expect(service.createPendingReward({
        ...baseInput,
        amount: 0,
        level: 1
      })).rejects.toThrow('Reward amount must be positive');
      
      expect(mockRepo.createTransaction).not.toHaveBeenCalled();
    });

    it('skips rewards if subscription already rewarded (idempotency)', async () => {
      // Arrange
      const existingTx = { id: 'tx_existing' } as WalletTransactionDTO;
      mockRepo.findRewardBySubscription.mockResolvedValue(existingTx);

      // Act
      const result = await service.createPendingReward({
        ...baseInput,
        amount: 40,
        level: 1
      });

      // Assert
      expect(result).toBe(existingTx);
      expect(mockRepo.createTransaction).not.toHaveBeenCalled();
      expect(mockRepo.findRewardBySubscription).toHaveBeenCalledWith(
        'cand_1', 
        'sub_id_1', 
        1
      );
    });

    it('ensures ledger entry is created (not balance mutation)', async () => {
      // Arrange
      mockRepo.findRewardBySubscription.mockResolvedValue(null);
      mockRepo.findByCandidateId.mockResolvedValue({ id: 'wallet_1' } as WalletDTO);
      mockRepo.createTransaction.mockResolvedValue({} as WalletTransactionDTO);

      // Act
      await service.createPendingReward({
        ...baseInput,
        amount: 40,
        level: 1
      });

      // Assert
      // Ensure we are creating a transaction, not updating the wallet balance directly
      expect(mockRepo.createTransaction).toHaveBeenCalled();
    });
  });
});