export type OvertimeFormProps = { busy: boolean; error: string | null; approved?: boolean; onClose: () => void; onSubmit: (input: Record<string, unknown>) => Promise<void> }
