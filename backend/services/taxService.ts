// Sales tax calculation removed - 0% tax policy across all states
export class TaxService {
  public static calculateTax(_subtotal: number, state?: string): { taxAmount: number; taxRate: number; state: string } {
    return {
      taxAmount: 0,
      taxRate: 0,
      state: (state || '').trim().toUpperCase(),
    };
  }
}

