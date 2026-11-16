export type OvertimeEvidenceFormProps = { id: string; busy: boolean; error: string | null; onClose: () => void; onSubmit: (input: Record<string, unknown>) => Promise<void> }
