export interface ApplicationCreatedEvent {
  applicationId: string;
  jobId: string;
  candidateId: string;
  occurredAt: Date;
}

export function emitApplicationCreated(
  event: ApplicationCreatedEvent
) {
  // For now: simple synchronous emission
  // Later this can publish to:
  // - message queue
  // - event bus
  // - webhook system
  // - analytics pipeline

  console.log('[domain-event] ApplicationCreated', {
    ...event,
  });
}
