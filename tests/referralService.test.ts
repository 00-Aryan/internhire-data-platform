import { ReferralService, IReferralRepository, ReferralDTO, ReferralChainItem } from '@/core/referral/referralService';

// Mock Repository
const mockRepo = {
  findByCandidateId: jest.fn(),
  findByReferralCode: jest.fn(),
  create: jest.fn(),
  updateReferrer: jest.fn(),
  lockReferral: jest.fn(),
  getReferralChain: jest.fn(),
} as unknown as jest.Mocked<IReferralRepository>;

describe('ReferralService', () => {
  let service: ReferralService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReferralService(mockRepo);
  });

  describe('getOrCreateReferral', () => {
    it('should return existing referral if found', async () => {
      // Arrange
      const existing = { id: 'ref_1', candidateId: 'c1', referralCode: 'CODE1' } as ReferralDTO;
      mockRepo.findByCandidateId.mockResolvedValue(existing);

      // Act
      const result = await service.getOrCreateReferral('c1');

      // Assert
      expect(result).toBe(existing);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should generate new referral code if missing (lazy generation)', async () => {
      // Arrange
      mockRepo.findByCandidateId.mockResolvedValue(null);
      mockRepo.findByReferralCode.mockResolvedValue(null); // No collision
      
      const created = { id: 'ref_new', candidateId: 'c1', referralCode: 'NEWCODE' } as ReferralDTO;
      mockRepo.create.mockResolvedValue(created);

      // Act
      const result = await service.getOrCreateReferral('c1');
      
      // Assert
      expect(result).toBe(created);
      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        candidateId: 'c1',
        referralCode: expect.any(String)
      }));
    });
  });

  describe('setReferrer', () => {
    const candidateId = 'cand_A';
    const referrerCode = 'REF_B';
    const referrerId = 'cand_B';

    it('should throw if referrer code is invalid', async () => {
      mockRepo.findByReferralCode.mockResolvedValue(null);
      await expect(service.setReferrer(candidateId, 'INVALID')).rejects.toThrow('Invalid referral code');
    });

    it('should block self-referral', async () => {
      // Arrange: Code belongs to the candidate themselves
      mockRepo.findByReferralCode.mockResolvedValue({ candidateId: candidateId } as ReferralDTO);
      
      // Act & Assert
      await expect(service.setReferrer(candidateId, 'REF_A')).rejects.toThrow('Self-referral is not allowed');
    });

    it('should block referral change if locked (ACTIVE subscription exists)', async () => {
      // Arrange
      mockRepo.findByReferralCode.mockResolvedValue({ candidateId: referrerId } as ReferralDTO);
      // Candidate is locked
      mockRepo.findByCandidateId.mockResolvedValue({ isLocked: true } as ReferralDTO);

      // Act & Assert
      await expect(service.setReferrer(candidateId, referrerCode)).rejects.toThrow('Referrer is already locked');
    });

    it('should block circular referral (A -> B -> A)', async () => {
      // Arrange
      // A tries to refer B. B already refers to A.
      mockRepo.findByReferralCode.mockResolvedValue({ candidateId: referrerId } as ReferralDTO); // B
      mockRepo.findByCandidateId.mockResolvedValue({ isLocked: false } as ReferralDTO); // A not locked
      
      // B's chain contains A
      mockRepo.getReferralChain.mockResolvedValue([
        { candidateId: candidateId, level: 1, referralCode: 'REF_A' }
      ]);

      // Act & Assert
      await expect(service.setReferrer(candidateId, referrerCode)).rejects.toThrow('Circular referral detected');
    });

    it('should block referral depth > 2', async () => {
      // Arrange
      // A tries to refer B. B -> C -> D.
      // Adding A would make chain length 3 (A->B->C->D), which exceeds max depth of 2 for new links
      mockRepo.findByReferralCode.mockResolvedValue({ candidateId: referrerId } as ReferralDTO);
      mockRepo.findByCandidateId.mockResolvedValue({ isLocked: false } as ReferralDTO);
      
      // B has 2 parents already
      mockRepo.getReferralChain.mockResolvedValue([
        { candidateId: 'cand_C', level: 1, referralCode: 'REF_C' },
        { candidateId: 'cand_D', level: 2, referralCode: 'REF_D' }
      ]);

      // Act & Assert
      await expect(service.setReferrer(candidateId, referrerCode)).rejects.toThrow('Maximum referral depth exceeded');
    });

    it('should allow referral before first subscription (happy path)', async () => {
      // Arrange
      mockRepo.findByReferralCode.mockResolvedValue({ candidateId: referrerId } as ReferralDTO);
      // Not locked (no active subscription yet)
      mockRepo.findByCandidateId.mockResolvedValue({ 
        id: 'ref_A', 
        candidateId, 
        isLocked: false, 
        referrerId: null 
      } as ReferralDTO);
      // No circular, no depth issues
      mockRepo.getReferralChain.mockResolvedValue([]);
      
      mockRepo.updateReferrer.mockResolvedValue({ id: 'ref_A', referrerId } as ReferralDTO);

      // Act
      await service.setReferrer(candidateId, referrerCode);

      // Assert
      expect(mockRepo.updateReferrer).toHaveBeenCalledWith(candidateId, referrerId);
    });
  });

  describe('lockReferral', () => {
    it('should lock referral after first ACTIVE subscription', async () => {
      // Arrange
      mockRepo.findByCandidateId.mockResolvedValue({ id: 'ref_1', isLocked: false } as ReferralDTO);
      
      // Act
      await service.lockReferral('c1');
      
      // Assert
      expect(mockRepo.lockReferral).toHaveBeenCalledWith('c1');
    });

    it('should do nothing if already locked', async () => {
      // Arrange
      mockRepo.findByCandidateId.mockResolvedValue({ id: 'ref_1', isLocked: true } as ReferralDTO);
      
      // Act
      await service.lockReferral('c1');
      
      // Assert
      expect(mockRepo.lockReferral).not.toHaveBeenCalled();
    });

    it('should throw if referral record not found', async () => {
      mockRepo.findByCandidateId.mockResolvedValue(null);
      await expect(service.lockReferral('c1')).rejects.toThrow('Referral record not found');
    });
  });

  describe('getReferralChainForRewards', () => {
    it('should delegate to repository with max depth 2', async () => {
      // Arrange
      const mockChain: ReferralChainItem[] = [
        { candidateId: 'c2', referralCode: 'REF2', level: 1 },
        { candidateId: 'c3', referralCode: 'REF3', level: 2 }
      ];
      mockRepo.getReferralChain.mockResolvedValue(mockChain);

      // Act
      const result = await service.getReferralChainForRewards('c1');

      // Assert
      expect(mockRepo.getReferralChain).toHaveBeenCalledWith('c1', 2);
      expect(result).toEqual(mockChain);
    });
  });
});