
import { WalletService, IWalletRepository, TransactionType, TransactionStatus, WalletDTO, WalletTransactionDTO } from '@/core/wallet/walletService';

// Mock Repository
const mockRepo: jest.Mocked<IWalletRepository> = {
  findByCandidateId: jest.fn(),
  create: jest.fn(),
  createTransaction: jest.fn(),
  findPendingTransactions: jest.fn(),
  updateTransactionStatus: jest.fn(),
  getTransactionsByCandidate: jest.fn(),
  calculateBalance: jest.fn(),
  findRewardBySubscription: jest.fn(),
};

describe('WalletService (Unit)', () => {
  let service: WalletService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WalletService(mockRepo);
  });

  describe('createPendingReward', () => {
    const input = {
      candidateId: 'c1',
      amount: 40,
      level: 1,
      subscriberCandidateId: 'sub_c',
      subscriptionId: 'sub_1',
    };

    it('should return existing reward if already exists (idempotency)', async () => {
      const existing = { id: 'tx_1' } as WalletTransactionDTO;
      mockRepo.findRewardBySubscription.mockResolvedValue(existing);

      const result = await service.createPendingReward(input);
      expect(result).toBe(existing);
      expect(mockRepo.createTransaction).not.toHaveBeenCalled();
    });

    it('should throw if amount is invalid', async () => {
      mockRepo.findRewardBySubscription.mockResolvedValue(null);
      await expect(service.createPendingReward({ ...input, amount: 0 }))
        .rejects.toThrow('Reward amount must be positive');
    });

    it('should throw if level is invalid', async () => {
      mockRepo.findRewardBySubscription.mockResolvedValue(null);
      mockRepo.findByCandidateId.mockResolvedValue({ id: 'w1' } as WalletDTO);
      await expect(service.createPendingReward({ ...input, level: 3 }))
        .rejects.toThrow('Reward level must be 1 or 2');
    });

    it('should create wallet if missing and create transaction', async () => {
      mockRepo.findRewardBySubscription.mockResolvedValue(null);
      mockRepo.findByCandidateId.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue({ id: 'w_new' } as WalletDTO);
      
      const mockTx = { id: 'tx_new', status: TransactionStatus.PENDING } as WalletTransactionDTO;
      mockRepo.createTransaction.mockResolvedValue(mockTx);

      const result = await service.createPendingReward(input);

      expect(mockRepo.create).toHaveBeenCalledWith('c1');
      expect(mockRepo.createTransaction).toHaveBeenCalledWith(expect.objectContaining({
        walletId: 'w_new',
        amount: 40,
        type: TransactionType.REFERRAL_REWARD,
        status: TransactionStatus.PENDING
      }));
      expect(result).toBe(mockTx);
    });
  });

  describe('getWalletSummary', () => {
    it('should calculate pending and total earned correctly', async () => {
      mockRepo.calculateBalance.mockResolvedValue(100); // Current balance
      mockRepo.getTransactionsByCandidate.mockResolvedValue([
        { amount: 50, status: TransactionStatus.PENDING } as WalletTransactionDTO,
        { amount: 30, status: TransactionStatus.PENDING } as WalletTransactionDTO,
        { amount: 100, status: TransactionStatus.CREDITED } as WalletTransactionDTO, // Already in balance
        { amount: 20, status: TransactionStatus.CREDITED } as WalletTransactionDTO,
        { amount: 10, status: TransactionStatus.CANCELLED } as WalletTransactionDTO,
      ]);

      const summary = await service.getWalletSummary('c1');

      expect(summary.balance).toBe(100);
      expect(summary.pending).toBe(80); // 50 + 30
      expect(summary.totalEarned).toBe(120); // 100 + 20
    });
  });

  describe('createAdjustment', () => {
    it('should throw if amount is zero', async () => {
      await expect(service.createAdjustment('c1', 0, 'test'))
        .rejects.toThrow('Adjustment amount cannot be zero');
    });

    it('should create CREDITED transaction immediately', async () => {
      mockRepo.findByCandidateId.mockResolvedValue({ id: 'w1' } as WalletDTO);
      
      await service.createAdjustment('c1', -50, 'Penalty');

      expect(mockRepo.createTransaction).toHaveBeenCalledWith(expect.objectContaining({
        type: TransactionType.ADJUSTMENT,
        status: TransactionStatus.CREDITED,
        amount: -50
      }));
    });
  });
});