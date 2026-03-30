import { ReferralService, IReferralRepository, ReferralDTO } from '@/core/referral/referralService';

// Mock Repository
const mockRepo: jest.Mocked<IReferralRepository> = {
  findByCandidateId: jest.fn(),
  findByReferralCode: jest.fn(),
  create: jest.fn(),
  updateReferrer: jest.fn(),
  lockReferral: jest.fn(),
  getReferralChain: jest.fn(),
};

describe('ReferralService (Unit)', () => {
  let service: ReferralService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReferralService(mockRepo);
  });

  describe('getOrCreateReferral', () => {
    it('should return existing referral if found', async () => {
      const mockReferral = { id: 'ref_1', candidateId: 'c1', referralCode: 'CODE1' } as ReferralDTO;
      mockRepo.findByCandidateId.mockResolvedValue(mockReferral);

      const result = await service.getOrCreateReferral('c1');
      expect(result).toBe(mockReferral);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should create new referral if not found', async () => {
      mockRepo.findByCandidateId.mockResolvedValue(null);
      mockRepo.findByReferralCode.mockResolvedValue(null); // No collision
      mockRepo.create.mockResolvedValue({ id: 'ref_new', candidateId: 'c1', referralCode: 'NEWCODE' } as ReferralDTO);

      const result = await service.getOrCreateReferral('c1');
      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ candidateId: 'c1' }));
    });

    it('should retry code generation on collision', async () => {
      mockRepo.findByCandidateId.mockResolvedValue(null);
      
      // Mock generateReferralCode to return predictable values for testing loop
      jest.spyOn(service, 'generateReferralCode')
        .mockReturnValueOnce('COLLISION')
        .mockReturnValueOnce('SUCCESS');

      mockRepo.findByReferralCode.mockImplementation(async (code) => {
        if (code === 'COLLISION') return { id: 'existing' } as any;
        return null;
      });
      
      mockRepo.create.mockResolvedValue({ id: 'ref_new', referralCode: 'SUCCESS' } as any);

      await service.getOrCreateReferral('c1');
      
      expect(mockRepo.findByReferralCode).toHaveBeenCalledTimes(2);
      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ referralCode: 'SUCCESS' }));
    });
  });

  describe('setReferrer', () => {
    const candidateId = 'c_new';
    const referrerCode = 'REF_OLD';
    const referrerId = 'c_old';

    beforeEach(() => {
        // Default: Referrer exists
        mockRepo.findByReferralCode.mockImplementation(async (code) => {
          if (code === referrerCode) return { candidateId: referrerId } as ReferralDTO;
          return null;
        });
        // Default: Candidate has no referral record yet (so not locked)
        mockRepo.findByCandidateId.mockResolvedValue(null);
        // Default: No circular dependency
        mockRepo.getReferralChain.mockResolvedValue([]);
        // Default: Create succeeds
        mockRepo.create.mockResolvedValue({ candidateId, referrerId: null } as ReferralDTO);
    });

    it('should throw if referrer code is invalid', async () => {
      mockRepo.findByReferralCode.mockResolvedValue(null);
      await expect(service.setReferrer(candidateId, 'INVALID')).rejects.toThrow('Invalid referral code');
    });

    it('should throw on self-referral', async () => {
      mockRepo.findByReferralCode.mockResolvedValue({ candidateId: candidateId } as ReferralDTO);
      await expect(service.setReferrer(candidateId, 'MY_CODE')).rejects.toThrow('Self-referral is not allowed');
    });

    it('should throw if candidate referral is locked', async () => {
      mockRepo.findByCandidateId.mockResolvedValue({ isLocked: true } as ReferralDTO);
      await expect(service.setReferrer(candidateId, referrerCode)).rejects.toThrow('Referrer is already locked');
    });

    it('should throw on circular referral', async () => {
      // Referrer's chain includes the candidate
      mockRepo.getReferralChain.mockResolvedValue([
        { candidateId: 'c_middle', level: 1, referralCode: 'A' },
        { candidateId: candidateId, level: 2, referralCode: 'B' } // Circular!
      ]);
      await expect(service.setReferrer(candidateId, referrerCode)).rejects.toThrow('Circular referral detected');
    });

    it('should throw if max depth exceeded', async () => {
      // Referrer already has 2 ancestors
      mockRepo.getReferralChain.mockResolvedValue([
        { candidateId: 'c_1', level: 1, referralCode: 'A' },
        { candidateId: 'c_2', level: 2, referralCode: 'B' }
      ]);
      await expect(service.setReferrer(candidateId, referrerCode)).rejects.toThrow('Maximum referral depth exceeded');
    });

    it('should update referrer if validations pass', async () => {
      mockRepo.create.mockResolvedValue({ candidateId, referrerId: null } as ReferralDTO);
      mockRepo.updateReferrer.mockResolvedValue({ candidateId, referrerId } as ReferralDTO);

      const result = await service.setReferrer(candidateId, referrerCode);
      
      expect(mockRepo.updateReferrer).toHaveBeenCalledWith(candidateId, referrerId);
      expect(result.referrerId).toBe(referrerId);
    });
  });

  describe('lockReferral', () => {
    it('should lock referral if not already locked', async () => {
      mockRepo.findByCandidateId.mockResolvedValue({ isLocked: false } as any);
      await service.lockReferral('c1');
      expect(mockRepo.lockReferral).toHaveBeenCalledWith('c1');
    });

    it('should do nothing if already locked', async () => {
      mockRepo.findByCandidateId.mockResolvedValue({ isLocked: true } as any);
      await service.lockReferral('c1');
      expect(mockRepo.lockReferral).not.toHaveBeenCalled();
    });
  });

  describe('getReferralChainForRewards', () => {
    it('should delegate to repository with depth 2', async () => {
      await service.getReferralChainForRewards('c1');
      expect(mockRepo.getReferralChain).toHaveBeenCalledWith('c1', 2);
    });
  });
});